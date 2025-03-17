"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Trash, Edit, ArrowLeft, Mail } from "lucide-react"
import { toast } from "sonner"

import Link from "next/link"

export default function GroupsPage() {
  const [groups, setGroups] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupMembers, setGroupMembers] = useState("")
  const [editingGroup, setEditingGroup] = useState(null)


  // Load groups from localStorage on initial render
  useEffect(() => {
    const savedGroups = localStorage.getItem("chromo-groups")
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups))
    }
  }, [])

  // Save groups to localStorage whenever they change
  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem("chromo-groups", JSON.stringify(groups))
    }
  }, [groups])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!groupName.trim()) {
      toast("Please enter a name for your group.",
      )
      return
    }

    // Parse email addresses
    const memberEmails = groupMembers
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email)

    if (memberEmails.length === 0) {
      toast("Please add at least one member to your group.",
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
        prev.map((group) => (group.id === editingGroup.id ? { ...group, name: groupName, members } : group)),
      )

      toast(`"${groupName}" has been updated.`,
      )
    } else {
      // Add new group
      const newGroup = {
        id: Date.now().toString(),
        name: groupName,
        members,
      }

      setGroups((prev) => [...prev, newGroup])

      toast({
        title: "Group created",
        description: `"${groupName}" has been created.`,
      })
    }

    // Reset form
    setGroupName("")
    setGroupMembers("")
    setShowForm(false)
    setEditingGroup(null)
  }

  const editGroup = (group) => {
    setEditingGroup(group)
    setGroupName(group.name)
    setGroupMembers(group.members.map((member) => member.email).join(", "))
    setShowForm(true)
  }

  const deleteGroup = (groupId) => {
    setGroups((prev) => prev.filter((group) => group.id !== groupId))

    toast({
      title: "Group deleted",
      description: "The group has been removed.",
    })
  }

  const emailGroup = (group) => {
    const emails = group.members.map((member) => member.email)
    window.open(`mailto:?bcc=${emails.join(",")}`)

    toast({
      title: "Email prepared",
      description: "Your default email client has been opened.",
    })
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sharing Groups</h1>
          <p className="text-muted-foreground">Manage groups for easy sharing</p>
        </div>

        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-4 w-4 mr-2" />
          New Group
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>{editingGroup ? "Edit Group" : "Create New Group"}</CardTitle>
              <CardDescription>Create a group to easily share links with multiple people at once.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  placeholder="Team, Friends, Family, etc."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-members">Members (comma separated emails)</Label>
                <textarea
                  id="group-members"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="john@example.com, jane@example.com"
                  value={groupMembers}
                  onChange={(e) => setGroupMembers(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Names will be automatically generated from email addresses.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingGroup(null)
                  setGroupName("")
                  setGroupMembers("")
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{editingGroup ? "Update Group" : "Create Group"}</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {groups.length === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
          <h2 className="text-xl font-medium mb-2">No Groups Yet</h2>
          <p className="text-muted-foreground mb-6">
            Create groups to easily share links with multiple people at once.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Group
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => emailGroup(group)}
                      title="Email group"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => editGroup(group)}
                      title="Edit group"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteGroup(group.id)}
                      title="Delete group"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {group.members.length} {group.members.length === 1 ? "member" : "members"}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2 mb-2">
                  {group.members.slice(0, 5).map((member, idx) => (
                    <Avatar key={idx} className="h-8 w-8" title={member.name}>
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {group.members.length > 5 && <Badge variant="outline">+{group.members.length - 5}</Badge>}
                </div>

                <div className="text-sm text-muted-foreground max-h-24 overflow-y-auto">
                  {group.members.map((member, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1">
                      <span>{member.name}</span>
                      <span className="text-xs opacity-70">{member.email}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

