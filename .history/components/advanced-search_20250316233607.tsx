"use client"

import { useState } from "react"
import { Search, Filter, X, Save, Clock, Calendar, Tag, FolderTree } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function AdvancedSearch({ links, onSearch }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    categories: [],
    tags: [],
    dateRange: "all",
  })
  const { toast } = useToast()

  // Extract all unique categories and tags
  const allCategories = [...new Set(links.map((link) => link.category))]
  const allTags = [...new Set(links.flatMap((link) => link.tags))]

  const handleSearch = () => {
    // Apply filters
    let filteredLinks = [...links]

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredLinks = filteredLinks.filter(
        (link) =>
          link.title.toLowerCase().includes(query) ||
          link.url.toLowerCase().includes(query) ||
          (link.description && link.description.toLowerCase().includes(query)) ||
          link.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Category filter
    if (filters.categories.length > 0) {
      filteredLinks = filteredLinks.filter((link) => filters.categories.includes(link.category))
    }

    // Tag filter
    if (filters.tags.length > 0) {
      filteredLinks = filteredLinks.filter((link) => link.tags.some((tag) => filters.tags.includes(tag)))
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date()
      const cutoffDate = new Date()

      switch (filters.dateRange) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case "week":
          cutoffDate.setDate(now.getDate() - 7)
          break
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case "year":
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filteredLinks = filteredLinks.filter((link) => new Date(link.dateAdded) >= cutoffDate)
    }

    // Pass filtered links to parent
    onSearch(filteredLinks)

    // Close popover
    setIsOpen(false)
  }

  const saveSearch = () => {
    // In a real app, this would save the search to user preferences
    toast({
      title: "Search saved",
      description: "Your search has been saved for future use",
    })
  }

  const clearFilters = () => {
    setFilters({
      categories: [],
      tags: [],
      dateRange: "all",
    })

    if (!searchQuery) {
      onSearch(links)
    }
  }

  const toggleCategory = (category) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const toggleTag = (tag) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const hasActiveFilters = filters.categories.length > 0 || filters.tags.length > 0 || filters.dateRange !== "all"

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search links, tags, or categories..."
            className="pl-8 pr-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (!e.target.value && !hasActiveFilters) {
                onSearch(links)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch()
              }
            }}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => {
                setSearchQuery("")
                if (!hasActiveFilters) {
                  onSearch(links)
                }
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={hasActiveFilters ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Added
                </h3>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 days</SelectItem>
                    <SelectItem value="month">Last 30 days</SelectItem>
                    <SelectItem value="year">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <FolderTree className="h-4 w-4" />
                  Categories
                </h3>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {allCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <Label htmlFor={`category-${category}`} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={filters.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t">
                <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!hasActiveFilters}>
                  <X className="h-3 w-3 mr-2" />
                  Clear
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={saveSearch}>
                    <Save className="h-3 w-3 mr-2" />
                    Save
                  </Button>

                  <Button size="sm" onClick={handleSearch}>
                    <Search className="h-3 w-3 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 mt-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          {filters.dateRange !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {filters.dateRange === "today"
                ? "Today"
                : filters.dateRange === "week"
                  ? "Last 7 days"
                  : filters.dateRange === "month"
                    ? "Last 30 days"
                    : "Last year"}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => setFilters((prev) => ({ ...prev, dateRange: "all" }))}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.categories.map((category) => (
            <Badge key={category} variant="secondary" className="flex items-center gap-1">
              <FolderTree className="h-3 w-3" />
              {category}
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => toggleCategory(category)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {tag}
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => toggleTag(tag)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

