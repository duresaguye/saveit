"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Folder, FolderPlus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function FolderModal({ isOpen, onClose, folder = null, onSave }) {
  const [folderName, setFolderName] = useState("")
  const [addLinksAfter, setAddLinksAfter] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFolderName(folder ? folder.name : "")
    }
  }, [isOpen, folder])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!folderName.trim()) return

    if (folder) {
      // Edit existing folder
      onSave(
        {
          ...folder,
          name: folderName,
        },
        addLinksAfter,
      )
    } else {
      // Create new folder
      onSave(
        {
          id: Date.now().toString(),
          name: folderName,
          links: [],
          dateCreated: new Date().toISOString(),
        },
        addLinksAfter,
      )
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {folder ? (
              <>
                <Folder className="h-5 w-5" />
                Edit Folder
              </>
            ) : (
              <>
                <FolderPlus className="h-5 w-5" />
                Create New Folder
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              placeholder="My Folder"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="add-links-after" checked={addLinksAfter} onCheckedChange={setAddLinksAfter} />
              <Label htmlFor="add-links-after">Add links to this folder after creation</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!folderName.trim()}>
              {folder ? "Save Changes" : "Create Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

