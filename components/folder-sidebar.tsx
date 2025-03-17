"use client"

import { useState } from "react"
import { FolderPlus, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import FolderCard from "@/components/folder-card"
import { Input } from "@/components/ui/input"
import { useDrop } from "react-dnd"
import { toast } from "sonner"


// Update the function signature to include onAddLink
export default function FolderSidebar({
  folders,
  onOpenFolder,
  onEditFolder,
  onDeleteFolder,
  onShareFolder,
  onDropLink,
  onCreateFolder,
  onAddLink,
  onClose,
}) {
  const [searchQuery, setSearchQuery] = useState("")


  // Setup drop target for the sidebar itself
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "LINK",
    drop: (item, monitor) => {
      // If dropped directly on the sidebar (not on a specific folder)
      // We'll prompt to create a new folder with this link
      if (!monitor.didDrop()) {
        onCreateFolder(item.id)
        toast("Create a new folder to add this link",
        )
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  })

  const filteredFolders = folders.filter((folder) => {
    if (!searchQuery) return true
    return folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Visual feedback for drag and drop
  const isActive = isOver && canDrop
  const dropStyle = isActive ? "border-primary border-dashed bg-primary/10" : canDrop ? "border-dashed" : ""

  return (
    <div ref={drop} className={`w-80 border-l bg-background h-full flex flex-col ${dropStyle}`}>
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold">Folders</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onClose} title="Close sidebar">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 border-b">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search folders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => onCreateFolder()}>
            <FolderPlus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {filteredFolders.length === 0 ? (
          <div className="text-center py-8">
            <FolderPlus className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-sm font-medium mb-2">No folders yet</h3>
            <p className="text-xs text-muted-foreground mb-4">Create folders to organize your links.</p>
            <Button size="sm" onClick={() => onCreateFolder()}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Folder
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onOpen={onOpenFolder}
                onEdit={onEditFolder}
                onDelete={onDeleteFolder}
                onShare={onShareFolder}
                onDropLink={onDropLink}
                onAddLink={onAddLink}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground">Drag and drop links to organize them into folders</p>
      </div>
    </div>
  )
}

