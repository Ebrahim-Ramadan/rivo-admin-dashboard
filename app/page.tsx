// app/page.tsx
// "use client";

import { SearchFrames } from "@/components/search-frames";
import { CreateFrame } from "@/components/create-frame";
// import { BatchPush } from "./actions";
// import { useTransition } from 'react';

export default function Home() {
  // const [isPending, startTransition] = useTransition();

  // const handleBatchPush = () => {
  //   startTransition(async () => {
  //     await BatchPush();
  //   });
  // };

  return (
    <main className="container mx-auto p-4 pt-8">
      {/* <form action={handleBatchPush}>
        <button type="submit" disabled={isPending}>
          {isPending ? "Pushing..." : "Push Frames"}
        </button>
      </form> */}
      <div className="grid gap-8">
        <SearchFrames />
        <CreateFrame />
      </div>
    </main>
  );
}
