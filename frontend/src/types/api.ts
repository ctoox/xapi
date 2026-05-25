// API Types - Shared with backend

// Chat API types
export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
  functions?: any[];
  functionCall?: string | { name: string };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finishReason: string;
  }[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ChatStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
      functionCall?: any;
    };
    finishReason?: string;
  }[];
}

// Key management types
export interface KeyInfo {
  id: string;
  platform: string;
  apiKey: string;
  name?: string;
  models: string[];
  quota: number;
  usedQuota: number;
  status: 'active' | 'inactive' | 'exhausted';
  failureCount: number;
  lastChecked?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface KeyStats {
  total: number;
  active: number;
  inactive: number;
  exhausted: number;
  byPlatform: Record<string, number>;
}

// Proxy types
export interface ProxyIP {
  id: string;
  ip: string;
  port: number;
  protocol: 'http' | 'https' | 'socks5';
  country?: string;
  city?: string;
  isp?: string;
  latency?: number;
  lastChecked?: Date;
  status: 'available' | 'unavailable' | 'checking';
  source: string;
}

export interface ProxyStats {
  totalIPs: number;
  availableIPs: number;
  byProvider: Record<string, number>;
  averageLatency: number;
}

// Request log types
export interface RequestLog {
  id: string;
  requestId: string;
  userId?: string;
  model: string;
  platform: string;
  keyId: string;
  inputTokens: number;
  outputTokens: number;
  latency: number;
  success: boolean;
  error?: string;
  request?: any;
  response?: any;
  createdAt: Date;
}

// Metrics types
export interface MetricsData {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  keyDistribution: Record<string, number>;
  timestamp: Date;
}

// System config types
export interface SystemConfig {
  healthCheckInterval: number;
  proxyProviders: ProxyProvider[];
  alertSettings: AlertSettings;
}

export interface ProxyProvider {
  name: string;
  type: 'api' | 'file';
  config: any;
  refreshInterval: number;
}

export interface AlertSettings {
  email?: string;
  slackWebhook?: string;
  webhook?: string;
  thresholds: {
    failureRate: number;
    latency: number;
    quota: number;
  };
}

// API Token types
export interface ApiToken {
  id: string;
  name: string;
  token: string;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}
