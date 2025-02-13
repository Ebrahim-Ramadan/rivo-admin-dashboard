import { SearchFrames } from "@/components/search-frames"
import { CreateFrame } from "@/components/create-frame"

export default function Home() {
  return (
    <main className="container mx-auto p-4 pt-8">

     
      <div className="grid gap-8">
        <SearchFrames />
        <CreateFrame />
      </div>
    </main>
  )
}

