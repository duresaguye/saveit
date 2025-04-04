"use client"

import { useState } from "react"
import { Folder, MoreHorizontal, Edit, Trash2, Share, FolderOpen, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useDrop } from "react-dnd"
import { toast } from "sonner"


interface FolderCardProps {
  folder: {
    id: string;
    name: string;
    links: { id: string }[];
  };
  onOpen: (folder: { id: string; name: string; links: { id: string }[] }) => void;
  onEdit: (folder: { id: string; name: string; links: { id: string }[] }) => void;
  onDelete: (folder: { id: string; name: string; links: { id: string }[] }) => void;
  onShare: (folder: { id: string; name: string; links: { id: string }[] }) => void;
  onDropLink: (folderId: string, linkId: string) => void;
  onAddLink: (linkId: string, folderId: string) => void;
}

export default function FolderCard({ folder, onOpen, onEdit, onDelete, onShare, onDropLink, onAddLink }: FolderCardProps) {

  const [isHovering, setIsHovering] = useState(false)

  // Setup drop target for links
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "LINK",
    drop: (item: { id: string }) => {
      onDropLink(folder.id, (item as { id: string }).id)
      toast(`Added to "${folder.name}"`,
      )
      return { folderName: folder.name }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  // Visual feedback for drag and drop
  const isActive = isOver && canDrop
  const dropStyle = isActive ? "border-primary border-dashed bg-primary/10" : canDrop ? "border-dashed" : ""

  return (
    <Card
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`${dropStyle} transition-all duration-200 ${isHovering ? "shadow-md" : ""}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm flex items-center gap-2">
            <Folder className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            {folder.name}
          </CardTitle>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpen(folder)}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Open Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddLink("new-link-id", folder.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Link to Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(folder)}>
                <Share className="h-4 w-4 mr-2" />
                Share Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(folder)}>
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(folder)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 pb-2">
        <p className="text-xs text-muted-foreground">
          {folder.links.length} {folder.links.length === 1 ? "link" : "links"}
        </p>
      </CardContent>
    </Card>
  )
}

