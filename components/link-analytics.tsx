"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, TooltipProps } from "recharts"
import { Tag, FolderTree, TrendingUp, Calendar } from "lucide-react"

interface Link {
  category: string;
  tags: string[];
  dateAdded: string;
}

interface LinkAnalyticsProps {
  links: Link[];
}

export default function LinkAnalytics({ links }: LinkAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("categories")

  // Calculate category distribution
  const categoryData = Object.entries(
    links.reduce((acc: { [key: string]: number }, link) => {
      acc[link.category] = (acc[link.category] || 0) + 1
      return acc
    }, {}),
  ).map(([name, value]) => ({ name, value }))

  // Calculate tag distribution (top 10)
  const tagCounts = links.reduce((acc: { [key: string]: number }, link) => {
    link.tags.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {})

  const tagData = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }))

  // Calculate links added over time (by month)
  const timeData = links.reduce((acc: { [key: string]: number }, link) => {
    const date = new Date(link.dateAdded)
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`

    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  const timeSeriesData = Object.entries(timeData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, value]) => ({
      name: name.split("-")[1] + "/" + name.split("-")[0].slice(2),
      value,
    }))

  // Colors for charts
  const COLORS = [
    "#3b82f6",
    "#ec4899",
    "#f97316",
    "#10b981",
    "#8b5cf6",
    "#f43f5e",
    "#64748b",
    "#06b6d4",
    "#eab308",
    "#6366f1",
    "#6b7280",
  ]

  const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-2 text-sm">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-primary">{`Count: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Link Analytics
        </CardTitle>
        <CardDescription>Insights about your link collection</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="tags">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tagData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#8884d8">
                    {tagData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="time">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

