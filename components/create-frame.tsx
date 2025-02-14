"use client"

import { lazy, Suspense, useState } from "react"
import { createFrame } from "@/app/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import type React from "react"
import LoadingDots from "./LoadingDots"

const FrameCreatedDialog = lazy(() => import("./FrameCreatedDialog"))

export function CreateFrame() {
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newCreateFrame, setNewCreateFrame] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [frameId, setFrameId] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const frame = {
      name: formData.get("name") as string,
      price: formData.get("price") as string,
      sizes: (formData.get("sizes") as string).split(",").map((s) => s.trim()),
      type: formData.get("type") as string,
      categories: (formData.get("categories") as string).split(",").map((c) => c.trim()),
      color: (formData.get("color") as string).split(",").map((c) => c.trim()),
      desc: formData.get("desc") as string,
      images: (formData.get("images") as string).split(",").map((i) => i.trim()),
      keywords: (formData.get("keywords") as string).split(",").map((k) => k.trim()),
    }

    const result = await createFrame(frame)
    if (result.success) {
      setNewCreateFrame(`https://rivo.gallery/frame/${result.id}?type=${result.firsttype}&size=${result.firstsize}&color=${result.firstcolor}`)
      // @ts-ignore
      setFrameId(result.id)
      setIsDialogOpen(true)
      toast.success("Frame created successfully")
    } else {
      toast.error(result.error || "Failed to create frame")
    }
    setLoading(false)
  }

  return (
    <div className="border p-4 rounded-lg">
      <Button onClick={() => setIsCreating(!isCreating)}>{isCreating ? "Cancel" : "Create A New Frame"}</Button>

      {isCreating && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input name="name" required placeholder="product name" />
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
            <label className="block text-sm font-medium mb-1">Colors (comma-separated)</label>
            <Input name="color" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea name="desc" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Images (comma-separated)</label>
            <Input name="images" required placeholder="do not forget the extension (eg: .png, .jpg)" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
            <Input name="keywords" required />
          </div>

          {!loading && <Button type="submit">Add Frame</Button>}
        </form>
      )}

      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-90 z-50">
          <LoadingDots />
        </div>
      )}
      <Suspense fallback={<LoadingDots />}>
        <FrameCreatedDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          frameId={frameId}
          frameUrl={newCreateFrame}
        />
      </Suspense>

    </div>
  )
}