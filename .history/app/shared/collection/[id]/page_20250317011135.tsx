"use client"

import { useEffect, useState } from "react"

type Link = {
  id: string
  url: string
  title: string
  description?: string
  category: string
  tags: string[]
  dateAdded: string
}
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, ArrowLeft, Clock, Save } from "lucide-react"
import { toast } from "sonner"


export default function SharedCollectionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // In a real app, this would fetch the shared links from an API
    // For this demo, we'll simulate loading from localStorage
    const fetchSharedLinks = async () => {
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
        const foundLinks: Link[] = allLinks.filter((link: Link) => linkIds.includes(link.id))

        if (foundLinks.length === 0) {
          throw new Error("Links not found")
        }

        setLinks(foundLinks)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("An unknown error occurred")
        }
        toast( err.message,
          )
      } finally {
        setLoading(false)
      }
    }

    fetchSharedLinks()
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

      if (newLinksCount > 0) {
        toast({
          title: "Success",
          description: `${newLinksCount} link${newLinksCount === 1 ? "" : "s"} saved to your collection`,
        })
      } else {
        toast({
          title: "Already saved",
          description: "All links are already in your collection",
        })
      }
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
          <p className="mt-4 text-muted-foreground">Loading shared links...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Collection Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The shared collection you're looking for doesn't exist or has expired.
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
          <h1 className="text-2xl font-bold">Shared Link Collection</h1>
          <p className="text-muted-foreground">Someone shared these links with you</p>
        </div>

        <div className="flex justify-end mb-4">
          <Button onClick={saveAllToMyLinks}>
            <Save className="h-4 w-4 mr-2" />
            Save All to My Links
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

