"use client"

import { useState } from "react"
import { createFrame } from "@/app/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import type React from "react" // Added import for React

export function CreateFrame() {
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const frame = {
      name: formData.get("name") as string,
      price: formData.get("price") as string,
      sizes: (formData.get("sizes") as string).split(",").map((s) => s.trim()),
      type: formData.get("type") as string,
      categories: (formData.get("categories") as string).split(",").map((c) => c.trim()),
      color: formData.get("color") as string,
      desc: formData.get("desc") as string,
      images: (formData.get("images") as string).split(",").map((i) => i.trim()),
      keywords: (formData.get("keywords") as string).split(",").map((k) => k.trim()),
    }

    const result = await createFrame(frame)
    if (result.success) {
      toast.success("Frame created successfully")
      // e.currentTarget.reset()
    } else {
      toast.error(result.error || "Failed to create frame")
    }
  }

  return (
    <div className="border p-4 rounded-lg">
      <Button onClick={() => setIsCreating(!isCreating)}>{isCreating ? "Cancel" : "Create New Frame"}</Button>

      {isCreating && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input name="name" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <Input name="price" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sizes (comma-separated)</label>
            <Input name="sizes" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <Input name="type" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categories (comma-separated)</label>
            <Input name="categories" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <Input name="color" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea name="desc" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Images (comma-separated)</label>
            <Input name="images" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
            <Input name="keywords" required />
          </div>

          <Button type="submit">Create Frame</Button>
        </form>
      )}
    </div>
  )
}

