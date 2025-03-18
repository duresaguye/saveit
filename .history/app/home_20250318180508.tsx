"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Folder, FolderPlus, Grid, LayoutGrid, Columns, Network, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import GraphView from "@/components/graph-view"
import KanbanView from "@/components/kanban-view"
import MindMapView from "@/components/mind-map-view"
import AddLinkModal from "@/components/add-link-modal"
import { toast } from "sonner"

import { useMobile } from "@/hooks/use-mobile"
import MultiLinkShareModal from "@/components/multi-link-share-modal"
import ThemeToggle from "@/components/theme-toggle"
import FolderModal from "@/components/folder-modal"
import FolderShareModal from "@/components/folder-share-modal"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import MultiFolderShareModal from "@/components/multi-link-share-modal"

export default function Home() {
  const [links, setLinks] = useState<{ id: string; title: string; url: string; tags: string[]; category: string; dateAdded: string }[]>([])
  const [folders, setFolders] = useState<{ id: string; name: string; links: string[]; dateCreated: string }[]>([])
  const [view, setView] = useState("graph") // graph, kanban, mindmap
  const [activeTab, setActiveTab] = useState("links") // links, folders
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLinks, setSelectedLinks] = useState<string[]>([])
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isFolderShareModalOpen, setIsFolderShareModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [pendingLinkForFolder, setPendingLinkForFolder] = useState(null)
  const [selectedFolderForShare, setSelectedFolderForShare] = useState<Folder | null>(null)

  const isMobile = useMobile()
  const router = useRouter()

  // Add a new state for multi-select folders mode
  const [isMultiSelectFoldersMode, setIsMultiSelectFoldersMode] = useState(false)
  const [selectedFolders, setSelectedFolders] = useState<string[]>([])

  // Add state for multi-folder share modal
  const [isMultiFolderShareModalOpen, setIsMultiFolderShareModalOpen] = useState(false)

  // Load links and folders from localStorage on initial render
  useEffect(() => {
    // Load links
    const savedLinks = localStorage.getItem("chromo-links")
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks))
    } else {
      // Sample data
      const sampleLinks = [
        {
          id: "1",
          title: "Next.js Documentation",
          url: "https://nextjs.org/docs",
          tags: ["development", "react", "framework"],
          category: "Development",
          dateAdded: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Tailwind CSS",
          url: "https://tailwindcss.com",
          tags: ["css", "styling", "development"],
          category: "Design",
          dateAdded: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Vercel Platform",
          url: "https://vercel.com",
          tags: ["hosting", "deployment", "platform"],
          category: "Hosting",
          dateAdded: new Date().toISOString(),
        },
      ]
      setLinks(sampleLinks)
      localStorage.setItem("chromo-links", JSON.stringify(sampleLinks))
    }

    // Load folders
    const savedFolders = localStorage.getItem("chromo-folders")
    if (savedFolders) {
      setFolders(JSON.parse(savedFolders))
    } else {
      // Sample folders
      const sampleFolders = [
        {
          id: "1",
          name: "Development Resources",
          links: ["1"],
          dateCreated: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Design Inspiration",
          links: ["2"],
          dateCreated: new Date().toISOString(),
        },
      ]
      setFolders(sampleFolders)
      localStorage.setItem("chromo-folders", JSON.stringify(sampleFolders))
    }
  }, [])

  // Save links to localStorage whenever they change
  useEffect(() => {
    if (links.length > 0) {
      localStorage.setItem("chromo-links", JSON.stringify(links))
    }
  }, [links])

  // Save folders to localStorage whenever they change
  useEffect(() => {
    if (folders.length > 0) {
      localStorage.setItem("chromo-folders", JSON.stringify(folders))
    }
  }, [folders])

  // Register keyboard shortcuts
  useEffect(() => {
    interface KeyboardEventWithMeta extends KeyboardEvent {
      metaKey: boolean;
    }

    const handleKeyDown = (e: KeyboardEventWithMeta) => {
      // Ctrl/Cmd + K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      document.getElementById("search-input")?.focus();
      }

      // Ctrl/Cmd + N to add new link
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault();
      setIsAddModalOpen(true);
      }

      // Ctrl/Cmd + F to add new folder
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      setIsFolderModalOpen(true);
      }

      // Escape to exit multi-select mode
      if (e.key === "Escape" && isMultiSelectMode) {
      e.preventDefault();
      setIsMultiSelectMode(false);
      setSelectedLinks([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMultiSelectMode])

  interface Link {
    id: string;
    title: string;
    url: string;
    tags: string[];
    category: string;
    dateAdded: string;
  }

  interface Folder {
    id: string;
    name: string;
    links: string[];
    dateCreated: string;
  }

  const addLink = (newLink: Omit<Link, 'id' | 'dateAdded'>) => {
    const linkWithId: Link = {
      ...newLink,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
    }
    setLinks([...links, linkWithId])
    toast(`${newLink.title} has been added to your collection.`)
  }

  interface DeleteLink {
    (id: string): void;
  }

  const deleteLink: DeleteLink = (id) => {
    // Remove link from all folders
    const updatedFolders = folders.map((folder) => ({
      ...folder,
      links: folder.links.filter((linkId) => linkId !== id),
    }));

    setFolders(updatedFolders);
    setLinks(links.filter((link) => link.id !== id));
    setSelectedLinks(selectedLinks.filter((linkId) => linkId !== id));

    toast("The link has been removed from your collection.");
  };

  interface ToggleLinkSelection {
    (linkId: string): void;
  }

  const toggleLinkSelection: ToggleLinkSelection = (linkId) => {
    setSelectedLinks((prev) => {
      if (prev.includes(linkId)) {
        return prev.filter((id) => id !== linkId);
      } else {
        return [...prev, linkId];
      }
    });
  };

  const handleShareSelected = () => {
    if (selectedLinks.length === 0) {
      toast( "Please select at least one link to share.",
        )
      return
    }

    setIsShareModalOpen(true)
  }

  const exitMultiSelectMode = () => {
    setIsMultiSelectMode(false)
    setSelectedLinks([])
  }

  // Folder management functions
  const handleCreateFolder = (linkId = null) => {
    if (linkId) {
      setPendingLinkForFolder(linkId)
    }
    setIsFolderModalOpen(true)
  }

  interface FolderData {
    id: string;
    name: string;
    links: string[];
    dateCreated: string;
  }

  interface HandleSaveFolder {
    (folderData: FolderData, addLinksAfter: boolean): void;
  }

  const handleSaveFolder: HandleSaveFolder = (folderData, addLinksAfter) => {
    let newFolder: FolderData;

    if (editingFolder) {
      // Update existing folder
      setFolders(folders.map((folder) => (folder.id === folderData.id ? folderData : folder)));
      newFolder = folderData;

      toast(`"${folderData.name}" has been updated.`);
    } else {
      // Add new folder
      newFolder = {
        ...folderData,
        links: pendingLinkForFolder ? [pendingLinkForFolder] : [],
      };

      setFolders([...folders, newFolder]);

      toast(`"${folderData.name}" has been created.`);
    }

    setEditingFolder(null);
    setPendingLinkForFolder(null);

    // If addLinksAfter is true, navigate to the folder page
    if (addLinksAfter) {
      setTimeout(() => {
        router.push(`/folders/${newFolder.id}`);
      }, 300);
    }
  };

  interface HandleEditFolder {
    (folder: Folder): void;
  }

  const handleEditFolder: HandleEditFolder = (folder) => {
    setEditingFolder(folder)
    setIsFolderModalOpen(true)
  }

  interface HandleDeleteFolder {
    (folderId: string): void;
  }

  const handleDeleteFolder: HandleDeleteFolder = (folderId) => {
    setFolders(folders.filter((folder) => folder.id !== folderId));

    toast("The folder has been removed.");
  };

  interface Folder {
    id: string;
    name: string;
    links: string[];
    dateCreated: string;
  }

  interface HandleShareFolder {
    (folder: Folder): void;
  }

  const handleShareFolder: HandleShareFolder = (folder) => {
    setSelectedFolderForShare(folder)
    setIsFolderShareModalOpen(true)
  }

  // Add a function to toggle folder selection
  interface ToggleFolderSelection {
    (folderId: string): void;
  }

  const toggleFolderSelection: ToggleFolderSelection = (folderId) => {
    setSelectedFolders((prev) => {
      if (prev.includes(folderId)) {
        return prev.filter((id) => id !== folderId);
      } else {
        return [...prev, folderId];
      }
    });
  };

  // Add a function to handle sharing selected folders
  const handleShareSelectedFolders = () => {
    if (selectedFolders.length === 0) {
      toast("Please select at least one folder to share.",
       )
      return
    }

    // Open the multi-folder share modal
    setIsMultiFolderShareModalOpen(true)
  }

  // Add a function to exit multi-select folders mode
  const exitMultiSelectFoldersMode = () => {
    setIsMultiSelectFoldersMode(false)
    setSelectedFolders([])
  }

  const filteredLinks = links.filter((link) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      link.title.toLowerCase().includes(query) ||
      link.url.toLowerCase().includes(query) ||
      link.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      link.category.toLowerCase().includes(query)
    )
  })

  const filteredFolders = folders.filter((folder) => {
    if (!searchQuery) return true

    return folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Get the full link objects for selected links
  const selectedLinkObjects = links.filter((link) => selectedLinks.includes(link.id))

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="flex min-h-screen flex-col">
        <header className="border-b sticky top-0 bg-background z-10">
          <div className="container mx-auto p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Chromo Extensions</h1>
            </div>

            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-input"
                  type="search"
                  placeholder="Search links, folders, or tags... (Ctrl+K)"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="links" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Links
              </TabsTrigger>
              <TabsTrigger value="folders" className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Folders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="links" className="mt-0">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Button variant={view === "graph" ? "default" : "outline"} size="sm" onClick={() => setView("graph")}>
                    <Network className="h-4 w-4 mr-2" />
                    Graph
                  </Button>
                  <Button
                    variant={view === "kanban" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("kanban")}
                  >
                    <Columns className="h-4 w-4 mr-2" />
                    Kanban
                  </Button>
                  <Button
                    variant={view === "mindmap" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("mindmap")}
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    Mind Map
                  </Button>
                </div>

                {isMultiSelectMode ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exitMultiSelectMode}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleShareSelected}>
                      Share Selected ({selectedLinks.length})
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMultiSelectMode(true)}
                    disabled={links.length === 0}
                  >
                    Select Multiple
                  </Button>
                )}
              </div>

              <div className="h-[calc(100vh-220px)]">
                {view === "graph" && (
                  <GraphView
                    links={filteredLinks}
                    onDelete={deleteLink}
                    isMultiSelectMode={isMultiSelectMode}
                    selectedLinks={selectedLinks}
                    onToggleSelect={toggleLinkSelection}
                  />
                )}
                {view === "kanban" && (
                  <KanbanView
                    links={filteredLinks}
                    onDelete={deleteLink}
                    isMultiSelectMode={isMultiSelectMode}
                    selectedLinks={selectedLinks}
                    onToggleSelect={toggleLinkSelection}
                  />
                )}
                {view === "mindmap" && (
                  <MindMapView
                    links={filteredLinks}
                    onDelete={deleteLink}
                    isMultiSelectMode={isMultiSelectMode}
                    selectedLinks={selectedLinks}
                    onToggleSelect={toggleLinkSelection}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="folders" className="mt-0">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Folders</h2>
                  <p className="text-muted-foreground">Organize your links into folders</p>
                </div>

                <div className="flex gap-2">
                  {isMultiSelectFoldersMode ? (
                    <>
                      <Button variant="outline" size="sm" onClick={exitMultiSelectFoldersMode}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleShareSelectedFolders}>
                        <Share className="h-4 w-4 mr-2" />
                        Share Selected ({selectedFolders.length})
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
                        <Share className="h-4 w-4 mr-2" />
                        Select & Share
                      </Button>
                      <Button onClick={() => handleCreateFolder()}>
                        <FolderPlus className="h-4 w-4 mr-2" />
                        New Folder
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
                  <Button onClick={() => handleCreateFolder()}>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Create Your First Folder
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFolders.map((folder) => (
                    <Link
                      key={folder.id}
                      href={isMultiSelectFoldersMode ? "#" : `/folders/${folder.id}`}
                      className="block"
                      onClick={(e) => {
                        if (isMultiSelectFoldersMode) {
                          e.preventDefault()
                          toggleFolderSelection(folder.id)
                        }
                      }}
                    >
                      <Card
                        className={`h-full cursor-pointer hover:shadow-md transition-shadow ${
                          isMultiSelectFoldersMode && selectedFolders.includes(folder.id) ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              {isMultiSelectFoldersMode && (
                                <Checkbox
                                  checked={selectedFolders.includes(folder.id)}
                                  onCheckedChange={() => toggleFolderSelection(folder.id)}
                                  className="mr-2"
                                />
                              )}
                              <Folder className="h-5 w-5 text-primary" />
                              {folder.name}
                            </CardTitle>

                            {!isMultiSelectFoldersMode && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleShareFolder(folder)
                                }}
                              >
                                <Share className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">
                            {folder.links.length} {folder.links.length === 1 ? "link" : "links"}
                          </p>
                          {!isMultiSelectFoldersMode && (
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
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Floating action button for mobile */}
        {isMobile && (
          <Button
            className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}

        <AddLinkModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={addLink} />

        <FolderModal
          isOpen={isFolderModalOpen}
          onClose={() => {
            setIsFolderModalOpen(false)
            setEditingFolder(null)
            setPendingLinkForFolder(null)
          }}
          folder={editingFolder}
          onSave={handleSaveFolder}
        />

        <MultiLinkShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          links={selectedLinkObjects}
          folders={folders}
        />

        {selectedFolderForShare && (
          <FolderShareModal
            isOpen={isFolderShareModalOpen}
            onClose={() => setIsFolderShareModalOpen(false)}
            folder={selectedFolderForShare}
            links={links}
          />
        )}

        <MultiFolderShareModal
          isOpen={isMultiFolderShareModalOpen}
          onClose={() => setIsMultiFolderShareModalOpen(false)}
          folders={folders.filter((folder) => selectedFolders.includes(folder.id))}
          links={links}
        />
      </main>
    </DndProvider>
  )
}

