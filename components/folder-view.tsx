"use client"

import { useState } from "react"
import { ArrowLeft, FolderPlus, Share, Trash2, ExternalLink, MoreHorizontal, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ShareModal from "@/components/share-modal"
import { toast } from "sonner"


interface FolderViewProps {
  folder: {
    id: string;
    name: string;
    links: string[];
  };
  links: {
    id: string;
    title: string;
    url: string;
    description?: string;
    category: string;
    tags: string[];
  }[];
  onBack: () => void;
  onRemoveLink: (folderId: string, linkId: string) => void;
  onShareFolder: (folder: { id: string; name: string; links: string[] }) => void;
  onAddLink: (folderId: string) => void;
}

interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  tags: string[];
}

export default function FolderView({ folder, links, onBack, onRemoveLink, onShareFolder, onAddLink }: FolderViewProps) {

  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedLink, setSelectedLink] = useState<Link | null>(null)
  const [viewMode, setViewMode] = useState("grid") // grid or mindmap

  // Get the actual link objects from their IDs
  const folderLinks: Link[] = folder.links.map((linkId) => links.find((link) => link.id === linkId)).filter((link): link is Link => link !== undefined) // Remove any undefined links (in case a link was deleted)

  interface Link {
    id: string;
    title: string;
    url: string;
    description?: string;
    category: string;
    tags: string[];
  }

  const handleRemoveLink = (linkId: string) => {
    onRemoveLink(folder.id, linkId);
    toast("Link removed from folder");
  };

  const handleShareFolder = () => {
    onShareFolder(folder)
  }

  const handleShareLink = (link: Link) => {
    setSelectedLink(link)
    setShareModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Folders
        </Button>

        <div className="flex gap-2">
          <div className="border rounded-md flex overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "mindmap" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("mindmap")}
              className="rounded-none"
            >
              Mind Map
            </Button>
          </div>
          <Button variant="outline" onClick={handleShareFolder}>
            <Share className="h-4 w-4 mr-2" />
            Share Folder
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{folder.name}</h2>
          <p className="text-muted-foreground">
            {folderLinks.length} {folderLinks.length === 1 ? "link" : "links"}
          </p>
        </div>

        <Button onClick={() => onAddLink(folder.id)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Link to Folder
        </Button>
      </div>

      {folderLinks.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <FolderPlus className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
          <h3 className="text-lg font-medium mb-2">This folder is empty</h3>
          <p className="text-muted-foreground mb-4">Drag and drop links into this folder to organize them.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folderLinks.map((link) => link && link.id && (
            <LinkCard
              key={link.id}
              link={link}
              onRemove={() => handleRemoveLink(link.id)}
              onShare={() => handleShareLink(link)}
            />
          ))}
        </div>
      ) : (
        <MindMapView links={folderLinks} onRemove={handleRemoveLink} onShare={handleShareLink} />
      )}

      {selectedLink && (
        <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} link={selectedLink} />
      )}
    </div>
  )
}

function LinkCard({ link, onRemove, onShare }: { link: Link; onRemove: () => void; onShare: () => void }) {
  return (
    <Card className="cursor-move">
      <CardHeader className="p-3 pb-1">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base truncate" title={link.title}>
            {link.title}
          </CardTitle>

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
              <DropdownMenuItem onClick={onShare}>
                <Share className="h-4 w-4 mr-2" />
                Share Link
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onRemove}>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove from Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <Badge variant="outline">{link.category}</Badge>
        {link.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
        {link.tags.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{link.tags.length - 2}
          </Badge>
        )}
      </CardFooter>
    </Card>
  )
}

