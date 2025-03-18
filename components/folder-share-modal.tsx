"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, Mail, Twitter, Facebook, Linkedin, Folder } from "lucide-react"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FolderShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: { name: string; links: string[] };
  links: { id: string; title: string; url: string }[];
}

export default function FolderShareModal({ isOpen, onClose, folder, links }: FolderShareModalProps) {
  const [shareType, setShareType] = useState("link")
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [expirationDays, setExpirationDays] = useState("7")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  // Get the actual link objects from their IDs
  const folderLinks = folder?.links.map((linkId) => links.find((link) => link.id === linkId)).filter(Boolean) || []

  // Generate a shareable link for the folder
  const generateShareableLink = () => {
    // In a real app, this would create a unique link with proper authentication
    // For this demo, we'll just create a dummy link
    const baseUrl = window.location.origin
    const shareId = Math.random().toString(36).substring(2, 10)
    const linkIds = folder?.links.join(",") || ""
    return `${baseUrl}/shared/folder/${shareId}?ids=${linkIds}${includeMetadata ? "&meta=1" : ""}${expirationDays ? `&exp=${expirationDays}` : ""}`
  }

  const shareableLink = generateShareableLink()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink)
    toast( "The shareable link has been copied to your clipboard.",
    )
  }

  const shareViaEmail = () => {
    // In a real app, this would send an email through a backend service
    // For this demo, we'll just open the default email client
    const subject = `Check out this folder: ${folder?.name}`

    // Create a list of links
    const linksList = folderLinks.map((link) => link ? `- ${link.title}: ${link.url}` : "").filter(Boolean).join("\n")

    const body = `${message}

Here's a folder of links I thought you might find interesting:

${linksList}

Shared via Chromo Extensions`
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)

    toast("Your default email client has been opened.",
    )
  }

  interface ShareViaSocialProps {
    platform: "twitter" | "facebook" | "linkedin";
  }

  const shareViaSocial = ({ platform }: ShareViaSocialProps) => {
    let url: string;
    const text = `Check out this folder: ${folder?.name}`;

    // For social sharing, we'll just share the folder link
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareableLink)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableLink)}`;
        break;
      default:
        return;
    }

    window.open(url, "_blank", "width=600,height=400");

    toast(`Opening ${platform} to share your folder.`);
  };

  if (!folder) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Share Folder: {folder.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mb-4">
          <div className="border rounded-md overflow-hidden">
            <div className="bg-muted p-2 font-medium text-sm">Links in this folder ({folderLinks.length})</div>
            <ScrollArea className="h-[150px]">
              <div className="p-2 space-y-2">
                {folderLinks.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">This folder is empty</div>
                ) : (
                  folderLinks.map((link) => 
                    link && (
                      <Card key={link.id} className="p-2">
                        <div className="font-medium">{link.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                      </Card>
                    )
                  )
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <Tabs defaultValue="link" onValueChange={setShareType}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
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
                <Checkbox id="include-metadata" checked={includeMetadata} onCheckedChange={(checked) => setIncludeMetadata(checked === true)} />
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
                placeholder="I thought you might find these links interesting..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={shareViaEmail} disabled={!email}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
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
                onClick={() => shareViaSocial({ platform: "facebook" })}
              >
                <Facebook className="h-8 w-8" />
                <span>Facebook</span>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

