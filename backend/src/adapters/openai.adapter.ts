import { BaseAdapter, AdapterConfig, ChatMessage, ChatOptions, ChatResponse, ChatStreamChunk, HealthStatus } from './base.adapter';
import axios, { AxiosInstance } from 'axios';

export class OpenAIAdapter extends BaseAdapter {
  readonly platform = 'openai';
  readonly modelMap = {
    'gpt-4': 'gpt-4',
    'gpt-4-turbo': 'gpt-4-turbo-preview',
    'gpt-3.5-turbo': 'gpt-3.5-turbo',
    'gpt-4o': 'gpt-4o',
    'gpt-4o-mini': 'gpt-4o-mini'
  };

  private client!: AxiosInstance;

  async init(config: AdapterConfig): Promise<void> {
    await super.init(config);
    
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.openai.com/v1',
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
        stream: false,
        functions: options.functions,
        function_call: options.functionCall
      });

      return this.toOpenAIFormat(response.data);
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
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
        stream: true,
        functions: options.functions,
        function_call: options.functionCall
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
                    content: choice.delta?.content,
                    functionCall: choice.delta?.function_call
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
      throw new Error(`OpenAI API stream error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async healthCheck(apiKey: string): Promise<HealthStatus> {
    try {
      const startTime = Date.now();
      const response = await axios.get('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        timeout: 5000
      });
      const latency = Date.now() - startTime;

      return {
        healthy: true,
        latency,
        remainingQuota: undefined // OpenAI doesn't provide quota in headers
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
