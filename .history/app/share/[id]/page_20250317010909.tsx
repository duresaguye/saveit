"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, ArrowLeft, Clock, Save } from "lucide-react"
import { toast } from "sonner"


export default function SharePage() {
  const params = useParams()
  interface Link {
    id: string;
    url: string;
    title: string;
    description?: string;
    category: string;
    tags: string[];
    dateAdded: string;
  }

  const [link, setLink] = useState<Link | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, this would fetch the shared link from an API
    // For this demo, we'll simulate loading from localStorage
    const fetchSharedLink = async () => {
      try {
        setLoading(true)

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Get links from localStorage
        const savedLinks = localStorage.getItem("chromo-links")
        if (!savedLinks) {
          throw new Error("No links found")
        }

        const links = JSON.parse(savedLinks)
        interface Link {
          id: string;
          url: string;
          title: string;
          description?: string;
          category: string;
          tags: string[];
          dateAdded: string;
        }

        const foundLink: Link | undefined = links.find((link: Link) => link.id === params.id)

        if (!foundLink) {
          throw new Error("Link not found")
        }

        setLink(foundLink)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError(String(err))
        }
        toast((err as Error).message,
          )
      } finally {
        setLoading(false)
      }
    }

    fetchSharedLink()
  }, [params.id, toast])

  const saveToMyLinks = () => {
    try {
      // Get existing links
      const savedLinks = localStorage.getItem("chromo-links")
      const links = savedLinks ? JSON.parse(savedLinks) : []

      // Check if link already exists
      const exists: boolean = links.some((existingLink: Link) => existingLink.url === link?.url)

      if (!exists) {
        // Add the link with a new ID
        const newLink = {
          ...link,
          id: Date.now().toString(),
          dateAdded: new Date().toISOString(),
        }

        links.push(newLink)
        localStorage.setItem("chromo-links", JSON.stringify(links))

        toast("Link saved to your collection",
        )
      } else {
        toast( "This link is already in your collection",
        )
      }
    } catch (err) {
      toast("Failed to save link",
        )
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading shared link...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Link Not Found</h1>
          <p className="text-muted-foreground mb-6">The shared link you're looking for doesn't exist or has expired.</p>
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => (window.location.href = "/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Shared Link</h1>
          <p className="text-muted-foreground">Someone shared this link with you</p>
        </div>

        {link && (
          <Card className="shadow-lg">
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

            <div className="w-full flex justify-between items-center pt-2 border-t">
              <Button variant="outline" onClick={() => window.open(link.url, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Link
              </Button>

              <Button onClick={saveToMyLinks}>
                <Save className="h-4 w-4 mr-2" />
                Save to My Links
              </Button>
            </div>
          </Card>
        )}
        </Card>
      </div>
    </div>
  )
}

