import { BaseAdapter, AdapterConfig, ChatMessage, ChatOptions, ChatResponse, ChatStreamChunk, HealthStatus } from './base.adapter';
import axios, { AxiosInstance } from 'axios';

export class GeminiAdapter extends BaseAdapter {
  readonly platform = 'google';
  readonly modelMap = {
    'gemini-pro': 'gemini-pro',
    'gemini-pro-vision': 'gemini-pro-vision',
    'gemini-1.5-pro': 'gemini-1.5-pro-latest',
    'gemini-1.5-flash': 'gemini-1.5-flash-latest'
  };

  private client!: AxiosInstance;
  private apiKey: string = '';

  async init(config: AdapterConfig): Promise<void> {
    await super.init(config);
    this.apiKey = config.apiKey;
    
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta',
      timeout: config.timeout || 30000,
      proxy: config.proxy ? {
        host: config.proxy.host,
        port: config.proxy.port,
        protocol: config.proxy.protocol
      } : undefined
    });
  }

  async chat(model: string, messages: ChatMessage[], options: ChatOptions): Promise<ChatResponse> {
    try {
      const response = await this.client.post(
        `/models/${this.modelMap[model] || model}:generateContent?key=${this.apiKey}`,
        {
          contents: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          generationConfig: {
            temperature: options.temperature,
            topP: options.topP,
            maxOutputTokens: options.maxTokens
          }
        }
      );

      const result = response.data.candidates[0];
      return {
        id: `chat-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: result.content.parts[0].text
          },
          finishReason: result.finishReason
        }],
        usage: {
          promptTokens: response.data.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.data.usageMetadata?.totalTokenCount || 0
        }
      };
    } catch (error: any) {
      throw new Error(`Gemini API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async *chatStream(model: string, messages: ChatMessage[], options: ChatOptions): AsyncGenerator<ChatStreamChunk, void> {
    try {
      const response = await this.client.post(
        `/models/${this.modelMap[model] || model}:streamGenerateContent?key=${this.apiKey}`,
        {
          contents: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          generationConfig: {
            temperature: options.temperature,
            topP: options.topP,
            maxOutputTokens: options.maxTokens
          }
        },
        { responseType: 'stream' }
      );

      const stream = response.data;
      let buffer = '';

      for await (const chunk of stream) {
        buffer += chunk.toString();
        
        // Parse streaming response
        const matches = buffer.match(/\{[^}]+\}/g);
        if (matches) {
          for (const match of matches) {
            try {
              const parsed = JSON.parse(match);
              if (parsed.candidates && parsed.candidates[0]?.content?.parts) {
                yield {
                  id: `chat-${Date.now()}`,
                  object: 'chat.completion.chunk',
                  created: Math.floor(Date.now() / 1000),
                  model: model,
                  choices: [{
                    index: 0,
                    delta: {
                      content: parsed.candidates[0].content.parts[0].text
                    },
                    finishReason: parsed.candidates[0].finishReason
                  }]
                };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
          buffer = '';
        }
      }
    } catch (error: any) {
      throw new Error(`Gemini API stream error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async healthCheck(apiKey: string): Promise<HealthStatus> {
    try {
      const startTime = Date.now();
      const response = await axios.get(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        { timeout: 5000 }
      );
      const latency = Date.now() - startTime;

      return {
        healthy: true,
        latency,
        remainingQuota: undefined
      };
    } catch (error: any) {
      return {
        healthy: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  async getModels(): Promise<string[]> {
    try {
      const response = await this.client.get(`/models?key=${this.apiKey}`);
      return response.data.models.map((model: any) => model.name.split('/').pop());
    } catch (error: any) {
      throw new Error(`Failed to get models: ${error.message}`);
    }
  }
}
