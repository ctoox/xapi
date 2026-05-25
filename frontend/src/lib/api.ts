import axios, { AxiosInstance, AxiosError } from 'axios'
import { ChatRequest, ChatResponse, KeyInfo, ProxyIP, RequestLog, MetricsData } from '@/types/api'

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('api_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('api_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const api = {
  // Chat API
  chat: {
    completions: (data: ChatRequest) =>
      apiClient.post<ChatResponse>('/v1/chat/completions', data),
    
    stream: async function* (data: ChatRequest) {
      const response = await apiClient.post('/v1/chat/completions', {
        ...data,
        stream: true
      }, {
        responseType: 'stream'
      })

      const reader = response.data.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            
            try {
              yield JSON.parse(data)
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    }
  },

  // Key management
  keys: {
    getAll: (filters?: { search?: string; platform?: string; status?: string }) =>
      apiClient.get<KeyInfo[]>('/api/admin/keys', { params: filters }),
    
    getById: (id: string) =>
      apiClient.get<KeyInfo>(`/api/admin/keys/${id}`),
    
    create: (data: Partial<KeyInfo>) =>
      apiClient.post<KeyInfo>('/api/admin/keys', data),
    
    update: (id: string, data: Partial<KeyInfo>) =>
      apiClient.put<KeyInfo>(`/api/admin/keys/${id}`, data),
    
    delete: (id: string) =>
      apiClient.delete(`/api/admin/keys/${id}`),
    
    healthCheck: (id: string) =>
      apiClient.post(`/api/admin/keys/${id}/check`)
  },

  // Proxy management
  proxies: {
    getAll: () =>
      apiClient.get<ProxyIP[]>('/api/admin/proxies'),
    
    getStats: () =>
      apiClient.get('/api/admin/proxies/stats'),
    
    testLatency: (id: string) =>
      apiClient.post(`/api/admin/proxies/${id}/test`),
    
    fetchIPs: (provider: string) =>
      apiClient.post(`/api/admin/proxies/fetch`, { provider })
  },

  // Logs
  logs: {
    getAll: (params?: {
      startTime?: string
      endTime?: string
      platform?: string
      model?: string
      success?: boolean
      search?: string
      page?: number
      limit?: number
    }) =>
      apiClient.get<RequestLog[]>('/api/admin/logs', { params }),
    
    getById: (id: string) =>
      apiClient.get<RequestLog>(`/api/admin/logs/${id}`)
  },

  // Metrics
  metrics: {
    get: () =>
      apiClient.get<MetricsData>('/api/metrics'),
    
    getHistory: (period: '1h' | '24h' | '7d' | '30d') =>
      apiClient.get(`/api/metrics/history?period=${period}`)
  },

  // System settings
  settings: {
    get: () =>
      apiClient.get('/api/admin/settings'),
    
    update: (data: any) =>
      apiClient.put('/api/admin/settings', data)
  },

  // API Tokens
  tokens: {
    getAll: () =>
      apiClient.get('/api/admin/tokens'),
    
    create: (name: string) =>
      apiClient.post('/api/admin/tokens', { name }),
    
    delete: (id: string) =>
      apiClient.delete(`/api/admin/tokens/${id}`)
  }
}

// Helper function for streaming responses
export async function* streamChat(request: ChatRequest) {
  const response = await fetch('/api/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('api_token') && {
        Authorization: `Bearer ${localStorage.getItem('api_token')}`
      })
    },
    body: JSON.stringify({ ...request, stream: true })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') continue

        try {
          yield JSON.parse(data)
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}

export default apiClient
