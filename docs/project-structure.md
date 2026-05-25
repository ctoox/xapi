# XAPI - AI API 中转站 项目结构

```
xapi/
├── backend/                          # 后端服务 (Node.js + TypeScript)
│   ├── src/
│   │   ├── adapters/                 # 平台适配器插件
│   │   │   ├── base.adapter.ts       # 基础适配器接口
│   │   │   ├── openai.adapter.ts     # OpenAI 适配器
│   │   │   ├── anthropic.adapter.ts  # Anthropic 适配器
│   │   │   ├── gemini.adapter.ts     # Google Gemini 适配器
│   │   │   ├── moonshot.adapter.ts   # 月之暗面适配器
│   │   │   ├── zhipu.adapter.ts      # 智谱适配器
│   │   │   └── custom.adapter.ts     # 自定义渠道适配器
│   │   ├── core/
│   │   │   ├── router.ts             # 智能路由核心
│   │   │   ├── key-manager.ts        # Key 管理器
│   │   │   ├── proxy-manager.ts      # 代理 IP 管理器
│   │   │   └── health-checker.ts     # 健康检查器
│   │   ├── services/
│   │   │   ├── chat.service.ts       # 聊天服务
│   │   │   ├── metrics.service.ts    # 指标服务
│   │   │   └── log.service.ts        # 日志服务
│   │   ├── models/
│   │   │   ├── key.model.ts          # Key 数据模型
│   │   │   ├── proxy.model.ts        # 代理 IP 模型
│   │   │   └── log.model.ts          # 日志模型
│   │   ├── routes/
│   │   │   ├── chat.routes.ts        # 聊天 API 路由
│   │   │   ├── admin.routes.ts       # 管理 API 路由
│   │   │   └── metrics.routes.ts     # 指标 API 路由
│   │   ├── utils/
│   │   │   ├── config.ts             # 配置管理
│   │   │   ├── logger.ts             # 日志工具
│   │   │   └── validator.ts          # 数据验证
│   │   ├── app.ts                    # 应用入口
│   │   └── server.ts                 # HTTP 服务器
│   ├── prisma/                       # ORM 配置
│   │   ├── schema.prisma             # 数据库模型
│   │   └── migrations/               # 数据库迁移
│   ├── tests/                        # 测试目录
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/                         # 前端服务 (Next.js 14+)
│   ├── src/
│   │   ├── app/                      # App Router
│   │   │   ├── (dashboard)/          # 仪表盘布局
│   │   │   │   ├── page.tsx          # 仪表盘首页
│   │   │   │   └── layout.tsx
│   │   │   ├── (keys)/               # Key 管理
│   │   │   │   ├── page.tsx          # Key 列表页
│   │   │   │   └── [id]/page.tsx     # Key 详情页
│   │   │   ├── (proxies)/            # 代理管理
│   │   │   │   └── page.tsx
│   │   │   ├── (adapters)/           # 适配器管理
│   │   │   │   └── page.tsx
│   │   │   ├── (logs)/               # 日志查询
│   │   │   │   └── page.tsx
│   │   │   ├── (settings)/           # 系统设置
│   │   │   │   └── page.tsx
│   │   │   └── api/                  # API 路由
│   │   │       └── chat/route.ts     # 聊天 API 代理
│   │   ├── components/               # 组件库
│   │   │   ├── ui/                   # 基础 UI 组件 (shadcn/ui)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   └── ...
│   │   │   ├── shared/               # 共享组件
│   │   │   │   ├── KeyStatusBadge.tsx
│   │   │   │   ├── StatCard.tsx
│   │   │   │   └── DataTable.tsx
│   │   │   └── features/             # 功能组件
│   │   │       ├── dashboard/
│   │   │       ├── keys/
│   │   │       └── proxies/
│   │   ├── lib/                      # 工具库
│   │   │   ├── api.ts                # API 客户端
│   │   │   ├── constants.ts          # 常量定义
│   │   │   └── utils.ts              # 工具函数
│   │   ├── types/                    # TypeScript 类型
│   │   │   ├── api.ts                # API 类型
│   │   │   ├── database.ts           # 数据库类型
│   │   │   └── index.ts
│   │   └── providers/                # Context Providers
│   │       ├── query-provider.tsx    # React Query Provider
│   │       └── theme-provider.tsx    # 主题 Provider
│   ├── public/                       # 静态资源
│   ├── stories/                      # Storybook 文档
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── Dockerfile
│
├── docs/                             # 文档
│   ├── project-structure.md          # 项目结构说明
│   ├── api-spec.md                   # API 规范
│   ├── deployment.md                 # 部署文档
│   └── architecture.md               # 架构设计
│
├── scripts/                          # 脚本
│   ├── migrate.sh                    # 数据库迁移脚本
│   ├── seed.sh                       # 种子数据脚本
│   └── health-check.sh               # 健康检查脚本
│
├── docker-compose.yml                # Docker 编排
├── .env.example                      # 环境变量示例
├── .gitignore
└── README.md
```
