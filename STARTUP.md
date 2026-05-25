# XAPI 启动指南

## 🚀 快速开始

### 1. 环境准备

确保已安装以下软件：
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### 2. 项目设置

```bash
# 进入项目目录
cd xapi

# 复制环境变量配置
cp .env.example .env

# 编辑环境变量（根据实际情况配置）
# 主要配置：
# - DATABASE_URL: PostgreSQL 连接字符串
# - REDIS_URL: Redis 连接字符串
# - 各平台 API Key
```

### 3. 启动服务

```bash
# 使用 Docker Compose 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 访问应用

- **前端界面**: http://localhost:3000
- **后端 API**: http://localhost:3001
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002 (admin/admin123)

## 📋 配置说明

### 数据库配置

编辑 `.env` 文件：

```env
# PostgreSQL
DATABASE_URL=postgresql://xapi:password@localhost:5432/xapi

# Redis
REDIS_URL=redis://localhost:6379
```

### API Key 配置

在 `.env` 中配置各平台 API Key：

```env
# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Anthropic
ANTHROPIC_API_KEY=sk-your-anthropic-key

# Moonshot (需要代理)
MOONSHOT_API_KEY=sk-your-moonshot-key

# Zhipu
ZHIPU_API_KEY=your-zhipu-key

# Qwen
QWEN_API_KEY=your-qwen-key

# Ernie Bot (百度)
ERNIE_API_KEY=client_id|client_secret

# Spark
SPARK_API_KEY=your-spark-key
```

### 代理配置（国内平台）

如果需要代理访问国内平台，配置代理提供商：

```env
# 代理提供商配置
PROXY_PROVIDER_TYPE=api
PROXY_PROVIDER_NAME=your-provider
PROXY_PROVIDER_URL=https://api.provider.com
PROXY_PROVIDER_API_KEY=your-api-key
```

## 🎯 功能使用

### 1. 添加 API Key

1. 访问 http://localhost:3000/adapters
2. 选择平台（如 OpenAI）
3. 输入 API Key
4. 测试连接
5. 保存配置

### 2. 发送聊天请求

```bash
# 非流式请求
curl http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-token" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'

# 流式请求
curl http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-token" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "stream": true
  }'
```

### 3. 查看监控

1. 访问 Grafana: http://localhost:3002
2. 登录 (admin/admin123)
3. 查看预置的仪表盘

## 🔧 开发指南

### 后端开发

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 数据库迁移
npx prisma migrate dev

# 生成 Prisma 客户端
npx prisma generate
```

### 前端开发

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build
```

### 添加新平台适配器

1. 在 `backend/src/adapters/` 创建新适配器文件
2. 实现 `IPlatformAdapter` 接口
3. 在 `backend/src/app.ts` 注册适配器
4. 前端会自动显示在适配器管理页面

## 📊 监控指标

### Prometheus 指标

- `xapi_requests_total` - 总请求数
- `xapi_requests_success_total` - 成功请求数
- `xapi_requests_failed_total` - 失败请求数
- `xapi_request_latency_seconds` - 请求延迟
- `xapi_key_health_status` - Key 健康状态
- `xapi_proxy_available_count` - 可用代理 IP 数

### 日志

所有日志均为 JSON 格式，包含：
- 时间戳
- 日志级别
- 请求 ID
- 平台信息
- 错误详情

## 🛠 故障排除

### 1. 数据库连接失败

```bash
# 检查 PostgreSQL 是否运行
docker ps | grep postgres

# 查看日志
docker logs xapi-postgres
```

### 2. Redis 连接失败

```bash
# 检查 Redis 是否运行
docker ps | grep redis

# 测试连接
redis-cli ping
```

### 3. 前端无法访问

```bash
# 检查前端容器
docker ps | grep frontend

# 查看日志
docker logs xapi-frontend
```

### 4. API 请求失败

```bash
# 检查后端容器
docker ps | grep backend

# 查看日志
docker logs xapi-backend
```

## 📝 常用命令

### Docker 相关

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启特定服务
docker-compose restart backend

# 查看日志
docker-compose logs -f backend

# 进入容器
docker exec -it xapi-backend bash
```

### 数据库相关

```bash
# 数据库迁移
cd backend
npx prisma migrate dev

# 查看数据库
docker exec -it xapi-postgres psql -U xapi -d xapi

# 备份数据库
docker exec xapi-postgres pg_dump -U xapi xapi > backup.sql
```

## 🔒 安全建议

1. **生产环境**：
   - 使用强密码
   - 启用 HTTPS
   - 配置防火墙
   - 定期备份

2. **API Key 管理**：
   - 不要提交到版本控制
   - 使用环境变量
   - 定期轮换

3. **访问控制**：
   - 配置 IP 白名单
   - 启用速率限制
   - 监控异常访问

## 📚 更多文档

- [平台支持列表](./docs/platforms.md)
- [架构设计](./docs/architecture.md)
- [API 规范](./docs/api-spec.md)
- [部署指南](./docs/deployment.md)

---

**XAPI** - 让 AI API 集成变得简单 🚀
