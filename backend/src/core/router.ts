import { IPlatformAdapter, ChatMessage, ChatOptions, ChatResponse, ChatStreamChunk } from '../adapters/base.adapter';
import { KeyManager, KeyInfo } from './key-manager';
import { ProxyManager, ProxyIP } from './proxy-manager';

export interface KeyPoolItem {
  id: string;
  platform: string;
  apiKey: string;
  model: string;
  status: 'healthy' | 'unhealthy' | 'cooldown' | 'exhausted';
  remainingQuota: number;
  failureCount: number;
  lastUsed: Date;
  cooldownUntil?: Date;
  weight: number;
}

export interface RoutingResult {
  key: KeyPoolItem;
  adapter: IPlatformAdapter;
  proxy?: ProxyIP;
}

export interface RouterStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  keyDistribution: Record<string, number>;
}

export class SmartRouter {
  private keyManager: KeyManager;
  private proxyManager: ProxyManager;
  private adapters: Map<string, IPlatformAdapter> = new Map();
  
  private stats: RouterStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLatency: 0,
    keyDistribution: {}
  };

  constructor(keyManager: KeyManager, proxyManager: ProxyManager) {
    this.keyManager = keyManager;
    this.proxyManager = proxyManager;
  }

  // Register an adapter for a platform
  registerAdapter(platform: string, adapter: IPlatformAdapter): void {
    this.adapters.set(platform, adapter);
  }

  // Select the best key for a given model
  async selectKey(model: string, platform?: string): Promise<RoutingResult> {
    // Get healthy keys for the model
    const healthyKeys = await this.keyManager.getHealthyKeys(model, platform);
    
    if (healthyKeys.length === 0) {
      throw new Error(`No healthy keys available for model: ${model}`);
    }

    // Select key based on strategy (round-robin, weighted, etc.)
    const selectedKey = this.selectKeyByStrategy(healthyKeys);
    
    // Get adapter for the platform
    const adapter = this.adapters.get(selectedKey.platform);
    if (!adapter) {
      throw new Error(`No adapter registered for platform: ${selectedKey.platform}`);
    }

    // Get proxy if needed
    let proxy: ProxyIP | undefined;
    if (this.requiresProxy(selectedKey.platform)) {
      const availableProxies = await this.proxyManager.getAvailableIPs();
      if (availableProxies.length > 0) {
        proxy = availableProxies[Math.floor(Math.random() * availableProxies.length)];
      }
    }

    return {
      key: selectedKey,
      adapter,
      proxy
    };
  }

  // Execute chat request with automatic retry
  async chat(
    model: string,
    messages: ChatMessage[],
    options: ChatOptions,
    maxRetries: number = 3
  ): Promise<ChatResponse> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const routing = await this.selectKey(model);
        
        // Update adapter config with proxy if needed
        if (routing.proxy) {
          await routing.adapter.init({
            apiKey: routing.key.apiKey,
            proxy: {
              host: routing.proxy.ip,
              port: routing.proxy.port,
              protocol: routing.proxy.protocol as any
            }
          });
        }

        const startTime = Date.now();
        const response = await routing.adapter.chat(model, messages, options);
        const latency = Date.now() - startTime;

        // Mark success
        this.markSuccess(routing.key.id);
        this.updateStats(true, latency, routing.key.platform);

        return response;
      } catch (error: any) {
        lastError = error;
        
        // Mark failure
        if (attempt === maxRetries - 1) {
          this.markFailure(lastError);
          this.updateStats(false, 0, 'unknown');
          throw error;
        }
      }
    }

    throw lastError || new Error('Unknown error occurred');
  }

  // Execute streaming chat request
  async *chatStream(
    model: string,
    messages: ChatMessage[],
    options: ChatOptions,
    maxRetries: number = 3
  ): AsyncGenerator<ChatStreamChunk, void> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const routing = await this.selectKey(model);
        
        if (routing.proxy) {
          await routing.adapter.init({
            apiKey: routing.key.apiKey,
            proxy: {
              host: routing.proxy.ip,
              port: routing.proxy.port,
              protocol: routing.proxy.protocol as any
            }
          });
        }

        const startTime = Date.now();
        let hasYielded = false;

        for await (const chunk of routing.adapter.chatStream(model, messages, options)) {
          hasYielded = true;
          yield chunk;
        }

        const latency = Date.now() - startTime;
        this.markSuccess(routing.key.id);
        this.updateStats(true, latency, routing.key.platform);

        return;
      } catch (error: any) {
        lastError = error;
        
        if (attempt === maxRetries - 1) {
          this.markFailure(lastError);
          this.updateStats(false, 0, 'unknown');
          throw error;
        }
      }
    }
  }

  // Mark key as successful
  markSuccess(keyId: string): void {
    this.keyManager.markKeySuccess(keyId);
  }

  // Mark key as failed
  markFailure(error: Error): void {
    // Implementation depends on how we track which key failed
    // This would need to be called with the specific key that failed
  }

  // Get router statistics
  getStats(): RouterStats {
    return { ...this.stats };
  }

  // Private helper methods
  private selectKeyByStrategy(healthyKeys: KeyPoolItem[]): KeyPoolItem {
    // Simple round-robin for now, can be extended to weighted selection
    const totalWeight = healthyKeys.reduce((sum, key) => sum + key.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const key of healthyKeys) {
      random -= key.weight;
      if (random <= 0) {
        return key;
      }
    }
    
    return healthyKeys[0];
  }

  private requiresProxy(platform: string): boolean {
    // Check if platform requires proxy (e.g., Chinese platforms)
    const proxyRequiredPlatforms = ['moonshot', 'zhipu', 'qwen', 'ernie', 'spark'];
    return proxyRequiredPlatforms.includes(platform);
  }

  private updateStats(success: boolean, latency: number, platform: string): void {
    this.stats.totalRequests++;
    if (success) {
      this.stats.successfulRequests++;
      this.stats.averageLatency = 
        (this.stats.averageLatency * (this.stats.successfulRequests - 1) + latency) / 
        this.stats.successfulRequests;
    } else {
      this.stats.failedRequests++;
    }
    
    this.stats.keyDistribution[platform] = (this.stats.keyDistribution[platform] || 0) + 1;
  }
}
