"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  FileText,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

// Mock data
const mockLogs = [
  {
    id: '1',
    requestId: 'req_abc123',
    model: 'gpt-4',
    platform: 'openai',
    latency: 234,
    success: true,
    inputTokens: 150,
    outputTokens: 250,
    time: '2024-01-15 14:30:25'
  },
  {
    id: '2',
    requestId: 'req_def456',
    model: 'claude-3-opus',
    platform: 'anthropic',
    latency: 456,
    success: true,
    inputTokens: 200,
    outputTokens: 180,
    time: '2024-01-15 14:30:20'
  },
  {
    id: '3',
    requestId: 'req_ghi789',
    model: 'gemini-pro',
    platform: 'google',
    latency: 189,
    success: false,
    inputTokens: 100,
    outputTokens: 0,
    time: '2024-01-15 14:30:15'
  }
]

export default function LogsPage() {
  const [search, setSearch] = React.useState('')
  const [selectedLog, setSelectedLog] = React.useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Request Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            View and analyze API request history
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" size="sm">
          <Clock className="mr-2 h-4 w-4" />
          Last 24h
        </Button>
      </div>

      {/* Logs Table */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <TableRow 
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedLog(selectedLog === log.id ? null : log.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {selectedLog === log.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="text-sm text-muted-foreground">{log.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{log.model}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.platform}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "font-medium",
                        log.latency < 300 ? "text-green-600" : "text-yellow-600"
                      )}>
                        {log.latency}ms
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {log.inputTokens + log.outputTokens}
                      </span>
                    </TableCell>
                    <TableCell>
                      {log.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                  {selectedLog === log.id && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30">
                        <div className="p-4 space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Request ID:</span>
                              <span className="ml-2 font-mono">{log.requestId}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Input Tokens:</span>
                              <span className="ml-2">{log.inputTokens}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Output Tokens:</span>
                              <span className="ml-2">{log.outputTokens}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Tokens:</span>
                              <span className="ml-2">{log.inputTokens + log.outputTokens}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 1-10 of 1,234 logs
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
