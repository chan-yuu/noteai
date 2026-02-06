'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { DiagramAIContent } from './DiagramAIContent'

interface DiagramAIDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DiagramAIDialog({ open, onOpenChange }: DiagramAIDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] h-[95vh] p-0">
        <DiagramAIContent />
      </DialogContent>
    </Dialog>
  )
}
