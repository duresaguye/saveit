"use client"

import { useState, useEffect } from "react"
import { LinkIcon, Globe, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AISummarizer from "@/components/ai-summarizer"

const categories = [
  "Development",
  "Design",
  "Marketing",
  "Business",
  "Education",
  "Entertainment",
  "News",
  "Social",
  "Productivity",
  "Other",
]

// Update the component to show which folder we're adding to
export default function AddLinkModal({ isOpen, onClose, onAdd, folderId }) {
  // Add this near the top of the component, after the useState declarations
  // Get folder name if adding to a folder
  const [folderName, setFolderName] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    category: "Other",
    tags: "",
  })
  const [activeTab, setActiveTab] = useState("basic")

  // Add this inside the component to get the folder name from localStorage
  useEffect(() => {
    if (folderId) {
      const savedFolders = localStorage.getItem("chromo-folders")
      if (savedFolders) {
        const folders = JSON.parse(savedFolders)
        const folder = folders.find((f) => f.id === folderId)
        if (folder) {
          setFolderName(folder.name)
        }
      }
    } else {
      setFolderName("")
    }
  }, [folderId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Basic validation
    if (!formData.title || !formData.url) return

    // Process tags into an array
    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "")

    onAdd({
      title: formData.title,
      url: formData.url,
      description: formData.description,
      category: formData.category,
      tags: tags.length > 0 ? tags : ["uncategorized"],
    })

    // Reset form and close modal
    setFormData({
      title: "",
      url: "",
      description: "",
      category: "Other",
      tags: "",
    })
    setActiveTab("basic")
    onClose()
  }

  // Auto-extract title from URL
  const extractTitleFromUrl = async () => {
    if (!formData.url) return

    try {
      // In a real app, this would be a server action or API route
      // For demo purposes, we'll just generate a title based on the URL
      const domain = new URL(formData.url).hostname.replace("www.", "")
      const suggestedTitle = domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1)

      setFormData((prev) => ({
        ...prev,
        title: suggestedTitle,
        tags: prev.tags ? prev.tags : domain.split(".")[0],
      }))
    } catch (error) {
      console.error("Invalid URL or error extracting title", error)
    }
  }

  const handleAISummaryComplete = ({ description, suggestedTags }) => {
    setFormData((prev) => ({
      ...prev,
      description: description,
      tags: suggestedTags.join(", "),
    }))
    setActiveTab("basic")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          {/* Update the DialogTitle to show the folder name if adding to a folder */}
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            {folderId ? `Add Link to "${folderName}"` : "Add New Link"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Assist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={extractTitleFromUrl}
                    title="Extract title from URL"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Link Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Add a description..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="development, react, tutorial"
                    value={formData.tags}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Save Link</Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="ai">
            {formData.url ? (
              <AISummarizer url={formData.url} onSummaryComplete={handleAISummaryComplete} />
            ) : (
              <div className="p-8 text-center">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-lg font-medium mb-2">Enter a URL first</h3>
                <p className="text-muted-foreground mb-4">
                  Please enter a URL in the Basic Info tab before using AI assistance.
                </p>
                <Button onClick={() => setActiveTab("basic")}>Go to Basic Info</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

