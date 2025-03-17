"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, ArrowLeft, Clock, Save, Folder } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SharedFolderPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [folderName, setFolderName] = useState("Shared Folder")

  useEffect(() => {
    // In a real app, this would fetch the shared folder from an API
    // For this demo, we'll simulate loading from localStorage
    const fetchSharedFolder = async () => {
      try {
        setLoading(true)

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Get link IDs from the URL
        const linkIds = searchParams.get("ids")?.split(",") || []

        if (linkIds.length === 0) {
          throw new Error("No links found")
        }

        // Get links from localStorage
        const savedLinks = localStorage.getItem("chromo-links")
        if (!savedLinks) {
          throw new Error("No links found")
        }

        const allLinks = JSON.parse(savedLinks)
        const foundLinks = allLinks.filter((link) => linkIds.includes(link.id))

        if (foundLinks.length === 0) {
          throw new Error("Links not found")
        }

        setLinks(foundLinks)

        // Generate a folder name based on the most common category
        const categories = foundLinks.map((link) => link.category)
        const mostCommonCategory = categories
          .sort((a, b) => categories.filter((c) => c === a).length - categories.filter((c) => c === b).length)
          .pop()

        setFolderName(`${mostCommonCategory} Collection`)
      } catch (err) {
        setError(err.message)
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSharedFolder()
  }, [params.id, searchParams, toast])

  const saveAllToMyLinks = () => {
    try {
      // Get existing links
      const savedLinks = localStorage.getItem("chromo-links")
      const existingLinks = savedLinks ? JSON.parse(savedLinks) : []

      // Track how many new links were added
      let newLinksCount = 0

      // Add each link that doesn't already exist
      links.forEach((link) => {
        // Check if link already exists
        const exists = existingLinks.some((existingLink) => existingLink.url === link.url)

        if (!exists) {
          // Add the link with a new ID
          const newLink = {
            ...link,
            id: Date.now().toString() + Math.random().toString(36).substring(2, 10),
            dateAdded: new Date().toISOString(),
          }

          existingLinks.push(newLink)
          newLinksCount++
        }
      })

      localStorage.setItem("chromo-links", JSON.stringify(existingLinks))

      // Create a new folder with these links
      const savedFolders = localStorage.getItem("chromo-folders")
      const existingFolders = savedFolders ? JSON.parse(savedFolders) : []

      // Get the IDs of the newly added links
      const newLinkIds = existingLinks.slice(-newLinksCount).map((link) => link.id)

      // Create a new folder
      const newFolder = {
        id: Date.now().toString(),
        name: folderName,
        links: newLinkIds,
        dateCreated: new Date().toISOString(),
      }

      existingFolders.push(newFolder)
      localStorage.setItem("chromo-folders", JSON.stringify(existingFolders))

      toast({
        title: "Success",
        description: `Saved ${newLinksCount} links to a new folder: "${folderName}"`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save links",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading shared folder...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Folder Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The shared folder you're looking for doesn't exist or has expired.
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => (window.location.href = "/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Folder className="h-6 w-6" />
            {folderName}
          </h1>
          <p className="text-muted-foreground">Someone shared this folder with you</p>
        </div>

        <div className="flex justify-end mb-4">
          <Button onClick={saveAllToMyLinks}>
            <Save className="h-4 w-4 mr-2" />
            Save Folder to My Collection
          </Button>
        </div>

        <div className="space-y-4">
          {links.map((link) => (
            <Card key={link.id} className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">{link.title}</CardTitle>
                <CardDescription>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    {link.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardDescription>
              </CardHeader>

              {link.description && (
                <CardContent>
                  <p className="text-muted-foreground">{link.description}</p>
                </CardContent>
              )}

              <CardFooter className="flex flex-col items-start gap-4">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">{link.category}</Badge>
                  {link.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  Added on {new Date(link.dateAdded).toLocaleDateString()}
                </div>

                <div className="w-full flex justify-end pt-2 border-t">
                  <Button variant="outline" onClick={() => window.open(link.url, "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Link
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

