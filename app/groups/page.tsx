"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Trash2, Edit, ArrowLeft, Mail, Search } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { useMobile } from "@/hooks/use-mobile"

interface Member {
  email: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  members: Member[];
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [showForm, setShowForm] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupMembers, setGroupMembers] = useState("")
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const isMobile = useMobile()

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast("Please enter a name for your group.");
      return;
    }

    // Parse email addresses
    const memberEmails = groupMembers
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);

    if (memberEmails.length === 0) {
      toast("Please add at least one member to your group.");
      return;
    }

    // Create member objects
    const members: Member[] = memberEmails.map((email) => {
      // Extract name from email (before @) for the display name
      const name = email
        .split("@")[0]
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

      return { email, name };
    });

    if (editingGroup) {
      // Update existing group
      setGroups((prev) =>
        prev.map((group) =>
          group.id === editingGroup.id ? { ...group, name: groupName, members } : group
        )
      );

      toast(`"${groupName}" has been updated.`);
    } else {
      // Add new group
      const newGroup: Group = {
        id: Date.now().toString(),
        name: groupName,
        members,
      };

      setGroups((prev) => [...prev, newGroup]);

      toast(`"${groupName}" has been created.`);
    }

    // Reset form
    setGroupName("");
    setGroupMembers("");
    setShowForm(false);
    setEditingGroup(null);
  };

  const editGroup = (group: Group) => {
    setEditingGroup(group)
    setGroupName(group.name)
    setGroupMembers(group.members.map((member) => member.email).join(", "))
    setShowForm(true)
  }

  const deleteGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((group) => group.id !== groupId))
    toast("The group has been removed.")
  }

  const emailGroup = (group: Group) => {
    const emails = group.members.map((member) => member.email)
    window.open(`mailto:?bcc=${emails.join(",")}`)
    toast("Your default email client has been opened.")
  }

  // Filter groups based on search query
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.members.some(member => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4"/>
                  Back to Home
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Sharing Groups
                </h1>
                <p className="text-muted-foreground">
                  {groups.length} {groups.length === 1 ? 'group' : 'groups'} in total
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
                placeholder="Search groups or members..."
                className="pl-10 w-full bg-background/50 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={() => setShowForm(true)}
                disabled={showForm}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">New Group</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>

          {showForm && (
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">
                    {editingGroup ? "Edit Group" : "Create New Group"}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {editingGroup 
                      ? "Update the group details below." 
                      : "Create a group to easily share links with multiple people at once."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Group Name</Label>
                    <Input
                      id="group-name"
                      placeholder="Team, Friends, Family, etc."
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="bg-background/50 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-members">Members (comma separated emails)</Label>
                    <textarea
                      id="group-members"
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="bg-background/50 hover:bg-background/80"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md transition-all"
                  >
                    {editingGroup ? "Update Group" : "Create Group"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {filteredGroups.length === 0 && !showForm ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card/50 rounded-2xl border-2 border-dashed border-muted-foreground/20">
              <div className="p-5 rounded-full bg-primary/10 mb-5">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight mb-2">
                {searchQuery ? 'No Groups Found' : 'No Groups Yet'}
              </h2>
              <p className="text-muted-foreground max-w-md mb-6">
                {searchQuery
                  ? 'No groups match your search. Try a different term.'
                  : 'Get started by creating your first sharing group.'}
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md transition-all px-6 py-5"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Group
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredGroups.map((group) => (
                <Card 
                  key={group.id} 
                  className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:ring-1 hover:ring-border bg-card/50 backdrop-blur-sm border h-full flex flex-col"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold line-clamp-1">
                            {group.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            emailGroup(group);
                          }}
                          title="Email group"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            editGroup(group);
                          }}
                          title="Edit group"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteGroup(group.id);
                          }}
                          title="Delete group"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 flex-1">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Members</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 -mr-2">
                          {group.members.map((member, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                              <Avatar className="h-9 w-9 border">
                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-xs">
                                  {member.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{member.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
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
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}