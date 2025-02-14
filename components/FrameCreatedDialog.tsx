"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { copyToClipboard } from "@/lib/utils"
import Link from "next/link"
import { toast } from "sonner"

interface FrameCreatedDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  frameId: string
  frameUrl: string
}

function FrameCreatedDialog({ isOpen, onOpenChange, frameId, frameUrl }: FrameCreatedDialogProps) {
  const handleCopyId = () => {
    copyToClipboard(frameId)
    toast.success("Frame ID copied to clipboard")
  }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Frame Created Successfully</DialogTitle>
          <DialogDescription>
            Your frame has been created. You can copy the frame ID or visit the product page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button onClick={handleCopyId}>Copy Frame ID</Button>
          <Link href={frameUrl} target="_blank">
            <Button variant="outline">Visit Product on Rivo</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FrameCreatedDialog