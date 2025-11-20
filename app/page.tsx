"use client"
import React from 'react'
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Bookmark, Share2, Users, FolderTree, ArrowRight, Sparkles, Zap, Globe, Shield, Star, Rocket, Palette, MousePointerClick, Cloud, Lock, Infinity, LucideIcon } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { authClient } from "@/utils/auth-client"
import { useRouter } from "next/navigation"
import { useEffect as reactUseEffect, useState } from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

// Define proper TypeScript interfaces
interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

interface Stat {
  number: string;
  label: string;
}

interface GridFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export default function LandingPage() {
  const router = useRouter()
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)
  
  const { 
    data: session, 
    isPending: sessionLoading,
  } = authClient.useSession()

  reactUseEffect(() => {
    setMounted(true)
  }, [])

  reactUseEffect(() => {
    if (!sessionLoading && session) {
      router.replace("/folders")
    }
  }, [session, sessionLoading, router])

  reactUseEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features: Feature[] = [
    {
      icon: Bookmark as unknown as LucideIcon,
      title: "Save Anything",
      description: "Save links, articles, and files in one place with a single click.",
      color: "from-teal-500 to-emerald-600",
      bgColor: "bg-teal-50 dark:bg-teal-900/20"
    },
    {
      icon: FolderTree as unknown as LucideIcon,
      title: "Organize with Ease",
      description: "Create custom folders and tags to keep your saved items neatly organized.",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      icon: Share2 as unknown as LucideIcon,
      title: "Share & Collaborate",
      description: "Easily share your collections with team members or the world.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: Users as unknown as LucideIcon,
      title: "Team Workspaces",
      description: "Collaborate with your team in shared workspaces.",
      color: "from-teal-400 to-emerald-500",
      bgColor: "bg-teal-50/80 dark:bg-teal-900/20"
    }
  ]

  const stats: Stat[] = [
    { number: "50K+", label: "Active Users" },
    { number: "2M+", label: "Resources Saved" },
    { number: "99.9%", label: "Uptime" },
    { number: "4.8", label: "Rating" }
  ]

  const gridFeatures: GridFeature[] = [
    {
      icon: Cloud as unknown as LucideIcon,
      title: "Cloud Sync",
      description: "Access your resources from any device, anywhere",
      color: "from-teal-500 to-emerald-500"
    },
    
    {
      icon: Infinity as unknown as LucideIcon,
      title: "Unlimited Resources",
      description: "Save as many links, files, and notes as you need",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Palette as unknown as LucideIcon,
      title: "Custom Themes",
      description: "Personalize your workspace with dark mode and custom colors",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Zap as unknown as LucideIcon,
      title: "Lightning Fast",
      description: "Instant search and navigation with optimized performance",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Shield as unknown as LucideIcon,
      title: "Privacy First",
      description: "We never sell your data. You own everything you save",
      color: "from-indigo-500 to-blue-500"
    }
  ]

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 dark:from-slate-950 dark:via-teal-950/80 dark:to-emerald-950/80">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity as unknown as number }}
            className="w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full mx-auto"
          />
          <p className="text-lg font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            Preparing your workspace...
          </p>
        </div>
      </div>
    )
  }

  if (session) return null

  const currentTheme = mounted ? resolvedTheme : 'light'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 dark:from-slate-950 dark:via-teal-950/80 dark:to-emerald-950/80 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <Navbar />
      
      <main className="relative">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="container max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-200 dark:border-slate-700 mb-8"
                >
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                    Join 50,000+ organized users
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </motion.div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                  <span className="block bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Organize Your
                  </span>
                  <span className="block bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
                    Digital Universe
                  </span>
                </h1>

                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl leading-relaxed">
                  SaveIT transforms how you collect, organize, and share resources. With AI-powered organization and beautiful collaboration tools, never lose a link again.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/signup">
                      <Button className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl">
                        <Rocket className="mr-3 h-5 w-5" />
                        Start Free Trial
                        <ArrowRight className="ml-3 h-5 w-5" />
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="px-8 py-6 text-lg font-semibold border-2 rounded-2xl backdrop-blur-sm bg-white/50 dark:bg-slate-900/50">
                      <MousePointerClick className="mr-3 h-5 w-5" />
                      Live Demo
                    </Button>
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                        {stat.number}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative bg-gradient-to-br from-white/80 to-white/20 dark:from-slate-900/80 dark:to-slate-900/20 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentFeature}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="text-center"
                    >
                      <div className={`inline-flex p-4 rounded-2xl mb-6 ${features[currentFeature].bgColor}`}>
                        {React.createElement(features[currentFeature].icon, { 
                          className: `h-8 w-8 bg-gradient-to-r ${features[currentFeature].color} bg-clip-text text-transparent`,
                          key: `feature-icon-${currentFeature}`
                        })}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        {features[currentFeature].title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        {features[currentFeature].description}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                  
                  <div className="flex justify-center gap-2 mt-6">
                    {features.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentFeature(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentFeature 
                            ? 'bg-teal-600 w-6' 
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity as unknown as number }}
                  className="absolute -top-4 -left-4 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-2xl border"
                >
<FolderTree className="h-6 w-6 text-teal-500" key="floating-folder" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity as unknown as number, delay: 1 }}
                  className="absolute -bottom-4 -right-4 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-2xl border"
                >
                  <Users className="h-6 w-6 text-emerald-500" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="relative py-32 px-4 sm:px-6 lg:px-8">
          <div className="container max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Everything You Need
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Packed with powerful features to supercharge your productivity and collaboration
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridFeatures.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                  >
                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-32 px-4 sm:px-6 lg:px-8">
          <div className="container max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-3xl p-12 shadow-2xl"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
                Join thousands of productive teams and individuals who use SaveIT to stay organized and collaborative.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/signup">
                    <Button className="px-8 py-6 text-lg font-semibold bg-white text-blue-600 hover:bg-blue-50 rounded-2xl shadow-2xl">
                      <Rocket className="mr-3 h-5 w-5" />
                      Start Free Today
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="px-8 py-6 text-lg font-semibold border-2 border-white text-blue-600 hover:bg-white/10 rounded-2xl">
                    Watch Demo
                  </Button>
                </motion.div>
              </div>
              <p className="text-blue-200 text-sm mt-6">
                No credit card required • Free 14-day trial • Setup in 2 minutes
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-3">
                <Bookmark className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  SaveIT
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Organize your digital universe
                </p>
              </div>
            </div>
            
            <div className="flex gap-8 text-sm">
              <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                Contact
              </Link>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} SaveIT. Crafted with <span className="text-teal-500">💚</span> for organized minds.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}