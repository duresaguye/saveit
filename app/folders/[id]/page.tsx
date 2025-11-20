"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Trash2, ExternalLink, MoreHorizontal, Plus, Share, Search, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import AddLinkModal from "@/components/add-link-modal"
import { toast } from "sonner"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/Navbar"
import { useMobile } from "@/hooks/use-mobile"


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
  const [searchQuery, setSearchQuery] = useState("")
  const isMobile = useMobile()

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

  // Filter links based on search query
  const filteredLinks = folder?.links.filter(link =>
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.tags?.some(tag => 
      (typeof tag === 'string' ? tag : tag.name).toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    link.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 dark:from-slate-950 dark:via-teal-950/80 dark:to-emerald-950/80">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
        <p className="text-lg font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
        Loading folder contents...
        </p>
      </div>
    </div>
    </div>
  )

  if (!folder) return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl flex items-center justify-center min-h-[50vh]">
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
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <Link href="/folders">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4"/>
                  Back
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Folder className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {folder.name}
                </h1>
                <p className="text-muted-foreground">
                  {folder.links.length} {folder.links.length === 1 ? 'link' : 'links'} in this folder
                </p>
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-card/50 p-4 rounded-xl border">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search links in this folder..."
                className="pl-10 w-full bg-background/50 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={() => setIsShareModalOpen(true)}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md transition-all"
              >
                <Share className="h-4 w-4 mr-1.5" />
                Share Folder
              </Button>
              <Button
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Add Link</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>

          {filteredLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card/50 rounded-2xl border-2 border-dashed border-muted-foreground/20">
              <div className="p-5 rounded-full bg-primary/10 mb-5">
                <Plus className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight mb-2">
                {searchQuery ? 'No Links Found' : 'No Links Yet'}
              </h2>
              <p className="text-muted-foreground max-w-md mb-6">
                {searchQuery
                  ? 'No links match your search. Try a different term.'
                  : 'Get started by adding your first link to this folder.'}
              </p>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md transition-all px-6 py-5"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Link
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredLinks.map((link) => (
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

      {isMobile && (
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}

function LinkCard({ link, onRemove }: { link: Link; onRemove: () => void }) {
  const displayTags = link.tags?.map(t => typeof t === 'object' ? t.name : t) || []
  
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:ring-1 hover:ring-border bg-card/50 backdrop-blur-sm border h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <ExternalLink className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2" title={link.title}>
              {link.title}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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

      <CardContent className="pt-0 flex-1">
        <div className="space-y-3">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            onClick={e => e.stopPropagation()}
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

      <CardFooter className="pt-4 mt-auto">
        <div className="flex flex-wrap gap-2 w-full">
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
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
        </div>
      </CardFooter>
    </Card>
  )
}