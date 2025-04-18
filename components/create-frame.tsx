"use client"

import { lazy, Suspense, useState } from "react"
import { createFrame } from "@/app/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import type React from "react"
import LoadingDots from "./LoadingDots"
import { supabase } from "@/lib/supabase"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select" // Import Select components from shadcn

const FrameCreatedDialog = lazy(() => import("./FrameCreatedDialog"))

// Define the array of category options
const categoryOptions = [
  'Movies',
  'Series',
  'Musics',
  'Ar Musics',
  'Superheroes',
  'Cars',
  'Art',
  'Sports',
  'posters set',
  'cairokee frames',
  'Classic Old Films',
  'Frame sets',
  'Framed vinyls',
  'Vinyls',
  "Rivo and Davnci"
]

export function CreateFrame() {
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, seterror] = useState("")
  const [newCreateFrame, setNewCreateFrame] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [frameId, setFrameId] = useState<string>('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]) // State to store selected categories

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
  
    const formData = new FormData(e.currentTarget)
    const imageFiles = formData.getAll("images") as File[]
  
    // Upload images to Supabase Storage
    const uploadedImageUrls = await Promise.all(
      imageFiles.map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`
  
        // Upload the file to Supabase Storage
        const { error } = await supabase.storage
          .from("frames") 
          .upload(fileName, file)
  
        if (error) {
          throw new Error(`Failed to upload image: ${error.message}`)
        }
  
        return fileName
      })
    )

    const frame = {
      name: formData.get("name") as string,
      price: formData.get("price") as string,
      sizes: (formData.get("sizes") as string).split(",").map((s) => s.trim()),
      type: formData.get("type") as string,
      categories: selectedCategories, // Use the selected categories from state
      color: (formData.get("color") as string).split(",").map((c) => c.trim()),
      desc: formData.get("desc") as string,
      images: uploadedImageUrls, // Store the public URLs of the uploaded images
      keywords:(formData.get("keywords") as string)
       .split(",")
       .map((k) => k.trim())
       .flatMap((keyword) => generatePrefixes(keyword)),
    }
  
    const result = await createFrame(frame)
    console.log('result', result)
    
    if (result.success) {
      setNewCreateFrame(`https://rivo.gallery/frame/${result.id}?type=${result.firsttype}&size=${result.firstsize}&color=${result.firstcolor}`)
      // @ts-ignore
      setFrameId(result.id)
      setIsDialogOpen(true)
      toast.success("Frame created successfully")
    } else {
      seterror(result.error || "Failed to create frame")
      toast.error(result.error || "Failed to create frame")
    }
    setLoading(false)
  }

  return (
    <div className="border p-4 rounded-lg">
      <Button onClick={() => setIsCreating(!isCreating)}>{isCreating ? "Cancel" : "Create A New Product"}</Button>

      {isCreating && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4" encType="multipart/form-data">
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
            <label className="block text-sm font-medium mb-1">Categories</label>
            <Select
              onValueChange={(value) => {
                setSelectedCategories((prev) => [...prev, value]) // Add selected category to state
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select categories" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category, index) => (
                  <SelectItem key={index} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <label className="block text-sm font-medium mb-1">Images</label>
            <Input name="images" type="file" multiple required accept="image/*" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
            <Input name="keywords" required />
          </div>

          {!loading && <Button type="submit">Add Product</Button>}
        </form>
      )}

      {error.length>0 && (
        <div className="fixed inset-0 flex justify-center items-center bg-white text-red-500 z-50">
          {error}
        </div>
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
function generatePrefixes(str: string) {
  const prefixes = [];
  for (let i = 1; i <= str.length; i++) {
    prefixes.push(str.substring(0, i));
  }
  return prefixes;
}