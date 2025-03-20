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
  id: string
  title: string
  url: string
  description?: string
  category: string
  tags: string[]
  dateAdded: string
}

interface Folder {
  id: string
  name: string
  links: string[]
}

export default function FolderDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [folder, setFolder] = useState<Folder | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [folderLinks, setFolderLinks] = useState<Link[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true)
      const savedLinks = localStorage.getItem("chromo-links") || "[]"
      const savedFolders = localStorage.getItem("chromo-folders") || "[]"
      
      const allLinks: Link[] = JSON.parse(savedLinks)
      const allFolders: Folder[] = JSON.parse(savedFolders)
      const currentFolder = allFolders.find(f => f.id === params.id)

      if (currentFolder) {
        setFolder(currentFolder)
        setFolderLinks(currentFolder.links
          .map(linkId => allLinks.find(link => link.id === linkId))
          .filter(Boolean) as Link[])
      } else {
        toast.error("Folder not found")
        router.push("/folders")
      }
      setIsLoading(false)
    }

    loadData()
  }, [params.id, router])

  const handleRemoveLink = (linkId: string) => {
    if (!folder) return
    const updatedFolder = {
      ...folder,
      links: folder.links.filter(id => id !== linkId)
    }
    setFolder(updatedFolder)
    setFolderLinks(prev => prev.filter(link => link.id !== linkId))
    toast.success("Link removed from folder")
  }

  const handleAddNewLink = (newLink: Omit<Link, "id" | "dateAdded">) => {
    const linkWithId: Link = {
      ...newLink,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString()
    }

    setLinks(prev => [...prev, linkWithId])
    if (folder) {
      const updatedFolder = {
        ...folder,
        links: [...folder.links, linkWithId.id]
      }
      setFolder(updatedFolder)
      setFolderLinks(prev => [...prev, linkWithId])
    }
    toast.success(`${newLink.title} added to folder`)
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
              {folderLinks.length} {folderLinks.length === 1 ? "link" : "links"}
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

        {folderLinks.length === 0 ? (
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
            {folderLinks.map(link => (
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
          folders={[folder]}
          links={links}
        />

        <AddLinkModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddNewLink}
          folderId={folder.id}
        />
      </div>
    </div>
  )
}

function LinkCard({ link, onRemove }: { link: Link; onRemove: () => void }) {
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
        {link.tags.slice(0, 3).map(tag => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
        {link.tags.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{link.tags.length - 3}
          </Badge>
        )}
      </CardFooter>
    </Card>
  )
}