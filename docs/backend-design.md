# 后端核心模块设计

## 1. 多平台统一适配层设计

### 基础适配器接口 (base.adapter.ts)

```typescript
// 平台适配器基类接口
export interface IPlatformAdapter {
  // 适配器唯一标识
  readonly platform: string;

  // 模型映射配置
  readonly modelMap: Record<string, string>;

  // 初始化适配器
  init(config: AdapterConfig): Promise<void>;

  // 统一聊天接口 (转换为 OpenAI 格式)
  chat(
    model: string,
    messages: ChatMessage[],
    options: ChatOptions
  ): Promise<ChatResponse>;

  // 流式聊天接口
  chatStream(
    model: string,
    messages: ChatMessage[],
    options: ChatOptions
  ): AsyncGenerator<ChatStreamChunk, void>;

  // 健康检查接口
  healthCheck(apiKey: string): Promise<HealthStatus>;

  // 获取模型列表
  getModels(): Promise<string[]>;
}

// 适配器配置接口
export interface AdapterConfig {
  apiKey: string;
  baseUrl?: string;
  proxy?: ProxyConfig;
  timeout?: number;
  maxRetries?: number;
}

// 统一的聊天消息格式
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 统一的聊天选项
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

// 统一的响应格式 (OpenAI 兼容)
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

// 流式响应块
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

// 健康状态
export interface HealthStatus {
  healthy: boolean;
  latency?: number;
  error?: string;
  remainingQuota?: number;
}
```

## 2. 智能路由核心 (router.ts)

```typescript
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
  weight: number; // 路由权重
}

export interface RoutingResult {
  key: KeyPoolItem;
  adapter: IPlatformAdapter;
}

export class SmartRouter {
  // 根据模型选择最优 Key
  selectKey(model: string, platform?: string): Promise<RoutingResult>;

  // 标记 Key 使用成功
  markSuccess(keyId: string): void;

  // 标记 Key 使用失败
  markFailure(keyId: string, error: Error): void;

  // 获取路由统计
  getStats(): RouterStats;
}

export interface RouterStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  keyDistribution: Record<string, number>;
}
```

## 3. Key 管理器 (key-manager.ts)

```typescript
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

export class KeyManager {
  // 添加新 Key
  addKey(keyInfo: KeyInfo): Promise<KeyInfo>;

  // 更新 Key 信息
  updateKey(id: string, updates: Partial<KeyInfo>): Promise<KeyInfo>;

  // 删除 Key
  deleteKey(id: string): Promise<void>;

  // 获取所有 Key
  getKeys(filters?: KeyFilters): Promise<KeyInfo[]>;

  // 健康检查所有 Key
  checkAllKeys(): Promise<HealthCheckResult[]>;

  // 获取 Key 状态统计
  getKeyStats(): KeyStats;
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
```

## 4. 代理 IP 管理器 (proxy-manager.ts)

```typescript
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

export interface ProxyProvider {
  name: string;
  type: 'api' | 'file';
  config: any;
  refreshInterval: number;
}

export class ProxyManager {
  // 添加代理提供商
  addProvider(provider: ProxyProvider): Promise<void>;

  // 从提供商拉取 IP
  fetchIPs(providerName: string): Promise<ProxyIP[]>;

  // 获取可用 IP
  getAvailableIPs(limit?: number): Promise<ProxyIP[]>;

  // 标记 IP 不可用
  markUnavailable(ipId: string, reason?: string): Promise<void>;

  // 测试 IP 延迟
  testLatency(ip: ProxyIP): Promise<number>;

  // 获取代理统计
  getStats(): ProxyStats;
}

export interface ProxyStats {
  totalIPs: number;
  availableIPs: number;
  byProvider: Record<string, number>;
  averageLatency: number;
}
```

## 5. 健康检查器 (health-checker.ts)

```typescript
export class HealthChecker {
  // 启动定时检查
  start(): void;

  // 停止检查
  stop(): void;

  // 立即检查指定 Key
  checkKey(keyId: string): Promise<HealthStatus>;

  // 获取检查历史
  getHistory(keyId: string, limit?: number): HealthCheckRecord[];
}

export interface HealthCheckRecord {
  keyId: string;
  timestamp: Date;
  success: boolean;
  latency?: number;
  error?: string;
  quotaRemaining?: number;
}
```

## 6. 数据库模型 (Prisma Schema)

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Key {
  id            String   @id @default(uuid())
  platform      String
  apiKey        String   @unique
  name          String?
  models        String[] // JSON array stored as string
  quota         Int
  usedQuota     Int      @default(0)
  status        String   @default("active")
  failureCount  Int      @default(0)
  lastChecked   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([platform])
  @@index([status])
}

model ProxyIP {
  id        String   @id @default(uuid())
  ip        String
  port      Int
  protocol  String
  country   String?
  city      String?
  isp       String?
  latency   Int?
  lastChecked DateTime?
  status    String   @default("available")
  source    String
  createdAt DateTime @default(now())

  @@index([status])
  @@index([source])
}

model RequestLog {
  id          String   @id @default(uuid())
  requestId   String   @unique
  userId      String?
  model       String
  platform    String
  keyId       String
  inputTokens Int
  outputTokens Int
  latency     Int
  success     Boolean
  error       String?
  request     Json?
  response    Json?
  createdAt   DateTime @default(now())

  @@index([createdAt])
  @@index([model])
  @@index([platform])
}

model SystemConfig {
  key         String   @id
  value       String
  description String?
  updatedAt   DateTime @updatedAt
}
```
