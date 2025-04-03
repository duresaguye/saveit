"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, ArrowLeft, Clock, Save } from "lucide-react"
import { toast } from "sonner"
import Loading from "@/components/loading" 

interface Link {
  id: string
  url: string
  title: string
  description?: string
  category: string
  tags: string[]
  dateAdded: string
}

export default function SharePage() {
  const params = useParams()
  const [link, setLink] = useState<Link | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSharedLink = async () => {
      try {
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1000))

        const savedLinks = localStorage.getItem("chromo-links")
        if (!savedLinks) throw new Error("No links found")

        const links: Link[] = JSON.parse(savedLinks)
        const foundLink = links.find(link => link.id === params.id)

        if (!foundLink) throw new Error("Link not found")
        setLink(foundLink)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error occurred"
        setError(message)
        toast(message)
      } finally {
        setLoading(false)
      }
    }

    fetchSharedLink()
  }, [params.id])

  const saveToMyLinks = () => {
    try {
      const savedLinks = localStorage.getItem("chromo-links")
      const links: Link[] = savedLinks ? JSON.parse(savedLinks) : []

      const exists = links.some(existingLink => existingLink.url === link?.url)
      if (!exists && link) {
        const newLink = {
          ...link,
          id: Date.now().toString(),
          dateAdded: new Date().toISOString(),
        }

        localStorage.setItem("chromo-links", JSON.stringify([...links, newLink]))
        toast("Link saved to your collection")
      } else {
        toast("This link is already in your collection")
      }
    } catch (err) {
      toast("Failed to save link")
    }
  }

  if (loading) return <Loading />

  if (error) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Link Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
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
                {link.tags.map(tag => (
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
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}