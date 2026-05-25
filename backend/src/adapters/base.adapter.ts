// Base adapter interface for all platform adapters
export interface IPlatformAdapter {
  // Adapter unique identifier
  readonly platform: string;

  // Model mapping configuration
  readonly modelMap: Record<string, string>;

  // Initialize adapter with configuration
  init(config: AdapterConfig): Promise<void>;

  // Unified chat interface (convert to OpenAI format)
  chat(
    model: string,
    messages: ChatMessage[],
    options: ChatOptions
  ): Promise<ChatResponse>;

  // Streaming chat interface
  chatStream(
    model: string,
    messages: ChatMessage[],
    options: ChatOptions
  ): AsyncGenerator<ChatStreamChunk, void>;

  // Health check interface
  healthCheck(apiKey: string): Promise<HealthStatus>;

  // Get available models
  getModels(): Promise<string[]>;
}

// Adapter configuration interface
export interface AdapterConfig {
  apiKey: string;
  baseUrl?: string;
  proxy?: ProxyConfig;
  timeout?: number;
  maxRetries?: number;
}

// Proxy configuration
export interface ProxyConfig {
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'socks5';
  auth?: {
    username: string;
    password: string;
  };
}

// Unified chat message format
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Unified chat options
export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
  functions?: any[];
  functionCall?: string | { name: string };
}

// Unified response format (OpenAI compatible)
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

// Streaming response chunk
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

// Health status
export interface HealthStatus {
  healthy: boolean;
  latency?: number;
  error?: string;
  remainingQuota?: number;
}

// Base adapter class
export abstract class BaseAdapter implements IPlatformAdapter {
  abstract readonly platform: string;
  abstract readonly modelMap: Record<string, string>;

  protected config!: AdapterConfig;

  async init(config: AdapterConfig): Promise<void> {
    this.config = config;
  }

  abstract chat(
    model: string,
    messages: ChatMessage[],
    options: ChatOptions
  ): Promise<ChatResponse>;

  abstract chatStream(
    model: string,
    messages: ChatMessage[],
    options: ChatOptions
  ): AsyncGenerator<ChatStreamChunk, void>;

  abstract healthCheck(apiKey: string): Promise<HealthStatus>;

  abstract getModels(): Promise<string[]>;

  // Helper method to convert to OpenAI format
  protected toOpenAIFormat(response: any): ChatResponse {
    return {
      id: response.id || `chat-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: response.model || 'unknown',
      choices: response.choices || [{
        index: 0,
        message: {
          role: 'assistant',
          content: response.content || response.message?.content || ''
        },
        finishReason: response.finish_reason || 'stop'
      }],
      usage: response.usage
    };
  }
}
