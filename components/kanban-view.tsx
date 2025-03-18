"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, ExternalLink, MoreHorizontal, Share } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ShareModal from "@/components/share-modal"
import { useEffect, useRef, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { useDrag } from "react-dnd"

// Update the component to properly handle refs and hooks
interface LinkCardProps {
  link: {
    id: string;
    title: string;
    url: string;
    description?: string;
    tags: string[];
    category: string;
  };
  onDelete: (id: string) => void;
  isMultiSelectMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}

function LinkCard({ link, onDelete, isMultiSelectMode, isSelected, onToggleSelect }: LinkCardProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const cardRef = useRef(null)

  // We'll use a ref to store the link ID for the drag operation
  const linkIdRef = useRef(link.id)

  // Update the ref when the link ID changes
  useEffect(() => {
    linkIdRef.current = link.id
  }, [link.id])

  // Setup drag source
  const [{ isDragging }, drag] = useDrag({
    type: "LINK",
    item: () => ({
      id: linkIdRef.current,
      type: "LINK",
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  // Apply the drag ref to the card
  useEffect(() => {
    drag(cardRef)
  }, [drag])

  return (
    <Card
      ref={cardRef}
      className={`shadow-sm ${isSelected ? "ring-2 ring-primary" : ""} ${isDragging ? "opacity-50" : ""} cursor-move`}
    >
      {/* Rest of the card content remains the same */}
      <CardHeader className="p-3 pb-1">
        <div className="flex justify-between items-start">
          {isMultiSelectMode ? (
            <div className="flex items-center gap-2">
              <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} id={`select-${link.id}`} />
              <CardTitle className="text-base truncate" title={link.title}>
                {link.title}
              </CardTitle>
            </div>
          ) : (
            <CardTitle className="text-base truncate" title={link.title}>
              {link.title}
            </CardTitle>
          )}

          {!isMultiSelectMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.open(link.url, "_blank")}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShareModalOpen(true)}>
                  <Share className="h-4 w-4 mr-2" />
                  Share Link
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(link.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <CardDescription className="truncate text-xs" title={link.url}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center gap-1"
          >
            {new URL(link.url).hostname}
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardDescription>
      </CardHeader>
      {link.description && (
        <CardContent className="p-3 pt-0 pb-1">
          <p className="text-xs text-muted-foreground line-clamp-2">{link.description}</p>
        </CardContent>
      )}
      <CardFooter className="p-3 pt-1 flex flex-wrap gap-1">
        {link.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
        {link.tags.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{link.tags.length - 3}
          </Badge>
        )}
      </CardFooter>
      {shareModalOpen && <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} link={link} />}
    </Card>
  )
}

interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  category: string;
}

interface KanbanViewProps {
  links: Link[];
  onDelete: (id: string) => void;
  isMultiSelectMode?: boolean;
  selectedLinks?: string[];
  onToggleSelect?: (id: string) => void;
}

export default function KanbanView({
  links,
  onDelete,
  isMultiSelectMode = false,
  selectedLinks = [],
  onToggleSelect = () => {},
}: KanbanViewProps) {
  // Group links by category
  const categories = [...new Set(links.map((link) => link.category))]

  return (
    <div className="h-full overflow-x-auto">
      <div className="flex gap-4 h-full pb-4" style={{ minWidth: categories.length * 320 + "px" }}>
        {categories.map((category) => (
          <div key={category} className="w-80 flex-shrink-0">
            <div className="bg-muted rounded-t-lg p-3 font-medium">
              {category} ({links.filter((link) => link.category === category).length})
            </div>
            <div className="bg-muted/50 rounded-b-lg p-2 h-[calc(100%-48px)] overflow-y-auto">
              <div className="space-y-3">
                {links
                  .filter((link) => link.category === category)
                  .map((link) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      onDelete={onDelete}
                      isMultiSelectMode={isMultiSelectMode}
                      isSelected={selectedLinks.includes(link.id)}
                      onToggleSelect={() => onToggleSelect(link.id)}
                    />
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

