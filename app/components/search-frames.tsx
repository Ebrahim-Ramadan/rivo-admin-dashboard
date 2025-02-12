"use client"

import { useState } from "react"
import type { Frame } from "@/types/frame"
import { searchFrames } from "../actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EditFrame } from "./edit-frame"

export function SearchFrames() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Frame[]>([])
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    const result = await searchFrames(query)
    setResults(result.frames)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input type="text" placeholder="Search frames..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {results.length > 0 && (
        <div className="grid gap-4">
          {results.map((frame) => (
            <div key={frame.id} className="border p-4 rounded-lg">
              <h3 className="font-bold">{frame.name}</h3>
              <p className="text-sm text-gray-600">{frame.type}</p>
              <div className="mt-2">
                <Button variant="outline" onClick={() => setSelectedFrame(frame)}>
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFrame && (
        <EditFrame
          frame={selectedFrame}
          onClose={() => setSelectedFrame(null)}
          onSuccess={() => {
            setSelectedFrame(null)
            handleSearch()
          }}
        />
      )}
    </div>
  )
}

