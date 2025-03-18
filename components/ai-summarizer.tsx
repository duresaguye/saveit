"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, Check, Copy, Tag } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"

interface AISummarizerProps {
  url: string;
  onSummaryComplete: (data: { description: string; suggestedTags: string[] }) => void;
}

export default function AISummarizer({ url, onSummaryComplete }: AISummarizerProps) {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState("")
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])


  const generateSummary = async () => {
    setLoading(true)

    try {
      // In a real app, this would call an AI service like OpenAI
      // For this demo, we'll simulate the AI response
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate a fake summary based on the URL
      const domain = new URL(url).hostname.replace("www.", "")

      let fakeSummary = ""
      let fakeTags = []

      if (domain.includes("github")) {
        fakeSummary =
          "This GitHub repository contains code and documentation for a software project. It includes installation instructions, usage examples, and contribution guidelines."
        fakeTags = ["github", "repository", "code", "development"]
      } else if (domain.includes("medium")) {
        fakeSummary =
          "This Medium article discusses modern web development techniques, focusing on performance optimization and user experience. It provides practical examples and case studies."
        fakeTags = ["article", "web-development", "performance", "ux"]
      } else if (domain.includes("youtube")) {
        fakeSummary =
          "This YouTube video demonstrates how to implement a specific feature in a web application. It includes step-by-step instructions and code examples."
        fakeTags = ["video", "tutorial", "coding", "demonstration"]
      } else if (domain.includes("docs")) {
        fakeSummary =
          "This documentation page provides detailed information about API endpoints, parameters, and response formats. It includes examples and troubleshooting tips."
        fakeTags = ["documentation", "api", "reference", "guide"]
      } else {
        fakeSummary = `This webpage from ${domain} contains valuable information related to technology and development. It covers key concepts and provides practical insights for implementation.`
        fakeTags = ["technology", domain.split(".")[0], "resource"]
      }

      setSummary(fakeSummary)
      setSuggestedTags(fakeTags)

      toast("AI has analyzed the content and generated a summary",
      )
    } catch (error) {
      toast("Failed to generate summary",
        )
    } finally {
      setLoading(false)
    }
  }

  const applySummaryAndTags = () => {
    onSummaryComplete({
      description: summary,
      suggestedTags: suggestedTags,
    })

    toast("Summary and tags have been applied",
    )
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
    toast( "Summary copied to clipboard",
    )
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          AI Content Analysis
        </CardTitle>
        <CardDescription>Generate a summary and suggested tags for this link</CardDescription>
      </CardHeader>

      <CardContent>
        {!summary ? (
          <div className="flex justify-center">
            <Button
              onClick={generateSummary}
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing content...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Summary
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium">Summary</h3>
                <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-6 w-6">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="p-3 bg-muted rounded-md text-sm">{summary}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Suggested Tags</h3>
                <Tag className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {summary && (
        <CardFooter>
          <Button onClick={applySummaryAndTags} className="w-full">
            <Check className="h-4 w-4 mr-2" />
            Apply to Link
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

