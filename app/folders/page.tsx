"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FolderPlus, Search, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

import FolderModal from "@/components/folder-modal"
import Link from "next/link"

export default function FoldersPage() {
  const [folders, setFolders] = useState<FolderData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  
  const router = useRouter()

  // Load folders from localStorage
  useEffect(() => {
    const savedFolders = localStorage.getItem("chromo-folders")
    if (savedFolders) {
      setFolders(JSON.parse(savedFolders))
      
    }
  }, [])

  // Save folders to localStorage whenever they change
  useEffect(() => {
    if (folders.length > 0) {
      localStorage.setItem("chromo-folders", JSON.stringify(folders))
    }
  }, [folders])

  const handleCreateFolder = () => {
    setEditingFolder(null)
    setIsFolderModalOpen(true)
  }
  interface Folder {
    id: string;
    name: string;
    links: any[];
    dateCreated: string;
  }

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder)
    setIsFolderModalOpen(true)
  }

  interface FolderData {
    id: string;
    name: string;
    links: any[];
    dateCreated: string;
  }

  const handleSaveFolder = (folderData: FolderData, addLinksAfter: boolean) => {
    let newFolder: FolderData;

    if (editingFolder) {
      setFolders(folders.map((folder) => (folder.id === folderData.id ? { ...folderData, dateCreated: folder.dateCreated } : folder)))
      setFolders(folders.map((folder) => (folder.id === folderData.id ? folderData : folder)))
      newFolder = folderData;

      toast(`"${folderData.name}" has been updated.`);
    } else {
      // Add new folder
      newFolder = {
        ...folderData,
        links: [],
      };

      setFolders([...folders, newFolder]);

      toast(`"${folderData.name}" has been created.`);
    }

    setEditingFolder(null);

    // If addLinksAfter is true, navigate to the folder page
    if (addLinksAfter) {
      setTimeout(() => {
        router.push(`/folders/${newFolder.id}`);
      }, 300);
    }
  }

  const handleDeleteFolder = (folderId: string) => {
    setFolders(folders.filter((folder) => folder.id !== folderId))

    toast("The folder has been removed.")
  }

  const filteredFolders = folders.filter((folder) => {
    if (!searchQuery) return true
    return folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Folders</h1>
          <p className="text-muted-foreground">Organize your links into folders</p>
        </div>

        <div className="flex gap-2">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
          <Button onClick={handleCreateFolder}>
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search folders..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredFolders.length === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <FolderPlus className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
          <h2 className="text-xl font-medium mb-2">No Folders Yet</h2>
          <p className="text-muted-foreground mb-6">Create folders to organize your links.</p>
          <Button onClick={handleCreateFolder}>
            <FolderPlus className="h-4 w-4 mr-2" />
            Create Your First Folder
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFolders.map((folder) => (
            <Link key={folder.id} href={`/folders/${folder.id}`} className="block">
              <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    {folder.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {folder.links.length} {folder.links.length === 1 ? "link" : "links"}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleEditFolder(folder)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteFolder(folder.id)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false)
          setEditingFolder(null)
        }}
        folder={editingFolder}
        onSave={handleSaveFolder}
      />
    </div>
  )
}

