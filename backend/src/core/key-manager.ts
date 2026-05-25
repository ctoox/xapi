import { Redis } from 'ioredis';
import { PrismaClient, Key as PrismaKey } from '@prisma/client';

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

export interface KeyFilters {
  platform?: string;
  status?: string;
  model?: string;
}

export interface KeyStats {
  total: number;
  active: number;
  inactive: number;
  exhausted: number;
  byPlatform: Record<string, number>;
}

export class KeyManager {
  private prisma: PrismaClient;
  private redis: Redis;
  private cachePrefix = 'key:';

  constructor(prisma: PrismaClient, redis: Redis) {
    this.prisma = prisma;
    this.redis = redis;
  }

  // Add a new key
  async addKey(keyInfo: Omit<KeyInfo, 'id' | 'createdAt' | 'updatedAt'>): Promise<KeyInfo> {
    const key = await this.prisma.key.create({
      data: {
        platform: keyInfo.platform,
        apiKey: keyInfo.apiKey,
        name: keyInfo.name,
        models: keyInfo.models,
        quota: keyInfo.quota,
        usedQuota: keyInfo.usedQuota,
        status: keyInfo.status,
        failureCount: keyInfo.failureCount
      }
    });

    // Cache the key
    await this.cacheKey(key);
    
    return this.toKeyInfo(key);
  }

  // Update key information
  async updateKey(id: string, updates: Partial<KeyInfo>): Promise<KeyInfo> {
    const key = await this.prisma.key.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });

    // Update cache
    await this.cacheKey(key);
    
    return this.toKeyInfo(key);
  }

  // Delete a key
  async deleteKey(id: string): Promise<void> {
    await this.prisma.key.delete({ where: { id } });
    await this.redis.del(`${this.cachePrefix}${id}`);
  }

  // Get all keys with filters
  async getKeys(filters?: KeyFilters): Promise<KeyInfo[]> {
    let where: any = {};
    
    if (filters?.platform) where.platform = filters.platform;
    if (filters?.status) where.status = filters.status;
    if (filters?.model) {
      // Note: This is a simplified filter. For production, you'd need to handle array filtering
      where.models = { contains: filters.model };
    }

    const keys = await this.prisma.key.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return keys.map(key => this.toKeyInfo(key));
  }

  // Get healthy keys for a specific model
  async getHealthyKeys(model: string, platform?: string): Promise<KeyPoolItem[]> {
    const keys = await this.getKeys({
      platform,
      status: 'active'
    });

    // Filter keys that support the requested model
    const healthyKeys = keys.filter(key => 
      key.models.includes(model) && 
      key.status === 'active' &&
      key.failureCount < 5 // Max failures before cooldown
    );

    return healthyKeys.map(key => ({
      id: key.id,
      platform: key.platform,
      apiKey: key.apiKey,
      model,
      status: key.failureCount > 0 ? 'cooldown' : 'healthy',
      remainingQuota: key.quota - key.usedQuota,
      failureCount: key.failureCount,
      lastUsed: new Date(),
      weight: 1 // Default weight
    }));
  }

  // Check all keys health
  async checkAllKeys(): Promise<HealthCheckResult[]> {
    const keys = await this.getKeys({ status: 'active' });
    const results: HealthCheckResult[] = [];

    for (const key of keys) {
      try {
        // This would call the adapter's healthCheck method
        // For now, we'll simulate a check
        const isHealthy = Math.random() > 0.1; // 90% success rate simulation
        
        results.push({
          keyId: key.id,
          timestamp: new Date(),
          success: isHealthy,
          latency: isHealthy ? Math.floor(Math.random() * 500) + 100 : undefined,
          error: isHealthy ? undefined : 'Simulated failure'
        });

        // Update key status based on check
        if (!isHealthy) {
          await this.markKeyFailure(key.id);
        } else {
          await this.resetKeyFailure(key.id);
        }
      } catch (error: any) {
        results.push({
          keyId: key.id,
          timestamp: new Date(),
          success: false,
          error: error.message
        });
        await this.markKeyFailure(key.id);
      }
    }

    return results;
  }

  // Mark key as successful
  async markKeySuccess(keyId: string): Promise<void> {
    const key = await this.prisma.key.findUnique({ where: { id: keyId } });
    if (key) {
      await this.prisma.key.update({
        where: { id: keyId },
        data: {
          failureCount: 0,
          lastChecked: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Update cache
      await this.redis.del(`${this.cachePrefix}${keyId}`);
    }
  }

  // Mark key as failed
  async markKeyFailure(keyId: string): Promise<void> {
    const key = await this.prisma.key.findUnique({ where: { id: keyId } });
    if (key) {
      await this.prisma.key.update({
        where: { id: keyId },
        data: {
          failureCount: { increment: 1 },
          lastChecked: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Update cache
      await this.redis.del(`${this.cachePrefix}${keyId}`);
    }
  }

  // Reset key failure count
  async resetKeyFailure(keyId: string): Promise<void> {
    await this.prisma.key.update({
      where: { id: keyId },
      data: {
        failureCount: 0,
        updatedAt: new Date()
      }
    });
    
    await this.redis.del(`${this.cachePrefix}${keyId}`);
  }

  // Get key statistics
  async getKeyStats(): Promise<KeyStats> {
    const keys = await this.getKeys();
    
    const stats: KeyStats = {
      total: keys.length,
      active: keys.filter(k => k.status === 'active').length,
      inactive: keys.filter(k => k.status === 'inactive').length,
      exhausted: keys.filter(k => k.status === 'exhausted').length,
      byPlatform: {}
    };

    keys.forEach(key => {
      stats.byPlatform[key.platform] = (stats.byPlatform[key.platform] || 0) + 1;
    });

    return stats;
  }

  // Private helper methods
  private async cacheKey(key: PrismaKey): Promise<void> {
    const keyInfo = this.toKeyInfo(key);
    await this.redis.setex(
      `${this.cachePrefix}${key.id}`,
      3600, // 1 hour TTL
      JSON.stringify(keyInfo)
    );
  }

  private toKeyInfo(key: PrismaKey): KeyInfo {
    return {
      id: key.id,
      platform: key.platform,
      apiKey: key.apiKey,
      name: key.name || undefined,
      models: key.models as string[],
      quota: key.quota,
      usedQuota: key.usedQuota,
      status: key.status as any,
      failureCount: key.failureCount,
      lastChecked: key.lastChecked || undefined,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt
    };
  }
}

export interface HealthCheckResult {
  keyId: string;
  timestamp: Date;
  success: boolean;
  latency?: number;
  error?: string;
  quotaRemaining?: number;
}

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
