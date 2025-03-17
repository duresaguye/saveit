"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, ExternalLink, Share } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ShareModal from "@/components/share-modal"
import { useDrag } from "react-dnd"

// Node component that safely uses the useDrag hook
function GraphNode({ node, selectedNode, selectedLinks, handleNodeClick }) {
  const [{ isDragging }, drag] = useDrag({
    type: "LINK",
    item: { id: node.id, type: "LINK" },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <g
      key={node.id}
      ref={drag}
      transform={`translate(${node.x}, ${node.y})`}
      onClick={() => handleNodeClick(node)}
      className="cursor-pointer"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <circle
        r={node.id === selectedNode?.id ? 25 : 20}
        fill={getCategoryColor(node.category)}
        opacity={0.8}
        className={`transition-all duration-300 ${selectedLinks.includes(node.id) ? "stroke-primary stroke-2" : ""}`}
      />
      {selectedLinks.includes(node.id) && (
        <circle r={24} fill="none" stroke="currentColor" strokeWidth={2} className="text-primary" />
      )}
      <text textAnchor="middle" dy=".3em" fill="white" fontSize="10" fontWeight="bold">
        {node.title.substring(0, 2).toUpperCase()}
      </text>
    </g>
  )
}

// Update the component to properly handle refs and hooks
export default function GraphView({
  links,
  onDelete,
  isMultiSelectMode = false,
  selectedLinks = [],
  onToggleSelect = () => {},
}) {
  const containerRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [draggedNodeId, setDraggedNodeId] = useState(null)

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

  // Add mouse event handlers to the container
  const handleMouseDown = (e) => {
    const nodeElement = e.target.closest("[data-node-id]")
    if (nodeElement) {
      const nodeId = nodeElement.getAttribute("data-node-id")
      setDraggedNodeId(nodeId)
    }
  }

  const handleMouseUp = () => {
    setDraggedNodeId(null)
  }

  useEffect(() => {
    if (!containerRef.current || links.length === 0) return

    // In a real implementation, we would use a proper graph visualization library
    // like D3.js, Sigma.js, or react-force-graph
    // For this demo, we'll create a simple force-directed layout

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    // Create nodes with positions
    const newNodes = links.map((link, index) => {
      // Create a circular layout
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

  const handleNodeClick = (node) => {
    if (isMultiSelectMode) {
      onToggleSelect(node.id)
    } else {
      setSelectedNode(node)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div
        className="flex-1 relative border rounded-lg overflow-hidden"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Graph visualization */}
        <svg className="w-full h-full">
          {/* Draw connections between related nodes */}
          {nodes.map((source, i) =>
            nodes.slice(i + 1).map((target, j) => {
              // Connect nodes that share at least one tag
              const hasCommonTag = source.tags.some((tag) => target.tags.includes(tag))
              if (!hasCommonTag) return null

              return (
                <line
                  key={`${source.id}-${target.id}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="rgba(100, 100, 100, 0.2)"
                  strokeWidth={1}
                />
              )
            }),
          )}

          {/* Draw nodes */}
          {nodes.map((node) => {
            return (
              <g
                key={node.id}
                ref={(el) => (nodeRefs.current[node.id] = el)}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => handleNodeClick(node)}
                className="cursor-pointer"
                data-node-id={node.id}
              >
                <circle
                  r={node.id === selectedNode?.id ? 25 : 20}
                  fill={getCategoryColor(node.category)}
                  opacity={0.8}
                  className={`transition-all duration-300 ${selectedLinks.includes(node.id) ? "stroke-primary stroke-2" : ""}`}
                />
                {selectedLinks.includes(node.id) && (
                  <circle r={24} fill="none" stroke="currentColor" strokeWidth={2} className="text-primary" />
                )}
                <text textAnchor="middle" dy=".3em" fill="white" fontSize="10" fontWeight="bold">
                  {node.title.substring(0, 2).toUpperCase()}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/80 p-2 rounded-md border">
          <div className="text-sm font-medium mb-1">Categories:</div>
          <div className="flex flex-wrap gap-2">
            {["Development", "Design", "Hosting", "Other"].map((category) => (
              <div key={category} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(category) }} />
                <span className="text-xs">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected node details */}
      {selectedNode && !isMultiSelectMode && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{selectedNode.title}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <svg width="15" height="3" viewBox="0 0 15 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M1.5 1.5C1.5 1.89782 1.65804 2.27936 1.93934 2.56066C2.22064 2.84196 2.60218 3 3 3C3.39782 3 3.77936 2.84196 4.06066 2.56066C4.34196 2.27936 4.5 1.89782 4.5 1.5C4.5 1.10218 4.34196 0.720644 4.06066 0.43934C3.77936 0.158035 3.39782 0 3 0C2.60218 0 2.22064 0.158035 1.93934 0.43934C1.65804 0.720644 1.5 1.10218 1.5 1.5ZM7.5 1.5C7.5 1.89782 7.65804 2.27936 7.93934 2.56066C8.22064 2.84196 8.60218 3 9 3C9.39782 3 9.77936 2.84196 10.0607 2.56066C10.342 2.27936 10.5 1.89782 10.5 1.5C10.5 1.10218 10.342 0.720644 10.0607 0.43934C9.77936 0.158035 9.39782 0 9 0C8.60218 0 8.22064 0.158035 7.93934 0.43934C7.65804 0.720644 7.5 1.10218 7.5 1.5ZM13.5 1.5C13.5 1.89782 13.658 2.27936 13.9393 2.56066C14.2206 2.84196 14.6022 3 15 3C15.3978 3 15.7794 2.84196 16.0607 2.56066C16.342 2.27936 16.5 1.89782 16.5 1.5C16.5 1.10218 16.342 0.720644 16.0607 0.43934C15.7794 0.158035 15.3978 0 15 0C14.6022 0 14.2206 0.158035 13.9393 0.43934C13.658 0.720644 13.5 1.10218 13.5 1.5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => window.open(selectedNode.url, "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShareModalOpen(true)}>
                    <Share className="h-4 w-4 mr-2" />
                    Share Link
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      onDelete(selectedNode.id)
                      setSelectedNode(null)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
          <CardFooter className="flex flex-wrap gap-1 pt-0">
            <Badge variant="outline">{selectedNode.category}</Badge>
            {selectedNode.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
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
function getCategoryColor(category) {
  const colors = {
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
  }

  return colors[category] || colors["Other"]
}

