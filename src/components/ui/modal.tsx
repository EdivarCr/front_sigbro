import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "./button"
import { XIcon } from "@phosphor-icons/react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {onClose && (
            <Button variant="ghost" size="md" onClick={onClose} className="shrink-0 -mt-1 -mr-1 p-1 hover:bg-(--bg-sidebar)">
              <XIcon size={24} />
            </Button>
          )}
        </DialogHeader>
        
        {description && (
          <DialogDescription>{description}</DialogDescription>
        )}

        {children && (
          <div className="flex flex-col gap-4">
            {children}
          </div>
        )}

        {footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}