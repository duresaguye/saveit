"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Bookmark, Share2, Users, FolderTree, ArrowRight, Search, Plus, Folder, FolderPlus, Share ,LogIn, UserPlus} from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import ThemeToggle from "@/components/theme-toggle"
import { Navbar } from "@/components/Navbar"
import { authClient } from "@/utils/auth-client"
import { useRouter } from "next/navigation"
import { useEffect as reactUseEffect } from "react";





export default function LandingPage() {
  const router = useRouter()
  
  const { 
    data: session, 
    isPending: sessionLoading,
    error: sessionError,
    refetch: refetchSession
  } = authClient.useSession()

  
  useEffect(() => {
    if (!sessionLoading && session) {
      router.push("/folders")
    }
  }, [session, sessionLoading, router])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_600px] lg:gap-12 xl:grid-cols-[1fr_700px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Save, Organize & Share Your Resources
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    SaveIT helps you organize your favorite links in categories, share them through social media, and
                    collaborate with others in groups.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="px-8">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                 
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-full md:h-[450px] lg:h-[500px]">
                  <Image
                    src="/saveIT.png"
                    alt="SaveIT Dashboard Preview"
                  
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 ">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Everything you need to organize your resources
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  SaveIT provides powerful tools to save, categorize, and share your favorite links with others.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="grid gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <FolderTree className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Organize in Categories</h3>
                  <p className="text-muted-foreground">
                    Create custom categories and folders to organize your resources in a way that makes sense to you.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Share2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Share Across Platforms</h3>
                  <p className="text-muted-foreground">
                    Share your saved resources directly to social media platforms with just a few clicks.
                  </p>
                </div>
              </div>
              <div className="grid gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Collaborate in Groups</h3>
                  <p className="text-muted-foreground">
                    Create or join groups to collaborate and share resources with friends, colleagues, or communities.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Bookmark className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Save Anything</h3>
                  <p className="text-muted-foreground">
                    Save articles, videos, images, and more with our browser extension or by pasting links directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        
      </main>
      <footer className="w-full border-t bg-background">
        <div className="container py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex gap-2 items-center text-xl font-bold">
              <Bookmark className="h-6 w-6 text-primary" />
              <span>SaveIT</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} SaveIT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
function useEffect(callback: () => void, dependencies: any[]) {
  reactUseEffect(callback, dependencies);
}

