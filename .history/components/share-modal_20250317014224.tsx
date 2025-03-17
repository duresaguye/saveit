"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, Mail, Share, Twitter, Facebook, Linkedin, Users, Plus, X, Edit, Trash } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function ShareModal({ isOpen, onClose, link }) {
  const [shareType, setShareType] = useState("link")
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [expirationDays, setExpirationDays] = useState("7")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [groups, setGroups] = useState([])
  const [selectedGroups, setSelectedGroups] = useState([])
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupMembers, setNewGroupMembers] = useState("")
  const [editingGroup, setEditingGroup] = useState(null)
  

  // Load groups from localStorage on initial render
  useEffect(() => {
    const savedGroups = localStorage.getItem("chromo-groups")
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups))
    } else {
      // Sample groups
      const sampleGroups = [
        {
          id: "1",
          name: "Work Team",
          members: [
            { email: "colleague1@example.com", name: "Alex Johnson" },
            { email: "colleague2@example.com", name: "Sam Smith" },
            { email: "manager@example.com", name: "Taylor Wong" },
          ],
        },
        {
          id: "2",
          name: "Friends",
          members: [
            { email: "friend1@example.com", name: "Jordan Lee" },
            { email: "friend2@example.com", name: "Casey Brown" },
          ],
        },
      ]
      setGroups(sampleGroups)
      localStorage.setItem("chromo-groups", JSON.stringify(sampleGroups))
    }
  }, [])

  // Save groups to localStorage whenever they change
  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem("chromo-groups", JSON.stringify(groups))
    }
  }, [groups])

  // Generate a shareable link
  const generateShareableLink = () => {
    // In a real app, this would create a unique link with proper authentication
    // For this demo, we'll just create a dummy link
    const baseUrl = window.location.origin
    const shareId = Math.random().toString(36).substring(2, 10)
    return `${baseUrl}/shared/${shareId}?id=${link.id}${includeMetadata ? "&meta=1" : ""}${expirationDays ? `&exp=${expirationDays}` : ""}`
  }

  const shareableLink = generateShareableLink()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink)
    toast("The shareable link has been copied to your clipboard.",
    )
  }

  const shareViaEmail = () => {
    // In a real app, this would send an email through a backend service
    // For this demo, we'll just open the default email client
    const subject = `Check out this link: ${link.title}`
    const body = `${message}\n\nLink: ${link.url}\n\nShared via Chromo Extensions`
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)

    toast("Your default email client has been opened.",
    )
  }

  const shareWithGroups = () => {
    if (selectedGroups.length === 0) {
      toast( "Please select at least one group to share with.",
       )
      return
    }

    // Get all email addresses from selected groups
    const recipients = selectedGroups.flatMap((groupId) => {
      const group = groups.find((g) => g.id === groupId)
      return group ? group.members.map((member) => member.email) : []
    })

    // Remove duplicates
    const uniqueRecipients = [...new Set(recipients)]

    // In a real app, this would send emails through a backend service
    // For this demo, we'll just open the default email client with BCC
    const subject = `Check out this link: ${link.title}`
    const body = `${message || "I thought you might find this interesting"}\n\nLink: ${link.url}\n\nShared via Chromo Extensions`
    window.open(
      `mailto:?bcc=${uniqueRecipients.join(",")}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    )

    toast( `Sharing with ${uniqueRecipients.length} recipients.`,
    )
  }

  const shareViaSocial = (platform) => {
    let url
    const text = `Check out this link: ${link.title}`

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link.url)}`
        break
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link.url)}`
        break
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link.url)}`
        break
      default:
        return
    }

    window.open(url, "_blank", "width=600,height=400")

    toast(`Opening ${platform} to share your link.`,
    )
  }

  const handleGroupSelection = (groupId) => {
    setSelectedGroups((prev) => {
      if (prev.includes(groupId)) {
        return prev.filter((id) => id !== groupId)
      } else {
        return [...prev, groupId]
      }
    })
  }

  const addNewGroup = () => {
    if (!newGroupName.trim()) {
      toast( "Please enter a name for your group.",
        )
      return
    }

    // Parse email addresses
    const memberEmails = newGroupMembers
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email)

    if (memberEmails.length === 0) {
      toast( "Please add at least one member to your group.",
        )
      return
    }

    // Create member objects
    const members = memberEmails.map((email) => {
      // Extract name from email (before @) for the display name
      const name = email
        .split("@")[0]
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")

      return { email, name }
    })

    if (editingGroup) {
      // Update existing group
      setGroups((prev) =>
        prev.map((group) => (group.id === editingGroup.id ? { ...group, name: newGroupName, members } : group)),
      )

      toast( `"${newGroupName}" has been updated.`,
      )
    } else {
      // Add new group
      const newGroup = {
        id: Date.now().toString(),
        name: newGroupName,
        members,
      }

      setGroups((prev) => [...prev, newGroup])

      toast( `"${newGroupName}" has been created.`,
      )
    }

    // Reset form
    setNewGroupName("")
    setNewGroupMembers("")
    setShowGroupForm(false)
    setEditingGroup(null)
  }

  const editGroup = (group) => {
    setEditingGroup(group)
    setNewGroupName(group.name)
    setNewGroupMembers(group.members.map((member) => member.email).join(", "))
    setShowGroupForm(true)
  }

  const deleteGroup = (groupId) => {
    setGroups((prev) => prev.filter((group) => group.id !== groupId))
    setSelectedGroups((prev) => prev.filter((id) => id !== groupId))

    toast( "The group has been removed.",
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share "{link.title}"
          </DialogTitle>
        </DialogHeader>

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
                <Checkbox id="include-metadata" checked={includeMetadata} onCheckedChange={setIncludeMetadata} />
                <Label htmlFor="include-metadata">Include tags and description</Label>
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
                placeholder="I thought you might find this interesting..."
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
            {showGroupForm ? (
              <div className="space-y-4 border rounded-md p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{editingGroup ? "Edit Group" : "Create New Group"}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowGroupForm(false)
                      setEditingGroup(null)
                      setNewGroupName("")
                      setNewGroupMembers("")
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    placeholder="Team, Friends, Family, etc."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group-members">Members (comma separated emails)</Label>
                  <textarea
                    id="group-members"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="john@example.com, jane@example.com"
                    value={newGroupMembers}
                    onChange={(e) => setNewGroupMembers(e.target.value)}
                  />
                </div>

                <Button onClick={addNewGroup}>{editingGroup ? "Update Group" : "Create Group"}</Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Your Groups</h3>
                  <Button variant="outline" size="sm" onClick={() => setShowGroupForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Group
                  </Button>
                </div>

                {groups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>You don't have any groups yet.</p>
                    <p className="text-sm">Create a group to share with multiple people at once.</p>
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
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => editGroup(group)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => deleteGroup(group.id)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
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
                        placeholder="I thought you might find this interesting..."
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
              </>
            )}
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 space-y-2"
                onClick={() => shareViaSocial("twitter")}
              >
                <Twitter className="h-8 w-8" />
                <span>Twitter</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 space-y-2"
                onClick={() => shareViaSocial("facebook")}
              >
                <Facebook className="h-8 w-8" />
                <span>Facebook</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 space-y-2"
                onClick={() => shareViaSocial("linkedin")}
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
          {shareType === "groups" && !showGroupForm && (
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

