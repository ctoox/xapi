"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts"
import { 
  Activity, 
  CheckCircle2, 
  KeyRound, 
  Globe,
  TrendingUp,
  TrendingDown,
  Clock,
  Server,
  Shield,
  Zap,
  Users,
  BarChart3,
  AlertTriangle
} from "lucide-react"

import { StatCard } from "@/components/shared/StatCard"
import { KeyStatusBadge } from "@/components/shared/KeyStatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

// Mock data for demonstration
const mockMetrics = {
  totalRequests: 15420,
  successfulRequests: 14890,
  failedRequests: 530,
  averageLatency: 245,
  keyDistribution: {
    openai: 45,
    anthropic: 25,
    gemini: 15,
    moonshot: 10,
    zhipu: 5
  },
  timestamp: new Date()
}

const mockChartData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  requests: Math.floor(Math.random() * 500) + 100,
  latency: Math.floor(Math.random() * 100) + 50,
  successRate: 95 + Math.random() * 5,
  tokens: Math.floor(Math.random() * 10000) + 1000
}))

const mockKeys = [
  {
    id: '1',
    platform: 'openai',
    apiKey: 'sk-...',
    models: ['gpt-4', 'gpt-3.5-turbo'],
    quota: 1000,
    usedQuota: 450,
    status: 'active',
    failureCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    platform: 'anthropic',
    apiKey: 'sk-...',
    models: ['claude-3-opus', 'claude-3-sonnet'],
    quota: 500,
    usedQuota: 320,
    status: 'active',
    failureCount: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

export default function DashboardPage() {
  const metrics = mockMetrics
  const successRate = ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)
  
  const pieChartData = Object.entries(metrics.keyDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring of your AI API gateway
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={metrics.totalRequests.toLocaleString()}
          change={12.5}
          trend="up"
          icon={<Activity className="h-4 w-4" />}
          color="default"
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          change={-2.3}
          trend="down"
          icon={<CheckCircle2 className="h-4 w-4" />}
          color="success"
        />
        <StatCard
          title="Active Keys"
          value={mockKeys.filter(k => k.status === 'active').length}
          change={5}
          trend="up"
          icon={<KeyRound className="h-4 w-4" />}
          color="warning"
        />
        <StatCard
          title="Available IPs"
          value="1,234"
          change={8.2}
          trend="up"
          icon={<Globe className="h-4 w-4" />}
          color="default"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Request Volume Chart */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Request Volume (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="hour" 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRequests)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Key Distribution Chart */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Key Distribution by Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Requests */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { model: 'gpt-4', platform: 'openai', latency: 234, success: true, time: '2s ago' },
                { model: 'claude-3-opus', platform: 'anthropic', latency: 456, success: true, time: '5s ago' },
                { model: 'gemini-pro', platform: 'google', latency: 189, success: false, time: '8s ago' },
                { model: 'moonshot-v1', platform: 'moonshot', latency: 312, success: true, time: '12s ago' },
              ].map((request, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${request.success ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="font-medium text-sm">{request.model}</p>
                      <p className="text-xs text-muted-foreground">{request.platform} • {request.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{request.latency}ms</p>
                    <p className="text-xs text-muted-foreground">
                      {request.success ? 'Success' : 'Failed'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Status Overview */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Key Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <KeyRound className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{key.platform}</p>
                      <p className="text-xs text-muted-foreground">
                        {key.models.slice(0, 2).join(', ')}
                        {key.models.length > 2 && '...'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm">
                        {key.usedQuota}/{key.quota}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {((key.usedQuota / key.quota) * 100).toFixed(0)}% used
                      </p>
                    </div>
                    <KeyStatusBadge status={key.status} showLabel={false} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-4 w-4" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <Server className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-green-600">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <Zap className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Redis</p>
                <p className="text-xs text-green-600">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <Activity className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">CPU Usage</p>
                <p className="text-xs text-yellow-600">45%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <Users className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Memory</p>
                <p className="text-xs text-yellow-600">62%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
