# XAPI - AI API Gateway

一个统一的 AI API 中转站，支持多平台模型聚合、智能路由、动态 Key 检测和代理 IP 池管理。

## ✨ 特性

### 🎯 核心功能
- **多平台统一适配**：支持 OpenAI、Anthropic、Google Gemini、Moonshot、智谱等国内外平台
- **智能路由**：基于 Key 健康状态、剩余额度、延迟的智能选择
- **动态 Key 检测**：每分钟自动检测 Key 可用性，支持故障转移
- **代理 IP 池**：集成主流代理服务商，自动管理 IP 可用性

### 🔧 技术栈
- **后端**：Node.js + TypeScript + Express + Prisma + Redis
- **前端**：Next.js 14 + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **数据库**：PostgreSQL + Redis
- **监控**：Prometheus + Grafana

### 📊 监控与运维
- Prometheus 指标暴露
- 结构化 JSON 日志
- 管理仪表盘
- Docker 一键部署

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd xapi
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入必要的配置
```

### 3. 启动服务
```bash
docker-compose up -d
```

### 4. 访问应用
- 前端：http://localhost:3000
- 后端 API：http://localhost:3001
- Prometheus：http://localhost:9090
- Grafana：http://localhost:3002 (admin/admin123)

## 📁 项目结构

```
xapi/
├── backend/          # 后端服务
│   ├── src/
│   │   ├── adapters/ # 平台适配器
│   │   ├── core/     # 核心模块
│   │   ├── services/ # 业务服务
│   │   └── routes/   # API 路由
│   └── prisma/       # 数据库模型
├── frontend/         # 前端应用
│   ├── src/
│   │   ├── app/      # Next.js 页面
│   │   ├── components/# React 组件
│   │   └── lib/      # 工具库
├── docs/             # 文档
└── docker-compose.yml
```

## 🔧 开发指南

### 后端开发
```bash
cd backend
npm install
npm run dev
```

### 前端开发
```bash
cd frontend
npm install
npm run dev
```

### 数据库迁移
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

## 📖 API 文档

### 聊天 API (OpenAI 兼容)
```bash
POST /v1/chat/completions
Content-Type: application/json

{
  "model": "gpt-4",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "stream": false
}
```

### 管理 API
- `GET /api/admin/keys` - 获取 Key 列表
- `POST /api/admin/keys` - 添加 Key
- `GET /api/admin/proxies` - 获取代理 IP 列表
- `GET /api/metrics` - 获取监控指标

## 🐳 Docker 部署

项目包含完整的 `docker-compose.yml`，包含：
- PostgreSQL 数据库
- Redis 缓存
- 后端服务
- 前端服务
- Prometheus 监控
- Grafana 可视化
- Nginx 反向代理

## 📊 监控面板

### Prometheus 指标
- `xapi_requests_total` - 总请求数
- `xapi_requests_success_total` - 成功请求数
- `xapi_requests_failed_total` - 失败请求数
- `xapi_key_health_status` - Key 健康状态
- `xapi_proxy_available_count` - 可用代理 IP 数

### Grafana 仪表盘
项目提供预配置的 Grafana 仪表盘，包含：
- 请求量趋势图
- 成功率监控
- Key 状态分布
- 代理 IP 可用性

## 🔒 安全特性

- API Key 加密存储
- 请求速率限制
- IP 白名单支持
- JWT 认证
- 敏感信息脱敏

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Prisma](https://www.prisma.io/) - ORM 工具
- [Next.js](https://nextjs.org/) - React 框架
- [Prometheus](https://prometheus.io/) - 监控系统
