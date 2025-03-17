"use client"

import { useState } from "react"
import { X, Tag, FolderTree, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"

export default function Sidebar({ isOpen, onClose, links }) {
  const [activeTab, setActiveTab] = useState("tags")
  const isMobile = useMobile()

  // Extract all unique tags
  const allTags = [...new Set(links.flatMap((link) => link.tags))]

  // Extract all categories
  const categories = [...new Set(links.map((link) => link.category))]

  // Group links by date (today, yesterday, this week, this month, older)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const thisWeekStart = new Date(today)
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const linksByDate = {
    today: links.filter((link) => new Date(link.dateAdded) >= today),
    yesterday: links.filter((link) => {
      const date = new Date(link.dateAdded)
      return date >= yesterday && date < today
    }),
    thisWeek: links.filter((link) => {
      const date = new Date(link.dateAdded)
      return date >= thisWeekStart && date < yesterday
    }),
    thisMonth: links.filter((link) => {
      const date = new Date(link.dateAdded)
      return date >= thisMonthStart && date < thisWeekStart
    }),
    older: links.filter((link) => new Date(link.dateAdded) < thisMonthStart),
  }

  return (
    <div
      className={`
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        ${isMobile ? "fixed inset-y-0 left-0 z-50 w-72" : "w-64"} 
        bg-background border-r transition-transform duration-200 ease-in-out
      `}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Browse Links</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex border-b">
        <Button
          variant={activeTab === "tags" ? "default" : "ghost"}
          className="flex-1 rounded-none"
          onClick={() => setActiveTab("tags")}
        >
          <Tag className="h-4 w-4 mr-2" />
          Tags
        </Button>
        <Button
          variant={activeTab === "categories" ? "default" : "ghost"}
          className="flex-1 rounded-none"
          onClick={() => setActiveTab("categories")}
        >
          <FolderTree className="h-4 w-4 mr-2" />
          Categories
        </Button>
        <Button
          variant={activeTab === "recent" ? "default" : "ghost"}
          className="flex-1 rounded-none"
          onClick={() => setActiveTab("recent")}
        >
          <Clock className="h-4 w-4 mr-2" />
          Recent
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-112px)]">
        {activeTab === "tags" && (
          <div className="p-4">
            <h3 className="text-sm font-medium mb-2">All Tags ({allTags.length})</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer">
                  {tag} ({links.filter((link) => link.tags.includes(tag)).length})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="p-4">
            <h3 className="text-sm font-medium mb-2">Categories</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: getCategoryColor(category) }}
                    />
                    <span>{category}</span>
                  </div>
                  <Badge variant="outline">{links.filter((link) => link.category === category).length}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "recent" && (
          <div className="p-4 space-y-4">
            {Object.entries(linksByDate).map(([period, periodLinks]) => {
              if (periodLinks.length === 0) return null

              return (
                <div key={period}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium capitalize">{period}</h3>
                    <Badge variant="outline">{periodLinks.length}</Badge>
                  </div>

                  <div className="space-y-1 pl-6">
                    {periodLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm truncate py-1 hover:underline"
                        title={link.title}
                      >
                        {link.title}
                      </a>
                    ))}
                  </div>

                  <Separator className="mt-4" />
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
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

