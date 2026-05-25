"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Settings,
  Bell,
  Shield,
  Database,
  Key,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Check
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

// Form schema
const formSchema = z.object({
  healthCheckInterval: z.number().min(10).max(300),
  proxyProviderUrl: z.string().url().optional(),
  proxyProviderKey: z.string().optional(),
  alertEmail: z.string().email().optional(),
  slackWebhook: z.string().url().optional(),
})

// Mock tokens
const mockTokens = [
  { id: '1', name: 'Production API', token: 'xapi-prod-abc123...', created: '2024-01-01', lastUsed: '2024-01-15', usage: 15420 },
  { id: '2', name: 'Development API', token: 'xapi-dev-xyz789...', created: '2024-01-10', lastUsed: '2024-01-14', usage: 2340 },
]

export default function SettingsPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      healthCheckInterval: 60,
      proxyProviderUrl: '',
      proxyProviderKey: '',
      alertEmail: '',
      slackWebhook: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values)
  }

  const [copiedToken, setCopiedToken] = React.useState<string | null>(null)

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedToken(text)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure system-wide settings and API tokens
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure system-wide behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="healthCheckInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Health Check Interval (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        How often to check API key health (10-300 seconds)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Proxy Settings */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Proxy Provider
            </CardTitle>
            <CardDescription>
              Configure proxy provider for IP fetching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="proxyProviderUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider API URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.provider.com/proxies" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="proxyProviderKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter provider API key" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Proxy Settings
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Alert Settings */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alert Settings
            </CardTitle>
            <CardDescription>
              Configure alert notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="alertEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="alerts@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slackWebhook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slack Webhook URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://hooks.slack.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Alert Settings
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* API Tokens */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Tokens
              </CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Token
              </Button>
            </div>
            <CardDescription>
              Manage API tokens for external access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTokens.map((token) => (
                <div key={token.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{token.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {token.token}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(token.token)}
                    >
                      {copiedToken === token.token ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
