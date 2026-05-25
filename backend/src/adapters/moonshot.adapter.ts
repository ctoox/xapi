import { BaseAdapter, AdapterConfig, ChatMessage, ChatOptions, ChatResponse, ChatStreamChunk, HealthStatus } from './base.adapter';
import axios, { AxiosInstance } from 'axios';

export class MoonshotAdapter extends BaseAdapter {
  readonly platform = 'moonshot';
  readonly modelMap = {
    'moonshot-v1': 'moonshot-v1',
    'moonshot-v1-8k': 'moonshot-v1-8k',
    'moonshot-v1-32k': 'moonshot-v1-32k',
    'moonshot-v1-128k': 'moonshot-v1-128k'
  };

  private client!: AxiosInstance;

  async init(config: AdapterConfig): Promise<void> {
    await super.init(config);
    
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.moonshot.cn/v1',
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
      const response = await this.client.post('/chat/completions', {
        model: this.modelMap[model] || model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
        stream: false
      });

      return this.toOpenAIFormat(response.data);
    } catch (error: any) {
      throw new Error(`Moonshot API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async *chatStream(model: string, messages: ChatMessage[], options: ChatOptions): AsyncGenerator<ChatStreamChunk, void> {
    try {
      const response = await this.client.post('/chat/completions', {
        model: this.modelMap[model] || model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
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
              yield {
                id: parsed.id,
                object: parsed.object,
                created: parsed.created,
                model: parsed.model,
                choices: parsed.choices.map((choice: any) => ({
                  index: choice.index,
                  delta: {
                    role: choice.delta?.role,
                    content: choice.delta?.content
                  },
                  finishReason: choice.finish_reason
                }))
              };
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      throw new Error(`Moonshot API stream error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async healthCheck(apiKey: string): Promise<HealthStatus> {
    try {
      const startTime = Date.now();
      const response = await axios.get('https://api.moonshot.cn/v1/models', {
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
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  async getModels(): Promise<string[]> {
    try {
      const response = await this.client.get('/models');
      return response.data.data.map((model: any) => model.id);
    } catch (error: any) {
      throw new Error(`Failed to get models: ${error.message}`);
    }
  }
}
