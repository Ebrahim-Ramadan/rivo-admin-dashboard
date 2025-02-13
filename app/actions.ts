"use server";

import type { Frame, SearchResult } from "@/types/frame";
import { z } from "zod";
import { frames as importedFrames } from '@/lib/combined.js';
import supabase from '@/lib/supabase';

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

    const { data, error } = await supabase
      .from('frames') // Replace 'frames' with your table name
      .insert([frame])
      .select();

    if (error) {
      console.error("Supabase error creating frame:", error);
      return { success: false, error: `Failed to create frame: ${error.message}` };
    }

    // Assuming Supabase returns the inserted data with the ID
    if (data && data.length > 0) {
      // revalidatePath("/frames"); // Revalidate if needed
      return { success: true };
    } else {
      return { success: false, error: "Failed to create frame (no data returned)" };
    }
  } catch (error: any) {
    console.error("Error creating frame:", error);
    return { success: false, error: `Failed to create frame: ${error.message}` };
  }
}

export async function deleteFrame(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('frames') // Replace 'frames' with your table name
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Supabase error deleting frame:", error);
      return { success: false, error: `Failed to delete frame: ${error.message}` };
    }

    // revalidatePath("/frames"); // Revalidate if needed
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting frame:", error);
    return { success: false, error: `Failed to delete frame: ${error.message}` };
  }
}

export async function updateFrame(
  id: string,
  frame: Partial<Frame>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('frames') // Replace 'frames' with your table name
      .update(frame)
      .eq('id', id);

    if (error) {
      console.error("Supabase error updating frame:", error);
      return { success: false, error: `Failed to update frame: ${error.message}` };
    }

    // revalidatePath("/frames"); // Revalidate if needed
    return { success: true };
  } catch (error: any) {
    console.error("Error updating frame:", error);
    return { success: false, error: `Failed to update frame: ${error.message}` };
  }
}

export async function searchFrames(id: string): Promise<SearchResult> {
  try {
    const { data, error } = await supabase
      .from('frames') // Replace 'frames' with your table name
      .select('*')
      .eq('id', id);

    if (error) {
      console.error("Supabase error searching frames:", error);
      return { frames: [], total: 0 };
    }

    if (data && data.length > 0) {
      return {
        frames: data as Frame[],
        total: 1,
      };
    } else {
      return { frames: [], total: 0 }; // Frame not found
    }
  } catch (error: any) {
    console.error("Error searching frames:", error);
    return { frames: [], total: 0 };
  }
}

export async function BatchPush(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!Array.isArray(importedFrames)) {
      console.error("Error: JSON data is not an array.");
      return { success: false, error: "JSON data is not an array." };
    }

    // Prepare data for insertion
    const framesToInsert = importedFrames.map(frame => ({
      ...frame,
      // You might need to transform or add data here
    }));

    const { error } = await supabase
      .from('frames') // Replace 'frames' with your table name
      .insert(importedFrames);

    if (error) {
      console.error("Supabase error batch inserting frames:", error);
      return { success: false, error: `Failed to batch insert frames: ${error.message}` };
    }

    console.log("Finished batch inserting frames.");
    return { success: true };
  } catch (error: any) {
    console.error("Error batch inserting frames:", error);
    return { success: false, error: `Failed to batch insert frames: ${error.message}` };
  }
}
