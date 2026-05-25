"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Settings,
  Server,
  Globe,
  Shield,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Edit,
  Trash2,
  TestTube,
  Save,
  RefreshCw
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

// Platform configurations
const platforms = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5 Turbo, and more',
    icon: '🤖',
    color: 'from-green-400 to-emerald-500',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4o-mini']
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3 family models',
    icon: '🧠',
    color: 'from-orange-400 to-amber-500',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Gemini Pro and Flash models',
    icon: '💎',
    color: 'from-blue-400 to-cyan-500',
    models: ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash']
  },
  {
    id: 'moonshot',
    name: 'Moonshot',
    description: 'Kimi chat models',
    icon: '🌙',
    color: 'from-purple-400 to-pink-500',
    models: ['moonshot-v1', 'moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k']
  },
  {
    id: 'zhipu',
    name: 'Zhipu AI',
    description: 'GLM series models',
    icon: '🧠',
    color: 'from-red-400 to-rose-500',
    models: ['glm-4', 'glm-4v', 'glm-3-turbo', 'glm-3']
  },
  {
    id: 'qwen',
    name: 'Qwen',
    description: 'Alibaba Cloud models',
    icon: '☁️',
    color: 'from-orange-400 to-red-500',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max']
  },
  {
    id: 'ernie',
    name: 'Ernie Bot',
    description: 'Baidu ERNIE models',
    icon: '🤖',
    color: 'from-blue-500 to-blue-700',
    models: ['ernie-bot', 'ernie-bot-turbo', 'ernie-bot-4']
  },
  {
    id: 'spark',
    name: 'Spark',
    description: 'iFlytek models',
    icon: '✨',
    color: 'from-indigo-400 to-purple-500',
    models: ['spark-v3.5', 'spark-v3.0', 'spark-v2.0']
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Command models',
    icon: '🔗',
    color: 'from-teal-400 to-green-500',
    models: ['command-r', 'command-r-plus', 'command-light']
  },
  {
    id: 'mistral',
    name: 'Mistral',
    description: 'Open-source models',
    icon: '🌊',
    color: 'from-cyan-400 to-blue-500',
    models: ['mistral-large', 'mistral-medium', 'mistral-small']
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Any OpenAI-compatible API',
    icon: '⚙️',
    color: 'from-gray-400 to-gray-600',
    models: []
  }
]

// Form schema
const formSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  apiKey: z.string().min(1, "API Key is required"),
  baseUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
  models: z.string().optional(),
  timeout: z.number().min(1000).max(60000).optional(),
})

export default function AdaptersPage() {
  const queryClient = useQueryClient()
  const [selectedPlatform, setSelectedPlatform] = React.useState('openai')
  const [isTesting, setIsTesting] = React.useState(false)
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: 'openai',
      apiKey: '',
      baseUrl: '',
      models: '',
      timeout: 30000,
    },
  })

  const selectedPlatformConfig = platforms.find(p => p.id === selectedPlatform)

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Handle form submission
    console.log(values)
  }

  const onTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Random success for demo
      const success = Math.random() > 0.3
      setTestResult({
        success,
        message: success ? 'Connection successful!' : 'Connection failed. Please check your API key.'
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: 'An error occurred while testing the connection.'
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Adapter Configuration
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure API keys for different AI platforms
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Adapter
        </Button>
      </div>

      {/* Platform Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {platforms.map((platform) => (
          <Card
            key={platform.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
              selectedPlatform === platform.id && "ring-2 ring-primary"
            )}
            onClick={() => setSelectedPlatform(platform.id)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">{platform.icon}</div>
              <div className="font-medium text-sm">{platform.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {platform.models.length > 0 ? `${platform.models.length} models` : 'Custom'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Form */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Form */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {selectedPlatformConfig?.name} Configuration
            </CardTitle>
            <CardDescription>
              Enter your API credentials for {selectedPlatformConfig?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {platforms.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.icon} {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your API key"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your API key will be encrypted and stored securely
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="baseUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://api.example.com/v1"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Custom API endpoint (leave empty for default)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="models"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Models (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="gpt-4,gpt-3.5-turbo"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of models (leave empty for auto-detection)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onTestConnection}
                    disabled={isTesting}
                  >
                    <TestTube className="mr-2 h-4 w-4" />
                    {isTesting ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
              </form>
            </Form>

            {/* Test Result */}
            {testResult && (
              <div className={cn(
                "mt-4 p-3 rounded-lg flex items-center gap-2",
                testResult.success ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
              )}>
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {testResult.message}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Info & Models */}
        <div className="space-y-4">
          {/* Platform Info Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl",
                  selectedPlatformConfig?.color
                )}>
                  {selectedPlatformConfig?.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedPlatformConfig?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPlatformConfig?.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Models Card */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Server className="h-4 w-4" />
                Available Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedPlatformConfig?.models.map(model => (
                  <Badge key={model} variant="secondary" className="text-xs">
                    {model}
                  </Badge>
                ))}
                {selectedPlatformConfig?.models.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    Enter custom models in the configuration
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Stream support</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Function calling</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Token counting</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Health checking</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Setup Card */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-6">
              <h4 className="font-medium mb-2">Quick Setup</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Get started quickly with these steps:
              </p>
              <ol className="text-sm space-y-1 text-muted-foreground">
                <li>1. Select your platform</li>
                <li>2. Enter your API key</li>
                <li>3. Test the connection</li>
                <li>4. Save the configuration</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Existing Configurations */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Existing Configurations
            </span>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { platform: 'openai', name: 'Primary OpenAI', status: 'active', models: 5 },
              { platform: 'anthropic', name: 'Claude API', status: 'active', models: 3 },
              { platform: 'moonshot', name: 'Moonshot Key', status: 'inactive', models: 4 },
            ].map((config, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    {platforms.find(p => p.id === config.platform)?.icon}
                  </div>
                  <div>
                    <p className="font-medium">{config.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {config.models} models • {config.platform}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={config.status === 'active' ? 'success' : 'secondary'}>
                    {config.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
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
  )
}
