# XAPI 平台支持列表

## 国外平台

### ✅ 已实现
1. **OpenAI**
   - 模型：GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, GPT-4o, GPT-4o Mini
   - 格式：OpenAI 原生格式
   - 流式支持：✅
   - 健康检查：✅

2. **Anthropic**
   - 模型：Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku, Claude 2.1, Claude 2.0
   - 格式：Anthropic 原生格式
   - 流式支持：✅
   - 健康检查：✅

3. **Google Gemini**
   - 模型：Gemini Pro, Gemini 1.5 Pro, Gemini 1.5 Flash
   - 格式：Google AI 原生格式
   - 流式支持：✅
   - 健康检查：✅

4. **Cohere** (待实现)
   - 模型：Command R, Command R Plus, Command Light
   - 格式：Cohere 原生格式

5. **Mistral** (待实现)
   - 模型：Mistral Large, Mistral Medium, Mistral Small
   - 格式：Mistral 原生格式

### ⏳ 计划中
- **Meta Llama** (通过 Together AI)
- **Stability AI** (Stable Diffusion)
- **DALL-E** (图像生成)

## 国内平台

### ✅ 已实现
1. **Moonshot (月之暗面)**
   - 模型：Moonshot V1, Moonshot V1-8K, Moonshot V1-32K, Moonshot V1-128K
   - 格式：OpenAI 兼容格式
   - 流式支持：✅
   - 健康检查：✅

2. **Zhipu AI (智谱)**
   - 模型：GLM-4, GLM-4V, GLM-3 Turbo, GLM-3
   - 格式：OpenAI 兼容格式
   - 流式支持：✅
   - 健康检查：✅

3. **Qwen (通义千问)**
   - 模型：Qwen Turbo, Qwen Plus, Qwen Max
   - 格式：阿里云原生格式
   - 流式支持：✅
   - 健康检查：✅

4. **Ernie Bot (文心一言)**
   - 模型：Ernie Bot, Ernie Bot Turbo, Ernie Bot 4
   - 格式：百度原生格式
   - 流式支持：✅
   - 健康检查：✅

5. **Spark (讯飞星火)**
   - 模型：Spark V3.5, Spark V3.0, Spark V2.0
   - 格式：OpenAI 兼容格式
   - 流式支持：✅
   - 健康检查：✅

### ⏳ 计划中
- **腾讯混元**
- **华为盘古**
- **京东言犀**
- **字节豆包**

## 通用适配器

### ✅ 已实现
1. **Custom Adapter**
   - 支持任何 OpenAI 兼容的 API
   - 可自定义端点和认证方式
   - 完全可配置

## 平台对比表

| 平台 | 国家 | 格式 | 流式 | 健康检查 | 代理支持 |
|------|------|------|------|----------|----------|
| OpenAI | 美国 | OpenAI | ✅ | ✅ | ✅ |
| Anthropic | 美国 | Anthropic | ✅ | ✅ | ✅ |
| Google Gemini | 美国 | Google | ✅ | ✅ | ✅ |
| Moonshot | 中国 | OpenAI | ✅ | ✅ | ✅ |
| Zhipu | 中国 | OpenAI | ✅ | ✅ | ✅ |
| Qwen | 中国 | 阿里云 | ✅ | ✅ | ✅ |
| Ernie Bot | 中国 | 百度 | ✅ | ✅ | ✅ |
| Spark | 中国 | OpenAI | ✅ | ✅ | ✅ |

## 配置示例

### OpenAI 配置
```typescript
{
  platform: 'openai',
  apiKey: 'sk-...',
  baseUrl: 'https://api.openai.com/v1',
  models: ['gpt-4', 'gpt-3.5-turbo']
}
```

### Anthropic 配置
```typescript
{
  platform: 'anthropic',
  apiKey: 'sk-ant-...',
  baseUrl: 'https://api.anthropic.com/v1',
  models: ['claude-3-opus', 'claude-3-sonnet']
}
```

### Moonshot 配置（需要代理）
```typescript
{
  platform: 'moonshot',
  apiKey: 'sk-...',
  baseUrl: 'https://api.moonshot.cn/v1',
  proxy: {
    host: 'proxy.example.com',
    port: 8080,
    protocol: 'http'
  },
  models: ['moonshot-v1', 'moonshot-v1-128k']
}
```

## 代理配置

国内平台通常需要代理访问，配置示例：

```typescript
// 在系统设置中配置代理提供商
{
  proxyProvider: {
    name: 'provider-a',
    type: 'api',
    config: {
      apiUrl: 'https://api.provider.com',
      apiKey: 'your-api-key'
    },
    refreshInterval: 300 // 5分钟刷新一次
  }
}
```

## 扩展新平台

要添加新平台，只需：

1. 创建适配器文件：`src/adapters/{platform}.adapter.ts`
2. 实现 `IPlatformAdapter` 接口
3. 在平台配置中注册
4. 前端自动显示在适配器管理页面

所有平台都会自动转换为统一的 OpenAI 格式输出。
