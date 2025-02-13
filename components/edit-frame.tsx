"use client"

import type { Frame } from "@/types/frame"
import { updateFrame} from "@/app/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type React from "react" // Import React

interface EditFrameProps {
  frame: Frame
  onClose: () => void
  onSuccess: () => void
}

export function EditFrame({ frame, onClose, onSuccess }: EditFrameProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const updatedFrame = {
      name: formData.get("name") as string,
      price: formData.get("price") as string,
      sizes: (formData.get("sizes") as string).split(",").map((s) => s.trim()),
      type: formData.get("type") as string,
      categories: (formData.get("categories") as string).split(",").map((c) => c.trim()),
      color: (formData.get("color") as string).split(",").map((c) => c.trim()), // Convert color to an array of strings
      desc: formData.get("desc") as string,
      images: (formData.get("images") as string).split(",").map((i) => i.trim()),
      keywords: (formData.get("keywords") as string).split(",").map((k) => k.trim()),
    }

    const result = await updateFrame(frame.id, updatedFrame)
    if (result.success) {
      toast.success("Frame updated successfully")
      onSuccess()
    } else {
      toast.error(result.error || "Failed to update frame")
    }
  }



  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Frame</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input name="name" defaultValue={frame.name} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <Input name="price" defaultValue={frame.price} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sizes</label>
            <Input name="sizes" defaultValue={frame.sizes.join(", ")} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <Input name="type" defaultValue={frame.type} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categories</label>
            <Input name="categories" defaultValue={frame.categories.join(", ")} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <Input name="color" defaultValue={frame.color} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea name="desc" defaultValue={frame.desc} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Images</label>
            <Input name="images" defaultValue={frame.images.join(", ")} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Keywords</label>
            <Input name="keywords" defaultValue={frame.keywords.join(", ")} required />
          </div>

          <div className="flex justify-between">
            <Button type="submit">Update Frame</Button>
           
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

