"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  RefreshCw,
  Edit,
  Trash2,
  Eye
} from "lucide-react"

import { KeyStatusBadge, KeyStatusCell } from "@/components/shared/KeyStatusBadge"
import { api } from "@/lib/api"
import { KeyInfo } from "@/types/api"

// Mock data
const mockKeys: KeyInfo[] = [
  {
    id: '1',
    platform: 'openai',
    apiKey: 'sk-proj-abc123...',
    name: 'Primary OpenAI Key',
    models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4o'],
    quota: 1000,
    usedQuota: 450,
    status: 'active',
    failureCount: 0,
    lastChecked: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '2',
    platform: 'anthropic',
    apiKey: 'sk-ant-xyz789...',
    name: 'Claude API Key',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    quota: 500,
    usedQuota: 320,
    status: 'active',
    failureCount: 2,
    lastChecked: new Date(),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: '3',
    platform: 'moonshot',
    apiKey: 'sk-moon-abc...',
    name: 'Moonshot Key',
    models: ['moonshot-v1', 'moonshot-v1-128k'],
    quota: 200,
    usedQuota: 180,
    status: 'exhausted',
    failureCount: 0,
    lastChecked: new Date(),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date()
  },
  {
    id: '4',
    platform: 'zhipu',
    apiKey: 'zhipu-key-123...',
    name: 'Zhipu Key',
    models: ['glm-4', 'glm-3-turbo'],
    quota: 300,
    usedQuota: 150,
    status: 'active',
    failureCount: 0,
    lastChecked: new Date(),
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date()
  }
]

export default function KeysPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = React.useState('')
  const [platformFilter, setPlatformFilter] = React.useState('all')
  const [statusFilter, setStatusFilter] = React.useState('all')

  // In production, use React Query
  // const { data: keys, isLoading } = useQuery({
  //   queryKey: ['keys', search, platformFilter, statusFilter],
  //   queryFn: () => api.keys.getAll({ search, platform: platformFilter, status: statusFilter })
  // })

  const filteredKeys = mockKeys.filter(key => {
    const matchesSearch = !search || 
      key.platform.toLowerCase().includes(search.toLowerCase()) ||
      key.name?.toLowerCase().includes(search.toLowerCase()) ||
      key.apiKey.toLowerCase().includes(search.toLowerCase())
    
    const matchesPlatform = platformFilter === 'all' || key.platform === platformFilter
    const matchesStatus = statusFilter === 'all' || key.status === statusFilter
    
    return matchesSearch && matchesPlatform && matchesStatus
  })

  const platforms = [...new Set(mockKeys.map(k => k.platform))]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Key Management</h1>
          <p className="text-muted-foreground">
            Manage your API keys for different platforms
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Key
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search keys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {platforms.map(platform => (
              <SelectItem key={platform} value={platform}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="exhausted">Exhausted</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Keys Table */}
      <div className="rounded-md border bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-white/20 dark:border-gray-700/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Models</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quota</TableHead>
              <TableHead>Last Checked</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKeys.map((key) => (
              <TableRow key={key.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {key.platform.charAt(0).toUpperCase()}
                    </div>
                    {key.platform}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{key.name || 'Unnamed Key'}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {key.apiKey.substring(0, 20)}...
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {key.models.slice(0, 2).map(model => (
                      <Badge key={model} variant="outline" className="text-xs">
                        {model}
                      </Badge>
                    ))}
                    {key.models.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{key.models.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <KeyStatusCell keyInfo={key} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (key.usedQuota / key.quota) > 0.8 ? 'bg-red-500' : 
                          (key.usedQuota / key.quota) > 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(key.usedQuota / key.quota) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {key.usedQuota}/{key.quota}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {key.lastChecked ? new Date(key.lastChecked).toLocaleDateString() : '-'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Health Check
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredKeys.length} of {mockKeys.length} keys
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
