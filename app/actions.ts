"use server"

import type { Frame, SearchResult } from "@/types/frame"
import { revalidatePath } from "next/cache"
import { kv } from "@vercel/kv"
import { z } from "zod"

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
})

export async function createFrame(frame: Omit<Frame, "id">): Promise<{ success: boolean; error?: string }> {
  try {
    const validation = frameSchema.safeParse(frame)
    if (!validation.success) {
      return { success: false, error: validation.error.message }
    }

    const id = `frame_${Date.now()}`
    await kv.set(`frames:${id}`, { ...frame, id })
    await kv.sadd("frame_ids", id)
    revalidatePath("/frames")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to create frame" }
  }
}

export async function updateFrame(id: string, frame: Partial<Frame>): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await kv.get(`frames:${id}`)
    if (!existing) {
      return { success: false, error: "Frame not found" }
    }

    const updated = { ...existing, ...frame }
    const validation = frameSchema.safeParse(updated)
    if (!validation.success) {
      return { success: false, error: validation.error.message }
    }

    await kv.set(`frames:${id}`, updated)
    revalidatePath("/frames")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update frame" }
  }
}

export async function deleteFrame(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await kv.del(`frames:${id}`)
    await kv.srem("frame_ids", id)
    revalidatePath("/frames")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete frame" }
  }
}

export async function searchFrames(query: string): Promise<SearchResult> {
  try {
    const ids = await kv.smembers("frame_ids")
    const frames = await Promise.all(
      ids.map(async (id) => {
        const frame = await kv.get(`frames:${id}`)
        return frame as Frame
      }),
    )

    const filtered = frames.filter(
      (frame) =>
        frame.name.toLowerCase().includes(query.toLowerCase()) ||
        frame.keywords.some((k) => k.toLowerCase().includes(query.toLowerCase())),
    )

    return {
      frames: filtered,
      total: filtered.length,
    }
  } catch (error) {
    return { frames: [], total: 0 }
  }
}

