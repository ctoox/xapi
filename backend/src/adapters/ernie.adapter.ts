import { BaseAdapter, AdapterConfig, ChatMessage, ChatOptions, ChatResponse, ChatStreamChunk, HealthStatus } from './base.adapter';
import axios, { AxiosInstance } from 'axios';

export class ErnieAdapter extends BaseAdapter {
  readonly platform = 'ernie';
  readonly modelMap = {
    'ernie-bot': 'ernie-bot',
    'ernie-bot-turbo': 'ernie-bot-turbo',
    'ernie-bot-4': 'ernie-bot-4',
    'ernie-bot-8k': 'ernie-bot-8k'
  };

  private client!: AxiosInstance;

  async init(config: AdapterConfig): Promise<void> {
    await super.init(config);
    
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1',
      headers: {
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

  private async getAccessToken(): Promise<string> {
    const response = await axios.post(
      'https://aip.baidubce.com/oauth/2.0/token',
      null,
      {
        params: {
          grant_type: 'client_credentials',
          client_id: this.config.apiKey.split('|')[0],
          client_secret: this.config.apiKey.split('|')[1]
        }
      }
    );
    return response.data.access_token;
  }

  async chat(model: string, messages: ChatMessage[], options: ChatOptions): Promise<ChatResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await this.client.post(
        `/wenxinworkshop/chat/${this.modelMap[model] || model}?access_token=${accessToken}`,
        {
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
          stream: false
        }
      );

      return {
        id: response.data.id || `chat-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: response.data.result
          },
          finishReason: 'stop'
        }],
        usage: {
          promptTokens: response.data.usage?.prompt_tokens || 0,
          completionTokens: response.data.usage?.completion_tokens || 0,
          totalTokens: response.data.usage?.total_tokens || 0
        }
      };
    } catch (error: any) {
      throw new Error(`Ernie API error: ${error.response?.data?.error_msg || error.message}`);
    }
  }

  async *chatStream(model: string, messages: ChatMessage[], options: ChatOptions): AsyncGenerator<ChatStreamChunk, void> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await this.client.post(
        `/wenxinworkshop/chat/${this.modelMap[model] || model}?access_token=${accessToken}`,
        {
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
          stream: true
        },
        { responseType: 'stream' }
      );

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
              if (parsed.result) {
                yield {
                  id: parsed.id || `chat-${Date.now()}`,
                  object: 'chat.completion.chunk',
                  created: Math.floor(Date.now() / 1000),
                  model: model,
                  choices: [{
                    index: 0,
                    delta: {
                      content: parsed.result
                    },
                    finishReason: parsed.is_end ? 'stop' : undefined
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
      throw new Error(`Ernie API stream error: ${error.response?.data?.error_msg || error.message}`);
    }
  }

  async healthCheck(apiKey: string): Promise<HealthStatus> {
    try {
      const startTime = Date.now();
      const [clientId, clientSecret] = apiKey.split('|');
      
      const tokenResponse = await axios.post(
        'https://aip.baidubce.com/oauth/2.0/token',
        null,
        {
          params: {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
          },
          timeout: 5000
        }
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
        error: error.response?.data?.error_msg || error.message
      };
    }
  }

  async getModels(): Promise<string[]> {
    return Object.keys(this.modelMap);
  }
}
