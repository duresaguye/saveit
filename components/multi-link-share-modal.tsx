"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, Mail, Twitter, Linkedin, Folder, Users, Send } from "lucide-react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface MultiFolderShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: { id: string; name: string; links: string[] }[];
  links: { id: string; title: string; url: string }[];
}

export default function MultiFolderShareModal({ isOpen, onClose, folders, links }: MultiFolderShareModalProps) {
  const [shareType, setShareType] = useState("link")
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [expirationDays, setExpirationDays] = useState("7")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [collectionName, setCollectionName] = useState(`Folder Collection (${new Date().toLocaleDateString()})`)

  interface Group {
    id: string;
    name: string;
    members: { name: string; email: string }[];
  }

  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])

  useEffect(() => {
    const savedGroups = localStorage.getItem("chromo-groups")
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups))
    }
  }, [])

  const getAllFolderLinks = () => {
    const allLinkIds = folders.flatMap((folder) => folder.links)
    const uniqueLinkIds = [...new Set(allLinkIds)]
    return uniqueLinkIds.map((id) => links.find((link) => link.id === id)).filter(Boolean)
  }

  const folderLinks = getAllFolderLinks()

  const generateShareableLink = () => {
    const baseUrl = window.location.origin
    const folderIds = folders.map((folder) => folder.id).join(",")
    return `${baseUrl}/shared/folders/${Date.now()}?ids=${folderIds}`
  }

  const shareableLink = generateShareableLink()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink)
    toast("The shareable link has been copied to your clipboard.")
  }

  const shareViaEmail = () => {
    const subject = `Check out these folders: ${collectionName}`
    const foldersList = folders
      .map((folder, index) => {
        const folderLinks = folder.links
          .map((id) => links.find((link) => link.id === id))
          .filter(Boolean)
          .map((link) => link ? `   - ${link.title}: ${link.url}` : "")
          .join("\n")

        return `${index + 1}. ${folder.name} (${folder.links.length} links):\n${folderLinks}`
      })
      .join("\n\n")

    const body = `${message || "I thought you might find these folders interesting"}

I'm sharing a collection of folders with you: "${collectionName}"

Folders in this collection:
${foldersList}

You can view all these folders at once here: ${shareableLink}

Shared via Chromo Extensions`

    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
    toast("Your default email client has been opened with all folders in the collection.")
  }

  const shareWithGroups = () => {
    if (selectedGroups.length === 0) {
      toast("Please select at least one group to share with.")
      return
    }

    const recipients = selectedGroups.flatMap((groupId) => {
      const group = groups.find((g) => g.id === groupId)
      return group ? group.members.map((member) => member.email) : []
    })

    const uniqueRecipients = [...new Set(recipients)]
    const foldersList = folders
      .map((folder, index) => {
        const folderLinks = folder.links
          .map((id) => links.find((link) => link.id === id))
          .filter(Boolean)
          .map((link) => link ? `   - ${link.title}: ${link.url}` : "")
          .join("\n")

        return `${index + 1}. ${folder.name} (${folder.links.length} links):\n${folderLinks}`
      })
      .join("\n\n")

    const subject = `Check out these folders: ${collectionName}`
    const body = `${message || "I thought you might find these folders interesting"}

I'm sharing a collection of folders with you: "${collectionName}"

Folders in this collection:
${foldersList}

You can view all these folders at once here: ${shareableLink}

Shared via Chromo Extensions`

    window.open(
      `mailto:?bcc=${uniqueRecipients.join(",")}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    )

    toast(`Sharing with ${uniqueRecipients.length} recipients.`)
  }

  const handleGroupSelection = (groupId: string) => {
    setSelectedGroups((prev) => 
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    )
  }

  interface ShareViaSocialProps {
    platform: "twitter" | "telegram" | "linkedin";
  }

  const shareViaSocial = ({ platform }: ShareViaSocialProps) => {
    let url: string;
    const text = `Check out these folders: ${collectionName}`;
    const fullMessage = `${text} - ${shareableLink}`;

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareableLink)}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodeURIComponent(shareableLink)}&text=${encodeURIComponent(fullMessage)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableLink)}`;
        break;
      default:
        return;
    }

    window.open(url, "_blank", "width=600,height=400");
    toast(`Opening ${platform} to share your folder collection.`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Share Folders ({folders.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="collection-name">Collection Name</Label>
            <Input
              id="collection-name"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="My Folder Collection"
            />
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="bg-muted p-2 font-medium text-sm">Selected Folders</div>
            <ScrollArea className="h-[150px]">
              <div className="p-2 space-y-2">
                {folders.map((folder) => (
                  <Card key={folder.id} className="p-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <Folder className="h-4 w-4 text-primary" />
                          {folder.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {folder.links.length} {folder.links.length === 1 ? "link" : "links"}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Folder
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="text-sm text-muted-foreground">
            Total links: {folderLinks.length} across {folders.length} folders
          </div>
        </div>

        <Tabs defaultValue="link" onValueChange={setShareType}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label>Shareable Link</Label>
              <div className="flex gap-2">
                <Input value={shareableLink} readOnly className="flex-1" />
                <Button variant="outline" size="icon" onClick={copyToClipboard} title="Copy to clipboard">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-metadata" 
                  checked={includeMetadata} 
                  onCheckedChange={(checked) => setIncludeMetadata(checked === true)} 
                />
                <Label htmlFor="include-metadata">Include tags and descriptions</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration">Link expiration</Label>
              <select
                id="expiration"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={expirationDays}
                onChange={(e) => setExpirationDays(e.target.value)}
              >
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="never">Never expires</option>
              </select>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <Label>Sharing folder collection</Label>
                <Badge variant="outline">{folders.length} folders</Badge>
              </div>
              <div className="bg-muted/50 p-2 rounded-md text-sm">
                <p className="font-medium">{collectionName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  The recipient will receive a link to view all {folders.length} folders with {folderLinks.length}{" "}
                  links.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <textarea
                id="message"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="I thought you might find these folders interesting..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={shareViaEmail} disabled={!email}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Share with Groups
                </Label>
                <Badge variant="outline">{folders.length} folders</Badge>
              </div>
              <div className="bg-muted/50 p-2 rounded-md text-sm">
                <p className="font-medium">{collectionName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Select groups to share these folders with multiple people at once.
                </p>
              </div>
            </div>

            {groups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>You don't have any groups yet.</p>
                <p className="text-sm">Create groups in the Groups page to share with multiple people at once.</p>
                <Button variant="outline" className="mt-4" onClick={() => (window.location.href = "/groups")}>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Groups
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[200px] border rounded-md p-2">
                <div className="space-y-2">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className={`flex items-start justify-between p-2 rounded-md ${
                        selectedGroups.includes(group.id) ? "bg-muted" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id={`group-${group.id}`}
                          checked={selectedGroups.includes(group.id)}
                          onCheckedChange={() => handleGroupSelection(group.id)}
                        />
                        <div>
                          <Label htmlFor={`group-${group.id}`} className="font-medium cursor-pointer">
                            {group.name}
                          </Label>
                          <div className="text-xs text-muted-foreground mt-1">
                            {group.members.length} {group.members.length === 1 ? "member" : "members"}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {group.members.slice(0, 3).map((member, idx) => (
                              <Avatar key={idx} className="h-6 w-6">
                                <AvatarFallback className="text-[10px]">
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {group.members.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{group.members.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {groups.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="group-message">Message (Optional)</Label>
                  <textarea
                    id="group-message"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="I thought you might find these folders interesting..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <Button className="w-full" onClick={shareWithGroups} disabled={selectedGroups.length === 0}>
                  <Users className="h-4 w-4 mr-2" />
                  Share with Selected Groups
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 space-y-2"
                onClick={() => shareViaSocial({ platform: "twitter" })}
              >
                <Twitter className="h-8 w-8" />
                <span>Twitter</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 space-y-2"
                onClick={() => shareViaSocial({ platform: "telegram" })}
              >
                <Send className="h-8 w-8" />
                <span>Telegram</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 space-y-2"
                onClick={() => shareViaSocial({ platform: "linkedin" })}
              >
                <Linkedin className="h-8 w-8" />
                <span>LinkedIn</span>
              </Button>
            </div>

            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                Sharing will open the respective platform in a new window.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {shareType === "link" && (
            <Button onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          )}
          {shareType === "email" && (
            <Button onClick={shareViaEmail} disabled={!email}>
              <Mail className="h-4 w-4 mr-2" />
              Send
            </Button>
          )}
          {shareType === "groups" && (
            <Button onClick={shareWithGroups} disabled={selectedGroups.length === 0}>
              <Users className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}