function MindMapView({ links, onRemove, onShare }: { links: Link[], onRemove: (id: string) => void, onShare: (link: Link) => void }) {
  const [selectedNode, setSelectedNode] = useState<Link | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  // Find connections between links based on shared tags
  const connections: { source: string; target: string; commonTags: string[] }[] = []
  links.forEach((source, i) => {
    links.slice(i + 1).forEach((target) => {
      const commonTags = source.tags.filter((tag) => target.tags.includes(tag))
      if (commonTags.length > 0) {
        connections.push({
          source: source.id,
          target: target.id,
          commonTags,
        })
      }
    })
  })

  const handleNodeClick = (link: Link) => {
    setSelectedNode(link)
  }

  const handleShareLink = (link: Link) => {
    onShare(link)
  }

  return (
    <div className="h-[600px] flex flex-col">
      <div className="flex-1 relative border rounded-lg overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <svg className="w-full h-full">
          {/* Center node */}
          <g transform={`translate(${400}, ${300})`} className="cursor-pointer">
            <circle
              r={40}
              fill={`url(#gradient-other)`}
              filter="url(#drop-shadow)"
              className="transition-all duration-300"
            />
            <text textAnchor="middle" dy=".3em" fill="white" fontSize="14" fontWeight="bold" className="select-none">
              {links.length} Links
            </text>
          </g>

          {/* Draw connections from center to nodes */}
          {links.map((link, index) => {
            // Calculate position in a circle around the center
            const angle = (index / links.length) * 2 * Math.PI
            const radius = 200
            const x = 400 + radius * Math.cos(angle)
            const y = 300 + radius * Math.sin(angle)

            return (
              <g key={`node-${link.id}`}>
                <line
                  x1={400}
                  y1={300}
                  x2={x}
                  y2={y}
                  stroke="rgba(180, 180, 180, 0.3)"
                  strokeWidth={1.5}
                  strokeDasharray="5,5"
                />
                <g transform={`translate(${x}, ${y})`} onClick={() => handleNodeClick(link)} className="cursor-pointer">
                  <rect
                    x={-70}
                    y={-30}
                    width={140}
                    height={60}
                    rx={12}
                    fill={`url(#gradient-${link.category.toLowerCase()})`}
                    className="transition-all duration-300"
                  />
                  <text
                    textAnchor="middle"
                    dy="-0.5em"
                    fill="white"
                    fontSize="13"
                    fontWeight="bold"
                    className="select-none"
                  >
                    {link.title.length > 15 ? link.title.substring(0, 15) + "..." : link.title}
                  </text>
                  <text
                    textAnchor="middle"
                    dy="1.5em"
                    fill="rgba(255,255,255,0.8)"
                    fontSize="10"
                    className="select-none"
                  >
                    {link.category}
                  </text>
                </g>
              </g>
            )
          })}

          {/* Draw connections between related nodes */}
          {connections.map((connection, index) => {
            const sourceIndex = links.findIndex((link) => link.id === connection.source)
            const targetIndex = links.findIndex((link) => link.id === connection.target)

            if (sourceIndex === -1 || targetIndex === -1) return null

            const sourceAngle = (sourceIndex / links.length) * 2 * Math.PI
            const targetAngle = (targetIndex / links.length) * 2 * Math.PI
            const radius = 200

            const x1 = 400 + radius * Math.cos(sourceAngle)
            const y1 = 300 + radius * Math.sin(sourceAngle)
            const x2 = 400 + radius * Math.cos(targetAngle)
            const y2 = 300 + radius * Math.sin(targetAngle)

            return (
              <g key={`connection-${index}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(100, 100, 100, 0.2)"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
                <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`}>
                  <circle r={3} fill="#888" />
                </g>
              </g>
            )
          })}

          {/* Define gradients for categories */}
          <defs>
            {[
              "Development",
              "Design",
              "Marketing",
              "Business",
              "Education",
              "Entertainment",
              "News",
              "Social",
              "Productivity",
              "Hosting",
              "Other",
            ].map((category) => (
              <linearGradient
                key={category}
                id={`gradient-${category.toLowerCase()}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={getCategoryColor(category)} />
                <stop offset="100%" stopColor={adjustColorBrightness(getCategoryColor(category), -20)} />
              </linearGradient>
            ))}

            {/* Define drop shadow filter */}
            <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="2" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.2" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-background/90 p-3 rounded-md border shadow-md">
          <div className="text-sm font-medium mb-2">Categories:</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {["Development", "Design", "Hosting", "Marketing", "Business", "Other"].map((category) => (
              <div key={category} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${getCategoryColor(category)}, ${adjustColorBrightness(getCategoryColor(category), -20)})`,
                  }}
                />
                <span className="text-xs">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected node details */}
      {selectedNode && (
        <Card
          className="mt-4 relative shadow-lg border-t-4"
          style={{ borderTopColor: getCategoryColor(selectedNode.category) }}
        >
          <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => setSelectedNode(null)}>
            <Trash2 className="h-4 w-4" />
          </Button>

          <CardHeader className="pb-2">
            <CardTitle>{selectedNode.title}</CardTitle>
            <CardDescription>
              <a
                href={selectedNode.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-1"
              >
                {selectedNode.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-2">
            {selectedNode.description && <p className="text-sm text-muted-foreground">{selectedNode.description}</p>}
          </CardContent>

          <CardFooter className="flex justify-between items-center">
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline">{selectedNode.category}</Badge>
              {selectedNode.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleShareLink(selectedNode)}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onRemove(selectedNode.id)
                  setSelectedNode(null)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {shareModalOpen && selectedNode && (
        <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} link={selectedNode} />
      )}
    </div>
  )
}

// Helper function to get a color based on category
interface CategoryColors {
  [key: string]: string;
}

function getCategoryColor(category: string): string {
  const colors: CategoryColors = {
    Development: "#3b82f6", // blue
    Design: "#ec4899", // pink
    Marketing: "#f97316", // orange
    Business: "#10b981", // emerald
    Education: "#8b5cf6", // violet
    Entertainment: "#f43f5e", // rose
    News: "#64748b", // slate
    Social: "#06b6d4", // cyan
    Productivity: "#eab308", // yellow
    Hosting: "#6366f1", // indigo
    Other: "#6b7280", // gray
  };

  return colors[category] || colors["Other"];
}

function adjustColorBrightness(hex: string, percent: number): string {
  // Convert hex to RGB
  let r = Number.parseInt(hex.substring(1, 3), 16);
  let g = Number.parseInt(hex.substring(3, 5), 16);
  let b = Number.parseInt(hex.substring(5, 7), 16);

  // Adjust brightness
  r = Math.max(0, Math.min(255, r + percent));
  g = Math.max(0, Math.min(255, g + percent));
  b = Math.max(0, Math.min(255, b + percent));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}


