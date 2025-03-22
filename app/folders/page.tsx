"use client"

import { useState, useEffect } from "react"
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

const MultiFolderShareModal = dynamic(
  () => import("@/components/multi-link-share-modal"),
  { ssr: false }
)

interface Link {
  id: string
  title: string
  url: string
  tags: string[]
  category: string
  dateAdded: string
}

interface Folder {
  id: string
  name: string
  links: string[]
  dateCreated: string
}

export default function Home() {
  const [links, setLinks] = useState<Link[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMultiSelectFoldersMode, setIsMultiSelectFoldersMode] = useState(false)
  const [selectedFolders, setSelectedFolders] = useState<string[]>([])
  const [isMultiFolderShareModalOpen, setIsMultiFolderShareModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)

  const isMobile = useMobile()

  useEffect(() => {
    const savedLinks = localStorage.getItem("chromo-links")
    const savedFolders = localStorage.getItem("chromo-folders")

    if (savedLinks) setLinks(JSON.parse(savedLinks))
    if (savedFolders) setFolders(JSON.parse(savedFolders))
  }, [])

  useEffect(() => {
    if (links.length > 0) localStorage.setItem("chromo-links", JSON.stringify(links))
  }, [links])

  useEffect(() => {
    if (folders.length > 0) localStorage.setItem("chromo-folders", JSON.stringify(folders))
  }, [folders])

  const addLink = (newLink: Omit<Link, 'id' | 'dateAdded'>) => {
    const linkWithId: Link = {
      ...newLink,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
    }
    setLinks([...links, linkWithId])
    toast(`${newLink.title} has been added to your collection.`)
  }

  const handleSaveFolder = (folderData: Folder) => {
    if (editingFolder) {
      setFolders(folders.map(folder => folder.id === folderData.id ? folderData : folder))
      toast(`"${folderData.name}" has been updated.`)
    } else {
      setFolders([...folders, folderData])
      toast(`"${folderData.name}" has been created.`)
    }
    setEditingFolder(null)
  }

  const toggleFolderSelection = (folderId: string) => {
    setSelectedFolders(prev => prev.includes(folderId) 
      ? prev.filter(id => id !== folderId) 
      : [...prev, folderId]
    )
  }

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto p-4">
        {/* Search and Actions Container */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search Input */}
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

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            {isMultiSelectFoldersMode ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    setIsMultiSelectFoldersMode(false)
                    setSelectedFolders([])
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setIsMultiFolderShareModalOpen(true)}
                >
                  <Share className="h-4 w-4" />
                  <span>Share</span>
                  <span>({selectedFolders.length})</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setIsMultiSelectFoldersMode(true)}
                  disabled={filteredFolders.length === 0}
                >
                  <Share className="h-4 w-4" />
                  <span className="hidden sm:inline">Select & Share</span>
                </Button>
                <Button 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setIsFolderModalOpen(true)}
                >
                  <FolderPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Folder</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Folders Grid */}
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
                className={`h-full cursor-pointer hover:shadow-md transition-shadow relative ${
                  isMultiSelectFoldersMode && selectedFolders.includes(folder.id) 
                    ? "ring-2 ring-primary" 
                    : ""
                }`}
                onClick={() => isMultiSelectFoldersMode && toggleFolderSelection(folder.id)}
              >
                {!isMultiSelectFoldersMode && (
                  <Link 
                    href={`/folders/${folder.id}`} 
                    className="absolute inset-0 z-10"
                  />
                )}
                
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
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
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-20">
                  <p className="text-muted-foreground">
                    {folder.links.length} {folder.links.length === 1 ? "item" : "items"}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="relative z-30"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingFolder(folder)
                        setIsFolderModalOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="relative z-30"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFolders(folders.filter(f => f.id !== folder.id))
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Modals */}
      <AddLinkModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={addLink} 
      />

      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false)
          setEditingFolder(null)
        }}
        folder={editingFolder}
        onSave={handleSaveFolder}
      />

      <MultiFolderShareModal
        isOpen={isMultiFolderShareModalOpen}
        onClose={() => setIsMultiFolderShareModalOpen(false)}
        folders={folders.filter(folder => selectedFolders.includes(folder.id))}
        links={links}
      />
    </main>
  )
}