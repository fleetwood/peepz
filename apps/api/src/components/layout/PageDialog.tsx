"use client"

import { useLayout } from "@/context/LayoutProvider"
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog"

const PageDialog = () => {
  const { dialog, closeDialog } = useLayout()
    
  return dialog &&
    <Dialog open={true} onOpenChange={closeDialog}>
      <DialogTitle>{dialog.title}</DialogTitle>
      <DialogContent>{dialog.children}</DialogContent>
    </Dialog>
}

PageDialog.displayName = "PageDialog"
export default PageDialog