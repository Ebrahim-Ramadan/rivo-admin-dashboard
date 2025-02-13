"use server";

import type { Frame, SearchResult } from "@/types/frame";
import { revalidatePath } from "next/cache";
import redis from "@/lib/redis";
import { z } from "zod";
import * as fs from 'fs';
import * as path from 'path';
import {frames as importedFrames} from '@/lib/combined.js';

const frameSchema = z.object({
  name: z.string().min(1),
  price: z.string().min(1),
  sizes: z.array(z.string()),
  type: z.string().min(1),
  categories: z.array(z.string()),
  color: z.string().min(1),
  desc: z.string().min(1),
  images: z.array(z.string()),
  keywords: z.array(z.string()),
});

export async function createFrame(
  frame: Omit<Frame, "id">,
): Promise<{ success: boolean; error?: string }> {
  try {
    const validation = frameSchema.safeParse(frame);
    if (!validation.success) {
      return { success: false, error: validation.error.message };
    }

    const id = `frame_${Date.now()}`;
    console.log('id', id);
    
    await redis.set(`frames:${id}`, JSON.stringify({ ...frame, id }));
    // Removed SADD (not critical here)
    return { success: true };
  } catch (error) {
    console.error("Error creating frame:", error);
    return { success: false, error: "Failed to create frame" };
  }
}

export async function deleteFrame(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await redis.del(`frames:${id}`);
    // Removed SREM (not critical here)
    return { success: true };
  } catch (error) {
    console.error("Error deleting frame:", error);
    return { success: false, error: "Failed to delete frame" };
  }
}

export async function updateFrame(
  id: string,
  frame: Partial<Frame>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await redis.get(`frames:${id}`);
    if (!existing) {
      return { success: false, error: "Frame not found" };
    }
    // @ts-ignore
    const parsedExisting = JSON.parse(existing) as Frame;
    const updated = { ...parsedExisting, ...frame };
    const validation = frameSchema.safeParse(updated);
    if (!validation.success) {
      return { success: false, error: validation.error.message };
    }

    await redis.set(`frames:${id}`, JSON.stringify(updated));
    // revalidatePath("/frames");
    return { success: true };
  } catch (error) {
    console.error("Error updating frame:", error);
    return { success: false, error: "Failed to update frame" };
  }
}



export async function searchFrames(id: string): Promise<SearchResult> {
  try {
    const frame = await redis.get(`frames:${id}`);
    console.log('frame', typeof frame);
    
    if (frame) {
      return {
        frames: [frame as Frame], // Wrap the frame in an array
        total: 1,
      };
    } else {
      return { frames: [], total: 0 }; // Frame not found
    }
  } catch (error) {
    console.error(`Error getting frame ${id}:`, error);
    return { frames: [], total: 0 };
  }
}





export async function BatchPush(): Promise<{ success: boolean; error?: string }> {
  try {

    if (!Array.isArray(importedFrames)) {
      console.error("Error: JSON data is not an array.");
      return { success: false, error: "JSON data is not an array." };
    }

    // Create a pipeline
    const pipeline = redis.pipeline();

    for (let i = 0; i < importedFrames.length; i++) {
      const frame = importedFrames[i];
      const id = `frame_${Date.now()}_${i}`; // Generate ID here (include index for uniqueness)
      const frameWithId = { ...frame, id };

      try {
        // Add commands to the pipeline
        pipeline.set(`frames:${id}`, JSON.stringify(frameWithId));
        pipeline.sadd("frame_ids", id);
      } catch (pipelineError) {
        console.error(`Error adding frame ${i} to pipeline:`, pipelineError);
        return { success: false, error: `Error adding frame ${i} to pipeline: ${String(pipelineError)}` };
      }
    }

    try {
      // Execute the pipeline
      const results = await pipeline.exec();

      // Process the results (optional)
      for (let i = 0; i < results.length; i += 2) {
        const set_result = results[i];
        const sadd_result = results[i + 1];
        // @ts-ignore
        if (set_result.error) {
        // @ts-ignore
          console.error(`Error setting frame ${i/2}: ${frames[i/2].name}. Error: ${set_result.error}`);
        }
        // @ts-ignore
        if (sadd_result.error) {
        // @ts-ignore
          console.error(`Error adding frame ID ${i/2}: ${frames[i/2].name}. Error: ${sadd_result.error}`);
        }
      }
    } catch (execError) {
      console.error("Error executing pipeline:", execError);
      return { success: false, error: `Error executing pipeline: ${String(execError)}` };
    }

    console.log("Finished importing frames.");
    return { success: true };
  } catch (error) {
    console.error("Error importing frames:", error);
    return { success: false, error: String(error) };
  }
}
