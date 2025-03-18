"use client"

import { useEffect, useState } from "react"

type Folder = {
  id: string
  name: string
  links: string[]
}
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, ArrowLeft, Clock, Save, Folder } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
  const [folders, setFolders] = useState<Folder[]>([])

export default function SharedFoldersPage() {
  const params = useParams()
  const searchParams = useSearchParams()

  const [folders, setFolders] = useState<Folder[]>([])
  const [allLinks, setAllLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collectionName, setCollectionName] = useState("Shared Folders")
  const [activeTab, setActiveTab] = useState("folders")

  useEffect(() => {
    // In a real app, this would fetch the shared folders from an API
    // For this demo, we'll simulate loading from localStorage
    const fetchSharedFolders = async () => {
      try {
        setLoading(true)

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Get folder IDs from the URL
        const folderIds = searchParams.get("ids")?.split(",") || []

        // Get collection name from URL
        const urlCollectionName = searchParams.get("name")
        if (urlCollectionName) {
          setCollectionName(decodeURIComponent(urlCollectionName))
        }

        if (folderIds.length === 0) {
          throw new Error("No folders found")
        }

        // Get folders from localStorage
        const savedFolders = localStorage.getItem("chromo-folders")
        if (!savedFolders) {
          throw new Error("No folders found")
        }

        const allFolders = JSON.parse(savedFolders)
        const foundFolders: Folder[] = allFolders.filter((folder: Folder) => folderIds.includes(folder.id))

        if (foundFolders.length === 0) {
          throw new Error("Folders not found")
        }

        setFolders(foundFolders)

        // Get all links from localStorage
        const savedLinks = localStorage.getItem("chromo-links")
        if (savedLinks) {
          const links = JSON.parse(savedLinks)
          setAllLinks(links)
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError(String(err))
        }
        if (err instanceof Error) {
          toast(err.message)
        } else {
          toast(String(err))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSharedFolders()
  }, [params.id, searchParams, toast])

  // Get all links from all folders
interface Link {
    id: string
    title: string
    url: string
    description?: string
    category: string
    tags: string[]
    dateAdded: string
}

const getFolderLinks = (folderId: string): Link[] => {
    const folder = folders.find((f) => f.id === folderId)
    if (!folder) return []

    return folder.links.map((linkId) => allLinks.find((link: Link) => link.id === linkId)).filter((link): link is Link => link !== undefined)
}

  // Get all unique links across all folders
  const getAllFolderLinks = () => {
    const allLinkIds = folders.flatMap((folder) => folder.links)
    const uniqueLinkIds = [...new Set(allLinkIds)]
    return uniqueLinkIds.map((id) => allLinks.find((link) => link.id === id)).filter(Boolean)
  }


  const saveAllToMyCollection = () => {
    try {
      // Get existing links
      const savedLinks = localStorage.getItem("chromo-links")
      const existingLinks = savedLinks ? JSON.parse(savedLinks) : []

      // Track how many new links were added
      let newLinksCount = 0
      const newLinkIds: { [key: string]: string } = {}

      // Add each link that doesn't already exist
      getAllFolderLinks().forEach((link) => {
        if (!link) return;

        // Check if link already exists
        const exists: boolean = existingLinks.some((existingLink: Link) => existingLink.url === link.url);

        if (!exists) {
          // Add the link with a new ID
          const newLinkId = Date.now().toString() + Math.random().toString(36).substring(2, 10);
          if (typeof link === 'object' && link !== null) {
            const newLink = {
              ...(typeof link === 'object' && link !== null ? link : {}),
              id: newLinkId,
              dateAdded: new Date().toISOString(),
            };

            existingLinks.push(newLink);
            newLinkIds[link.id] = newLinkId;
            newLinksCount++;
          }
        } else {
          // If the link already exists, find its ID
          const existingLink: Link | undefined = existingLinks.find((existingLink: Link) => existingLink.url === link.url);
          if (existingLink) {
            newLinkIds[link.id] = existingLink.id;
          }
        }
      });

      localStorage.setItem("chromo-links", JSON.stringify(existingLinks))

      // Create new folders with these links
      const savedFolders = localStorage.getItem("chromo-folders")
      const existingFolders = savedFolders ? JSON.parse(savedFolders) : []

      // Create new folders with the same names as the shared folders
      folders.forEach((folder) => {
        const newFolderLinks = folder.links.map((linkId) => newLinkIds[linkId]).filter(Boolean)

        if (newFolderLinks.length > 0) {
          const newFolder = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 10),
            name: folder.name,
            links: newFolderLinks,
            dateCreated: new Date().toISOString(),
          }

          existingFolders.push(newFolder)
        }
      })

      localStorage.setItem("chromo-folders", JSON.stringify(existingFolders))

      toast( `Saved ${newLinksCount} new links to ${folders.length} folders`,
      )
    } catch (err) {
      toast( "Failed to save folders"
        )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading shared folders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Folders Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The shared folders you're looking for don't exist or have expired.
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => (window.location.href = "/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Folder className="h-6 w-6" />
            {collectionName}
          </h1>
          <p className="text-muted-foreground">
            Shared collection with {folders.length} folders and {getAllFolderLinks().length} links
          </p>
          <div className="flex justify-center mt-2">
            <Badge variant="outline" className="text-xs">
              Shared on {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <Button onClick={saveAllToMyCollection}>
            <Save className="h-4 w-4 mr-2" />
            Save All to My Collection
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="folders" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Folders ({folders.length})
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              All Links ({getAllFolderLinks().length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="folders" className="mt-4">
            <div className="space-y-8">
              {folders.map((folder) => (
                <div key={folder.id} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">{folder.name}</h2>
                    <Badge variant="outline">
                      {folder.links.length} {folder.links.length === 1 ? "link" : "links"}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {getFolderLinks(folder.id).map((link) => (
                      <Card key={link.id} className="shadow-md">
                        <CardHeader>
                          <CardTitle className="text-xl">{link?.title}</CardTitle>
                          <CardDescription>
                            <a
                              href={link?.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline flex items-center gap-1"
                            >
                              {link?.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </CardDescription>
                        </CardHeader>

                        {link?.description && (
                          <CardContent>
                            <p className="text-muted-foreground">{link?.description}</p>
                          </CardContent>
                        )}

                        <CardFooter className="flex flex-col items-start gap-4">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline">{link?.category}</Badge>
                            {link?.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            Added on {new Date(link?.dateAdded).toLocaleDateString()}
                          </div>

                          <div className="w-full flex justify-end pt-2 border-t">
                            <Button variant="outline" onClick={() => window.open(link?.url, "_blank")}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visit Link
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="links" className="mt-4">
            <div className="space-y-4">
              {getAllFolderLinks().map((link) => (
                {link &&(
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
                </Card>}
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>


