// app/page.tsx

import { SearchFrames } from "@/components/search-frames";
import { CreateFrame } from "@/components/create-frame";
import { ExcelUpload } from "@/components/excel-upload";
// import { Ass } from "@/components/ass";


export default function Home() {


  return (
    <main className="container mx-auto p-4 pt-8">
    
      <div className="grid gap-8">
        <SearchFrames />
        <CreateFrame />
        <ExcelUpload/>
      </div>
      {/* <Ass/> */}
    </main>
  );
}
