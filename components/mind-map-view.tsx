"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, ExternalLink, X, Share, Check } from "lucide-react"
import ShareModal from "@/components/share-modal"
import { useDrag } from "react-dnd"

interface Link {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  tags: string[];
}

interface MindMapViewProps {
  links: Link[];
  onDelete: (id: string) => void;
  isMultiSelectMode?: boolean;
  selectedLinks?: string[];
  onToggleSelect?: (id: string) => void;
}

export default function MindMapView({
  links,
  onDelete,
  isMultiSelectMode = false,
  selectedLinks = [],
  onToggleSelect = () => {},
}: MindMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<Array<Link & { x: number; y: number }>>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [hoverNode, setHoverNode] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null)

  // Create a single drag handler at the component level
  const [{ isDragging }, drag] = useDrag({
    type: "LINK",
    item: () => ({
      id: draggedNodeId,
      type: "LINK",
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: draggedNodeId !== null,
  })

  // Store node refs in a ref object
  const nodeRefs = useRef({})

  useEffect(() => {
    if (!containerRef.current || links.length === 0) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    // Create nodes with positions in a mind map layout
    const newNodes = links.map((link, index) => {
      // Create a radial layout
      const angle = (index / links.length) * 2 * Math.PI
      const radius = Math.min(width, height) * 0.35

      return {
        ...link,
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle),
      }
    })

    setNodes(newNodes)
  }, [links, containerRef])

  // Apply drag ref to the currently dragged node
  useEffect(() => {
    if (draggedNodeId) {
      const nodeElement = document.querySelector(`[data-node-id="${draggedNodeId}"]`)
      if (nodeElement) {
        drag(nodeElement)
      }
    }
  }, [draggedNodeId, drag])

  interface Node extends Link {
    x: number;
    y: number;
  }

  interface HandleNodeClickProps {
    node: Node;
  }

  const handleNodeClick = ({ node }: HandleNodeClickProps) => {
    if (isMultiSelectMode) {
      onToggleSelect(node.id);
    } else {
      setSelectedNode(node);
    }
  };

  interface GetCategoryGradientProps {
    category: string;
  }

  const getCategoryGradient = ({ category }: GetCategoryGradientProps): string => {
    const baseColor = getCategoryColor(category)
    // Create a slightly darker version for gradient
    const darkerColor = adjustColorBrightness({ hex: baseColor, percent: -20 })
    return `url(#gradient-${category.toLowerCase()})`
  }

  return (
    <div className="h-full flex flex-col">
      <div
        className="flex-1 relative border rounded-lg overflow-hidden bg-gradient-to-b from-background to-muted/30"
        ref={containerRef}
      >
        {/* Mind map visualization */}
        <svg className="w-full h-full">
          <defs>
            {/* Define gradients for each category */}
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
                <stop offset="100%" stopColor={adjustColorBrightness({ hex: getCategoryColor(category), percent: -20 })} />
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

            {/* Define glow filter for selected nodes */}
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feFlood floodColor="hsl(var(--primary))" floodOpacity="0.5" result="glow" />
              <feComposite in="glow" in2="blur" operator="in" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Center node */}
          <g
            transform={`translate(${containerRef.current ? containerRef.current.clientWidth / 2 : 500}, ${containerRef.current ? containerRef.current.clientHeight / 2 : 300})`}
            className="cursor-pointer"
          >
            <circle
              r={40}
              fill="url(#gradient-other)"
              filter="url(#drop-shadow)"
              className="transition-all duration-300"
            />
            <circle
              r={40}
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
              strokeDasharray="4 4"
              className="animate-[spin_60s_linear_infinite]"
            />
            <text textAnchor="middle" dy=".3em" fill="white" fontSize="14" fontWeight="bold" className="select-none">
              Links
            </text>
          </g>

          {/* Draw connections from center to nodes */}
          {nodes.map((node) => (
            <line
              key={`center-${node.id}`}
              x1={(containerRef.current ? containerRef.current.clientWidth / 2 : 500)}
              y1={(containerRef.current?.clientHeight ?? 600) / 2}
              x2={node.x}
              y2={node.y}
              stroke="rgba(180, 180, 180, 0.3)"
              strokeWidth={selectedLinks.includes(node.id) ? 3 : 1.5}
              strokeDasharray={selectedLinks.includes(node.id) ? "none" : "5,5"}
              className="transition-all duration-300"
            />
          ))}

          {/* Draw nodes */}
          {nodes.map((node) => {
            const isSelected = selectedLinks.includes(node.id)
            const isHovered = hoverNode === node.id

            return (
              <g
                key={node.id}
                data-node-id={node.id}
                onClick={() => handleNodeClick({ node })}
                onMouseEnter={() => setHoverNode(node.id)}
                onMouseLeave={() => setHoverNode(null)}
                onMouseDown={() => setDraggedNodeId(node.id)}
                onMouseUp={() => setDraggedNodeId(null)}
                className="cursor-pointer transition-transform duration-300"
                style={{
                  transform: `translate(${node.x}px, ${node.y}px) scale(${isHovered ? 1.05 : 1})`,
                  opacity: isDragging && draggedNodeId === node.id ? 0.5 : 1,
                }}
              >
                {/* Node shadow */}
                <rect
                  x={-70}
                  y={-30}
                  width={140}
                  height={60}
                  rx={12}
                  fill="rgba(0,0,0,0.2)"
                  filter="url(#drop-shadow)"
                  className="transition-all duration-300"
                  style={{ opacity: isHovered ? 0.8 : 0.4 }}
                />

                {/* Main node */}
                <rect
                  x={-70}
                  y={-30}
                  width={140}
                  height={60}
                  rx={12}
                  fill={getCategoryGradient({ category: node.category })}
                  className={`transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-90"}`}
                  filter={isSelected ? "url(#glow)" : ""}
                />

                {/* Selection indicator */}
                {isSelected && (
                  <>
                    <rect
                      x={-73}
                      y={-33}
                      width={146}
                      height={66}
                      rx={14}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      className="animate-pulse"
                    />
                    <circle cx={-55} cy={-20} r={10} fill="hsl(var(--primary))" className="text-primary-foreground" />
                    <Check className="h-4 w-4 text-primary-foreground" x={-57} y={-22} />
                  </>
                )}

                {/* Node title */}
                <text
                  textAnchor="middle"
                  dy=".3em"
                  fill="white"
                  fontSize="13"
                  fontWeight="bold"
                  className="select-none drop-shadow-md"
                >
                  {node.title.length > 15 ? node.title.substring(0, 15) + "..." : node.title}
                </text>

                {/* Category indicator */}
                <text textAnchor="middle" y="20" fill="rgba(255,255,255,0.8)" fontSize="10" className="select-none">
                  {node.category}
                </text>
              </g>
            )
          })}
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
                    background: `linear-gradient(135deg, ${getCategoryColor(category)}, ${adjustColorBrightness({ hex: getCategoryColor(category), percent: -20 })})`,
                  }}
                />
                <span className="text-xs">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected node details */}
      {selectedNode && !isMultiSelectMode && (
        <Card
          className="mt-4 relative shadow-lg border-t-4"
          style={{ borderTopColor: getCategoryColor(selectedNode.category) }}
        >
          <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => setSelectedNode(null)}>
            <X className="h-4 w-4" />
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
              <Button variant="outline" size="sm" onClick={() => setShareModalOpen(true)}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDelete(selectedNode.id)
                  setSelectedNode(null)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
      {selectedNode && shareModalOpen && (
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

// Helper function to adjust color brightness
interface AdjustColorBrightnessProps {
  hex: string;
  percent: number;
}

function adjustColorBrightness({ hex, percent }: AdjustColorBrightnessProps): string {
  // Convert hex to RGB
  let r = Number.parseInt(hex.substring(1, 3), 16)
  let g = Number.parseInt(hex.substring(3, 5), 16)
  let b = Number.parseInt(hex.substring(5, 7), 16)

  // Adjust brightness
  r = Math.max(0, Math.min(255, r + percent))
  g = Math.max(0, Math.min(255, g + percent))
  b = Math.max(0, Math.min(255, b + percent))

  // Convert back to hex
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

