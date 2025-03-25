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
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch summary")
      }

      const data = await response.json()
      
      // Handle structured response
      setSummary(data.summary || "No summary available.")
      setSuggestedTags(Array.isArray(data.tags) ? data.tags : [])

      toast.success("AI analysis complete", {
        description: "Content successfully summarized and tagged"
      })
      
    } catch (error: any) {
      console.error("Generation error:", error)
      toast.error("Analysis failed", {
        description: error.message || "Failed to process content"
      })
    } finally {
      setLoading(false)
    }
  }

  const applySummaryAndTags = () => {
    onSummaryComplete({
      description: summary,
      suggestedTags: suggestedTags.filter(t => t.trim().length > 0),
    })
    toast.info("Content applied", {
      description: "Summary and tags added to your link"
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
    toast("Summary copied to clipboard")
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          AI Content Analysis
        </CardTitle>
        <CardDescription>Generate semantic summary and contextual tags</CardDescription>
      </CardHeader>

      <CardContent>
        {!summary ? (
          <div className="flex justify-center">
            <Button
              onClick={generateSummary}
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              aria-label="Generate AI summary"
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
                <h3 className="text-sm font-medium">Content Analysis</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={copyToClipboard} 
                    className="h-6 w-6"
                    aria-label="Copy summary"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-md text-sm space-y-2">
                {summary.split('\n').map((line, index) => (
                  <p key={index} className="text-pretty">
                    {line.replace(/^\d+\.\s*/, '')} {/* Remove numbered prefixes */}
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Contextual Tags</h3>
                <Tag className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestedTags.length > 0 ? (
                  suggestedTags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="text-xs font-medium capitalize"
                    >
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted">No relevant tags identified</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {summary && (
        <CardFooter>
          <Button 
            onClick={applySummaryAndTags} 
            className="w-full bg-green-600 hover:bg-green-700"
            aria-label="Apply summary and tags"
          >
            <Check className="h-4 w-4 mr-2" />
            Apply Analysis
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}