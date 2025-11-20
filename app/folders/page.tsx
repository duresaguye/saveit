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

export default function FoldersPage() {
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
    if (!isPending && session === null) {
      router.replace('/login')
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (!session?.user) return;

    let isMounted = true;
    setIsProcessing(true);

    const fetchData = async () => {
      try {
        const [foldersRes, linksRes] = await Promise.all([
          fetch('/api/folders'),
          fetch('/api/links')
        ]);

        if (!foldersRes.ok || !linksRes.ok) throw new Error('Failed to fetch data');

        const [foldersData, linksData] = await Promise.all([
          foldersRes.json(),
          linksRes.json()
        ]);

        if (isMounted) {
          setFolders(foldersData);
          setLinks(linksData);
        }
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        if (isMounted) setIsProcessing(false);
      }
    };

    fetchData();
    return () => { isMounted = false };
  }, [session]);

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

  if (isPending || (!session && !isPending) || isProcessing) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              My Folders
            </h1>
            <p className="text-muted-foreground">
              Organize and manage your saved links in folders
            </p>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-card/50 p-4 rounded-xl border">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search folders..."
                className="pl-10 w-full bg-background/50 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {isMultiSelectFoldersMode ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsMultiSelectFoldersMode(false)
                      setSelectedFolders([])
                    }}
                    className="bg-background/50 hover:bg-background/80"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsMultiFolderShareModalOpen(true)}
                    disabled={selectedFolders.length === 0}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md transition-all"
                  >
                    <Share className="h-4 w-4 mr-1.5" />
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
                    className="bg-background/50 hover:bg-background/80"
                  >
                    <Share className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">Select & Share</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsFolderModalOpen(true)}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md transition-all"
                  >
                    <FolderPlus className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">New Folder</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {filteredFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card/50 rounded-2xl border-2 border-dashed border-muted-foreground/20">
              <div className="p-5 rounded-full bg-primary/10 mb-5">
                <FolderPlus className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight mb-2">No Folders Yet</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                {searchQuery
                  ? 'No folders match your search. Try a different term.'
                  : 'Get started by creating your first folder to organize your links.'}
              </p>
              <Button 
                onClick={() => setIsFolderModalOpen(true)}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md transition-all px-6 py-5"
              >
                <FolderPlus className="h-5 w-5 mr-2" />
                Create Your First Folder
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredFolders.map((folder) => (
                <Card
                  key={folder.id}
                  className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                    isMultiSelectFoldersMode && selectedFolders.includes(folder.id)
                      ? 'ring-2 ring-primary' 
                      : 'hover:ring-1 hover:ring-border'
                  } bg-card/50 backdrop-blur-sm border`}
                >
                  {isMultiSelectFoldersMode ? (
                    <div
                      className="absolute inset-0 cursor-pointer z-10"
                      onClick={() => toggleFolderSelection(folder.id)}
                    />
                  ) : (
                    <Link
                      href={`/folders/${folder.id}`}
                      className="absolute inset-0 z-10"
                    />
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <Folder className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold line-clamp-1 flex items-center gap-2">
                          {isMultiSelectFoldersMode && (
                            <Checkbox
                              checked={selectedFolders.includes(folder.id)}
                              className="h-4 w-4 rounded-full border-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFolderSelection(folder.id)
                              }}
                            />
                          )}
                          {folder.name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {folder.links?.length || 0} {folder.links?.length === 1 ? 'item' : 'items'}
                      </span>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setEditingFolder(folder)
                            setIsFolderModalOpen(true)
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            <path d="m13.5 6.5 4 4"/>
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-destructive hover:text-destructive/90"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDeleteFolder(folder.id)
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            <line x1="10" x2="10" y1="11" y2="17"/>
                            <line x1="14" x2="14" y1="11" y2="17"/>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {isMobile && (
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          onClick={() => setIsFolderModalOpen(true)}
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
        folders={folders.filter(f => selectedFolders.includes(f.id)).map(f => ({ 
          ...f, 
          id: f.id.toString(), 
          links: f.links?.map(link => link.id.toString()) || [] 
        }))}
        links={links.map(link => ({ ...link, id: link.id.toString() }))}
      />
    </div>
  )
}