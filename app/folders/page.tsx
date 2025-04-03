"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Folder, FolderPlus, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AddLinkModal from "@/components/add-link-modal"
import { toast } from "sonner"
import { useMobile } from "@/hooks/use-mobile"
import FolderModal from "@/components/folder-modal"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/Navbar"
import { authClient } from "@/utils/auth-client"
import Loading from "./loading"

const MultiFolderShareModal = dynamic(
  () => import("@/components/multi-link-share-modal"),
  { ssr: false }
)

interface Link {
  id: number
  title: string
  url: string
  tags: string[]
  category: string
  createdAt: string
  dateCreated: string
  description: string
  userId: string
  folderId?: number
}

interface Folder {
  id: number
  name: string
  createdAt: string
  dateCreated: string
  userId: string
  links: Link[]
}

export default function Home() {
  const router = useRouter()
  const [links, setLinks] = useState<Link[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMultiSelectFoldersMode, setIsMultiSelectFoldersMode] = useState(false)
  const [selectedFolders, setSelectedFolders] = useState<number[]>([])
  const [isMultiFolderShareModalOpen, setIsMultiFolderShareModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { data: session, isPending } = authClient.useSession()

  const isMobile = useMobile()

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login')
    }
  }, [session, isPending, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return
      setIsProcessing(true)
      
      try {
        // Fetch folders with their links
        const foldersRes = await fetch('/api/folders')
        if (!foldersRes.ok) throw new Error('Failed to fetch folders')
        const foldersData = await foldersRes.json()
        setFolders(foldersData)

        // Fetch unorganized links
        const linksRes = await fetch('/api/links')
        if (!linksRes.ok) throw new Error('Failed to fetch links')
        const linksData = await linksRes.json()
        setLinks(linksData)
      } catch (error) {
        toast.error('Failed to load data')
      } finally {
        setIsProcessing(false)
      }
    }

    if (session?.user) fetchData()
  }, [session])

  const addLink = async (newLink: { title: string; url: string; description: string; category: string; tags: string[] }) => {
    try {
      setIsProcessing(true)
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink)
      })

      if (!response.ok) throw new Error('Failed to add link')
      
      const addedLink = await response.json()
      setLinks(prev => [...prev, addedLink])
      toast.success('Link added successfully')
      setIsAddModalOpen(false)
    } catch (error) {
      toast.error('Failed to add link')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveFolder = async (folderData: { name: string }) => {
    try {
      setIsProcessing(true)
      const url = editingFolder ? `/api/folders/${editingFolder.id}` : '/api/folders'
      const method = editingFolder ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folderData)
      })

      if (!response.ok) throw new Error(response.statusText)

      const result = await response.json()
      
      if (editingFolder) {
        setFolders(prev => prev.map(f => f.id === editingFolder.id ? result : f))
        toast.success('Folder updated successfully')
      } else {
        setFolders(prev => [...prev, result])
        toast.success('Folder created successfully')
      }
      
      setIsFolderModalOpen(false)
      setEditingFolder(null)
    } catch (error) {
      toast.error(editingFolder ? 'Failed to update folder' : 'Failed to create folder')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteFolder = async (folderId: number) => {
    try {
      setIsProcessing(true)
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete folder')
      
      setFolders(prev => prev.filter(f => f.id !== folderId))
      toast.success('Folder deleted successfully')
    } catch (error) {   
      toast.error('Failed to delete folder')
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleFolderSelection = (folderId: number) => {
    setSelectedFolders(prev => prev.includes(folderId) 
      ? prev.filter(id => id !== folderId) 
      : [...prev, folderId]
    )
  }

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isPending || !session || isProcessing) {
    return <Loading />
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search folders..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {isMultiSelectFoldersMode ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsMultiSelectFoldersMode(false)
                    setSelectedFolders([])
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setIsMultiFolderShareModalOpen(true)}
                >
                  <Share className="h-4 w-4 mr-1" />
                  Share ({selectedFolders.length})
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMultiSelectFoldersMode(true)}
                  disabled={filteredFolders.length === 0}
                >
                  <Share className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Select & Share</span>
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setIsFolderModalOpen(true)}
                >
                  <FolderPlus className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">New Folder</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {filteredFolders.length === 0 ? (
          <div className="text-center py-16 border rounded-lg">
            <FolderPlus className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
            <h2 className="text-xl font-medium mb-2">No Folders Yet</h2>
            <p className="text-muted-foreground mb-6">Create folders to organize your links.</p>
            <Button onClick={() => setIsFolderModalOpen(true)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Your First Folder
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFolders.map(folder => (
              <Card
                key={folder.id}
                className={`relative hover:shadow-md transition-shadow ${
                  isMultiSelectFoldersMode && selectedFolders.includes(folder.id) 
                    ? "ring-2 ring-primary" 
                    : ""
                }`}
              >
                {isMultiSelectFoldersMode ? (
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => toggleFolderSelection(folder.id)}
                  />
                ) : (
                  <Link
                    href={`/folders/${folder.id}`}
                    className="absolute inset-0"
                  />
                )}

                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    {isMultiSelectFoldersMode && (
                      <Checkbox
                        checked={selectedFolders.includes(folder.id)}
                        className="mr-2"
                      />
                    )}
                    <Folder className="h-5 w-5 text-primary" />
                    {folder.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative z-20">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {folder.links.length} items
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingFolder(folder)
                          setIsFolderModalOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteFolder(folder.id)
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {isMobile && (
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
          onClick={() =>   setIsFolderModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
          
        </Button>
      )}

      <AddLinkModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={addLink}
        loading={isProcessing}
      />

      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false)
          setEditingFolder(null)
        }}
        folder={editingFolder}
        onSave={handleSaveFolder}
        loading={isProcessing}
      />

      <MultiFolderShareModal
        isOpen={isMultiFolderShareModalOpen}
        onClose={() => setIsMultiFolderShareModalOpen(false)}
        folders={folders.filter(f => selectedFolders.includes(f.id)).map(f => ({ ...f, id: f.id.toString(), links: f.links.map(link => link.id.toString()) }))}
        links={links.map(link => ({ ...link, id: link.id.toString() }))}
      />
    </main>
  )
}