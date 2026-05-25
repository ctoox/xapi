import { BaseAdapter, AdapterConfig, ChatMessage, ChatOptions, ChatResponse, ChatStreamChunk, HealthStatus } from './base.adapter';
import axios, { AxiosInstance } from 'axios';

export class AnthropicAdapter extends BaseAdapter {
  readonly platform = 'anthropic';
  readonly modelMap = {
    'claude-3-opus': 'claude-3-opus-20240229',
    'claude-3-sonnet': 'claude-3-sonnet-20240229',
    'claude-3-haiku': 'claude-3-haiku-20240307',
    'claude-2.1': 'claude-2.1',
    'claude-2.0': 'claude-2.0'
  };

  private client!: AxiosInstance;

  async init(config: AdapterConfig): Promise<void> {
    await super.init(config);
    
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.anthropic.com/v1',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
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
      // Convert messages to Anthropic format
      const systemMessage = messages.find(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');

      const response = await this.client.post('/messages', {
        model: this.modelMap[model] || model,
        messages: conversationMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        })),
        system: systemMessage?.content,
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature,
        top_p: options.topP,
        stream: false
      });

      return {
        id: response.data.id,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: response.data.model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: response.data.content[0].text
          },
          finishReason: response.data.stop_reason
        }],
        usage: {
          promptTokens: response.data.usage.input_tokens,
          completionTokens: response.data.usage.output_tokens,
          totalTokens: response.data.usage.input_tokens + response.data.usage.output_tokens
        }
      };
    } catch (error: any) {
      throw new Error(`Anthropic API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async *chatStream(model: string, messages: ChatMessage[], options: ChatOptions): AsyncGenerator<ChatStreamChunk, void> {
    try {
      const systemMessage = messages.find(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');

      const response = await this.client.post('/messages', {
        model: this.modelMap[model] || model,
        messages: conversationMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        })),
        system: systemMessage?.content,
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature,
        top_p: options.topP,
        stream: true
      }, {
        responseType: 'stream'
      });

      const stream = response.data;
      let buffer = '';

      for await (const chunk of stream) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta') {
                yield {
                  id: parsed.message_id || `chat-${Date.now()}`,
                  object: 'chat.completion.chunk',
                  created: Math.floor(Date.now() / 1000),
                  model: model,
                  choices: [{
                    index: 0,
                    delta: {
                      content: parsed.delta?.text
                    },
                    finishReason: parsed.delta?.stop_reason
                  }]
                };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      throw new Error(`Anthropic API stream error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async healthCheck(apiKey: string): Promise<HealthStatus> {
    try {
      const startTime = Date.now();
      const response = await axios.get('https://api.anthropic.com/v1/models', {
        headers: { 
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        timeout: 5000
      });
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
      const response = await this.client.get('/models');
      return response.data.models.map((model: any) => model.id);
    } catch (error: any) {
      throw new Error(`Failed to get models: ${error.message}`);
    }
  }
}
