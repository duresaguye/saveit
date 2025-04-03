"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, ArrowLeft, Clock, Save, Folder } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface FolderType {
  id: number
  name: string
  links: LinkType[]
}

interface LinkType {
  id: number
  title: string
  url: string
  description?: string
  category: string
  tags?: string[] 
  createdAt: string
}

export default function SharedFoldersPage() {
  const searchParams = useSearchParams()
  const [folders, setFolders] = useState<FolderType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collectionName, setCollectionName] = useState("Shared Folders")
  const [activeTab, setActiveTab] = useState("folders")

  useEffect(() => {
    const fetchSharedFolders = async () => {
      try {
        setLoading(true)
        const folderIds = searchParams.get("ids")?.split(",").map(Number) || []
        
        if (!folderIds.length) {
          throw new Error("No folders specified in the URL")
        }

        const response = await fetch(`/api/shared/folders?ids=${folderIds.join(",")}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch folders")
        }

        const data: FolderType[] = await response.json()
        
        if (!data.length) {
          throw new Error("No folders found with the specified IDs")
        }

        setFolders(data)
        setCollectionName(searchParams.get("name") || `Shared Folders (${data.length})`)

      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load folders")
        toast.error(err instanceof Error ? err.message : "Failed to load folders")
      } finally {
        setLoading(false)
      }
    }

    fetchSharedFolders()
  }, [searchParams])

  const saveAllToMyCollection = async () => {
    try {
      const response = await fetch("/api/folders/save-shared", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          folderIds: folders.map(f => f.id),
          collectionName 
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save folders")
      }

      const result = await response.json()
      toast.success(`Saved ${result.savedFolders} folders with ${result.savedLinks} links to your collection`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save collection")
    }
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

  if (error || !folders.length) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Folders Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || "The requested folders could not be found"}
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const totalLinks = folders.reduce((acc, folder) => acc + folder.links.length, 0)

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
            {folders.length} folders containing {totalLinks} links
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
              All Links ({totalLinks})
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
                    {folder.links.map((link) => (
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
  {(link.tags || []).map((tag) => (
    <Badge key={tag} variant="secondary">
      {tag}
    </Badge>
  ))}
</div>

                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            Added on {new Date(link.createdAt).toLocaleDateString()}
                          </div>

                          <div className="w-full flex justify-end pt-2 border-t">
                            <Button 
                              variant="outline" 
                              onClick={() => window.open(link.url, "_blank")}
                            >
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
              {folders.flatMap(folder => folder.links).map((link) => (
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
                      {(link.tags ?? []).map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Added on {new Date(link.createdAt).toLocaleDateString()}
                    </div>

                    <div className="w-full flex justify-end pt-2 border-t">
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(link.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Link
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}