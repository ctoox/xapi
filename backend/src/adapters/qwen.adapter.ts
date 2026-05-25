import { BaseAdapter, AdapterConfig, ChatMessage, ChatOptions, ChatResponse, ChatStreamChunk, HealthStatus } from './base.adapter';
import axios, { AxiosInstance } from 'axios';

export class QwenAdapter extends BaseAdapter {
  readonly platform = 'qwen';
  readonly modelMap = {
    'qwen-turbo': 'qwen-turbo',
    'qwen-plus': 'qwen-plus',
    'qwen-max': 'qwen-max',
    'qwen-max-1201': 'qwen-max-1201',
    'qwen-max-longcontext': 'qwen-max-longcontext'
  };

  private client!: AxiosInstance;

  async init(config: AdapterConfig): Promise<void> {
    await super.init(config);
    
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://dashscope.aliyuncs.com/api/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
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
      const response = await this.client.post('/services/aigc/text-generation/generation', {
        model: this.modelMap[model] || model,
        input: {
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        },
        parameters: {
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
          stream: false
        }
      });

      return {
        id: response.data.request_id,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: response.data.output.text
          },
          finishReason: 'stop'
        }],
        usage: {
          promptTokens: response.data.usage.input_tokens,
          completionTokens: response.data.usage.output_tokens,
          totalTokens: response.data.usage.input_tokens + response.data.usage.output_tokens
        }
      };
    } catch (error: any) {
      throw new Error(`Qwen API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async *chatStream(model: string, messages: ChatMessage[], options: ChatOptions): AsyncGenerator<ChatStreamChunk, void> {
    try {
      const response = await this.client.post('/services/aigc/text-generation/generation', {
        model: this.modelMap[model] || model,
        input: {
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        },
        parameters: {
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
          stream: true
        }
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
              if (parsed.output && parsed.output.text) {
                yield {
                  id: parsed.request_id,
                  object: 'chat.completion.chunk',
                  created: Math.floor(Date.now() / 1000),
                  model: model,
                  choices: [{
                    index: 0,
                    delta: {
                      content: parsed.output.text
                    },
                    finishReason: parsed.output.finish_reason
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
      throw new Error(`Qwen API stream error: ${error.response?.data?.message || error.message}`);
    }
  }

  async healthCheck(apiKey: string): Promise<HealthStatus> {
    try {
      const startTime = Date.now();
      const response = await axios.get('https://dashscope.aliyuncs.com/api/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
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
        error: error.response?.data?.message || error.message
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
