"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Trash2, ExternalLink, MoreHorizontal, Plus, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import AddLinkModal from "@/components/add-link-modal"
import { toast } from "sonner"
import Link from "next/link"
import dynamic from "next/dynamic"

const MultiFolderShareModal = dynamic(
  () => import("@/components/multi-link-share-modal"),
  { ssr: false }
)

interface Link {
  id: number
  title: string
  url: string
  description?: string
  category: string
  tags: (string | { name: string })[]
  createdAt: string
  folderId?: number
  
}

interface Folder {
  id: number
  name: string
  links: Link[]
  createdAt: string
}

export default function FolderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [folder, setFolder] = useState<Folder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  useEffect(() => {
    const loadFolder = async () => {
      try {
        const response = await fetch(`/api/folders/${params.id}`)
        if (!response.ok) throw new Error("Failed to fetch folder")
        const data = await response.json() as Folder
        setFolder(data)
      } catch (error) {
        toast.error("Folder not found")
        router.push("/folders")
      } finally {
        setIsLoading(false)
      }
    }
    loadFolder()
  }, [params.id, router])

  const handleRemoveLink = async (linkId: number) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: "DELETE"
      })

      if (!response.ok) throw new Error("Failed to remove link")

      setFolder(prev => prev ? {
        ...prev,
        links: prev.links.filter(link => link.id !== linkId)
      } : null)

      toast.success("Link removed from folder")
    } catch (error) {
      toast.error("Failed to remove link")
    }
  }

  const handleAddNewLink = async (newLink: Omit<Link, "id" | "createdAt">) => {
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLink,
          folderId: Number(folder?.id)
        })
      })

      if (!response.ok) throw new Error("Failed to add link")

      const createdLink = await response.json()
      
      setFolder(prev => prev ? {
        ...prev,
        links: [...prev.links, createdLink]
      } : null)

      toast.success(`${newLink.title} added to folder`)
      setIsAddModalOpen(false)
    } catch (error) {
      toast.error("Failed to add link")
    }
  }

  if (isLoading) return (
    <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"/>
        <p className="text-muted-foreground">Loading folder contents...</p>
      </div>
    </div>
  )

  if (!folder) return (
    <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Folder Not Found</h1>
        <p className="text-muted-foreground">The requested folder does not exist</p>
        <Link href="/folders">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4"/> 
            Back to Folders
          </Button>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto p-4 lg:p-6">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Link href="/folders" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto gap-2">
              <ArrowLeft className="h-4 w-4"/>
              Back to Folders
            </Button>
          </Link>

          <Button 
            onClick={() => setIsShareModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Share className="h-4 w-4 mr-2"/>
            Share Folder
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold">{folder.name}</h1>
            <p className="text-muted-foreground">
              {folder.links.length} {folder.links.length === 1 ? "link" : "links"}
            </p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2"/>
            Add New Link
          </Button>
        </div>

        {folder.links.length === 0 ? (
          <div className="border rounded-lg p-8 text-center space-y-4">
            <div className="h-16 w-16 mx-auto text-muted-foreground opacity-20"/>
            <h2 className="text-xl font-semibold">Empty Folder</h2>
            <p className="text-muted-foreground">Start by adding your first link</p>
            <Button onClick={() => setIsAddModalOpen(true)} size="lg">
              <Plus className="h-4 w-4 mr-2"/>
              Add Link
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {folder.links.map(link => (
              <LinkCard
                key={link.id}
                link={link}
                onRemove={() => handleRemoveLink(link.id)}
              />
            ))}
          </div>
        )}

        <MultiFolderShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          folders={[{ ...folder, id: folder.id.toString(), links: folder.links.map(link => link.url) }]}
          links={folder.links.map(({ id, title, url }) => ({ id: id.toString(), title, url }))}
        />

<AddLinkModal
  isOpen={isAddModalOpen}
  onClose={() => setIsAddModalOpen(false)}
  onAdd={handleAddNewLink}
  folderId={folder.id.toString()}
  loading={isLoading}
/>
      </div>
    </div>
  )
}

function LinkCard({ link, onRemove }: { link: Link; onRemove: () => void }) {
  const displayTags = link.tags?.map(t => typeof t === 'object' ? t.name : t) || []
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow group">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-semibold truncate" title={link.title}>
            {link.title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-2 shrink-0 hover:bg-accent/50"
                onClick={e => e.preventDefault()}
              >
                <MoreHorizontal className="h-4 w-4"/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={e => {
                  e.preventDefault()
                  window.open(link.url, "_blank")
                }}
                className="cursor-pointer"
              >
                <ExternalLink className="h-4 w-4 mr-2"/>
                Open Link
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={e => {
                  e.preventDefault()
                  onRemove()
                }}
                className="text-destructive cursor-pointer focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2"/>
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1">
        <div className="space-y-2">
          <a
            href={link.url}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            {new URL(link.url).hostname}
            <ExternalLink className="h-3 w-3 ml-1"/>
          </a>
          {link.description && (
            <p className="text-muted-foreground text-sm line-clamp-3">
              {link.description}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
      <Badge variant="secondary" className="text-xs">
        {link.category}
      </Badge>
      {displayTags.slice(0, 3).map(tag => (
        <Badge key={tag} variant="outline" className="text-xs">
          {tag}
        </Badge>
      ))}
      {displayTags.length > 3 && (
        <Badge variant="outline" className="text-xs">
          +{displayTags.length - 3}
        </Badge>
      )}
    </CardFooter>
    </Card>
  )
}