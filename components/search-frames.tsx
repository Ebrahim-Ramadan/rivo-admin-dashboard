"use client"

import { useState } from "react"
import type { Frame } from "@/types/frame"
import { deleteFrame, searchFrames } from "@/app/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EditFrame } from "./edit-frame"
import { toast } from "sonner"

export function SearchFrames() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Frame[]>([])
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    const result = await searchFrames(query)
    setResults(result.frames)
  }

  const handleDelete = async (id : string) => {
    if (!confirm("Are you sure you want to delete this frame?")) return
// @ts-ignore
    const result = await deleteFrame(id)
    if (result.success) {
      toast.success("Frame deleted successfully")
      setResults((prevResults) =>
          prevResults.filter((frame) => frame.id !== id)
        );
    } else {
      toast.error(result.error || "Failed to delete frame")
    }
  }
  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        <a href="ordersshit" className="navbararrow">ORDERS &#8594;</a>
      </div>
      <div className="flex gap-2">
        <Input type="text" placeholder="Enter Product ID..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {results.length > 0 && (
        <div className="grid gap-4">
          {results.map((frame) => (
            <div key={frame.id} className="border p-4 rounded-lg">
              <h3 className="font-bold">{frame.name}</h3>
              <p className="text-sm text-gray-600">{frame.type}</p>
              <div className="mt-2 flex justify-between">
                <Button variant="outline" onClick={() => setSelectedFrame(frame)}>
                  Edit
                </Button>
                <Button type="button" variant="destructive" onClick={()=>handleDelete(frame.id)}>
        Delete
      </Button>
              </div>
            </div>
          ))}
        </div>
      )
      // :
      // (
      //   query.trim()!=''&&
      //   <p className="text-center">No Frames Found</p>
      // )
      }

      {selectedFrame && (
       <EditFrame
       frame={selectedFrame}
       onClose={() => setSelectedFrame(null)}
       onSuccess={() => {
         setSelectedFrame(null)
         // handleSearch()
       }}
     />
      )}
    </div>
  )
}

