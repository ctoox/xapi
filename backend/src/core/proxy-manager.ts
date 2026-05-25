import { Redis } from 'ioredis';

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

export class ProxyManager {
  private redis: Redis;
  private cachePrefix = 'proxy:';

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async getAvailableIPs(limit: number = 100): Promise<ProxyIP[]> {
    // Get available IPs from cache
    const keys = await this.redis.keys(`${this.cachePrefix}*`);
    const ips: ProxyIP[] = [];

    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        const ip = JSON.parse(data) as ProxyIP;
        if (ip.status === 'available') {
          ips.push(ip);
        }
      }
    }

    return ips.slice(0, limit);
  }

  async fetchIPs(provider: string): Promise<ProxyIP[]> {
    // Simulate fetching IPs from provider
    const mockIPs: ProxyIP[] = [
      {
        id: Math.random().toString(36).substring(2, 15),
        ip: '192.168.1.100',
        port: 8080,
        protocol: 'http',
        country: 'US',
        city: 'New York',
        isp: 'Sample ISP',
        latency: 150,
        status: 'available',
        source: provider
      }
    ];

    // Store in cache
    for (const ip of mockIPs) {
      await this.redis.setex(
        `${this.cachePrefix}${ip.id}`,
        3600,
        JSON.stringify(ip)
      );
    }

    return mockIPs;
  }

  async markUnavailable(ipId: string, reason?: string): Promise<void> {
    const key = `${this.cachePrefix}${ipId}`;
    const data = await this.redis.get(key);
    
    if (data) {
      const ip = JSON.parse(data) as ProxyIP;
      ip.status = 'unavailable';
      ip.lastChecked = new Date();
      await this.redis.setex(key, 3600, JSON.stringify(ip));
    }
  }
}
