# 前端页面设计与组件接口

## 1. 页面布局结构

### 主布局 (Layout)
```typescript
interface MainLayoutProps {
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
}

// 布局特点：
// - 左侧固定导航栏 (可折叠)
// - 顶部状态栏 (显示用户信息、主题切换)
// - 主内容区域 (自适应宽度)
// - 右侧可选面板 (实时监控信息)
```

## 2. 页面详细设计

### 2.1 仪表盘首页 (Dashboard)

**布局结构：**
```
┌─────────────────────────────────────────────────┐
│  全局概览卡片 (4个)                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │总请求数  │ │成功率    │ │活跃Key数 │ │代理IP数 │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
├─────────────────────────────────────────────────┤
│  实时请求吞吐量折线图 (占满宽度)                 │
│  ┌───────────────────────────────────────────┐  │
│  │  Recharts 折线图                          │  │
│  └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│  底部区域 (左右分栏)                            │
│  ┌───────────────────┐ ┌───────────────────┐  │
│  │  最近请求日志      │ │  Key 状态分布     │  │
│  │  (表格预览)        │ │  (饼图/柱状图)    │  │
│  └───────────────────┘ └───────────────────┘  │
└─────────────────────────────────────────────────┘
```

**组件 Props：**

```typescript
// StatCard - 统计卡片
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number; // 环比变化百分比
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'default' | 'success' | 'warning' | 'danger';
}

// DashboardChart - 仪表盘图表
interface DashboardChartProps {
  data: ChartDataPoint[];
  timeRange: '1h' | '24h' | '7d' | '30d';
  metrics: ('requests' | 'latency' | 'successRate')[];
}

interface ChartDataPoint {
  timestamp: Date;
  requests: number;
  latency: number;
  successRate: number;
}

// RecentLogsTable - 最近日志表格
interface RecentLogsTableProps {
  logs: RequestLog[];
  maxRows?: number;
  onRowClick?: (log: RequestLog) => void;
}
```

### 2.2 Key 管理页 (Keys)

**布局结构：**
```
┌─────────────────────────────────────────────────┐
│  工具栏                                          │
│  [搜索] [平台筛选] [状态筛选] [批量操作] [添加]  │
├─────────────────────────────────────────────────┤
│  Key 列表表格                                    │
│  ┌───────────────────────────────────────────┐  │
│  │ 平台 │ 名称 │ 模型 │ 状态 │ 余额 │ 操作   │  │
│  ├───────────────────────────────────────────┤  │
│  │ ...  │ ...  │ ...  │ ...  │ ...  │ ...    │  │
│  └───────────────────────────────────────────┘  │
│  (支持行展开显示详情)                            │
└─────────────────────────────────────────────────┘
```

**组件 Props：**

```typescript
// KeyTable - Key 表格
interface KeyTableProps {
  keys: KeyInfo[];
  loading?: boolean;
  onEdit?: (key: KeyInfo) => void;
  onDelete?: (key: KeyInfo) => void;
  onToggle?: (key: KeyInfo) => void;
  onHealthCheck?: (key: KeyInfo) => void;
}

// KeyStatusBadge - Key 状态徽章
interface KeyStatusBadgeProps {
  status: 'active' | 'inactive' | 'exhausted' | 'checking';
  showLabel?: boolean;
}

// KeyDetailRow - Key 详情展开行
interface KeyDetailRowProps {
  key: KeyInfo;
  healthHistory: HealthCheckRecord[];
}
```

### 2.3 代理 IP 管理页 (Proxies)

**布局结构：**
```
┌─────────────────────────────────────────────────┐
│  工具栏                                          │
│  [手动拉取] [一键检测] [添加提供商]              │
├─────────────────────────────────────────────────┤
│  代理 IP 列表                                    │
│  ┌───────────────────────────────────────────┐  │
│  │ IP地址 │ 端口 │ 协议 │ 延迟 │ 来源 │ 状态 │  │
│  ├───────────────────────────────────────────┤  │
│  │ ...    │ ...  │ ...  │ ...  │ ...  │ ...  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**组件 Props：**

```typescript
// ProxyTable - 代理 IP 表格
interface ProxyTableProps {
  proxies: ProxyIP[];
  loading?: boolean;
  onTestLatency?: (proxy: ProxyIP) => void;
  onRemove?: (proxy: ProxyIP) => void;
}

// ProxyStatsCard - 代理统计卡片
interface ProxyStatsCardProps {
  total: number;
  available: number;
  averageLatency: number;
}
```

### 2.4 适配器管理页 (Adapters)

**布局结构：**
```
┌─────────────────────────────────────────────────┐
│  适配器列表                                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐ │
│  │OpenAI   │ │Anthropic│ │Gemini   │ │自定义 │ │
│  └─────────┘ └─────────┘ └─────────┘ └───────┘ │
├─────────────────────────────────────────────────┤
│  配置编辑区                                      │
│  ┌───────────────────────────────────────────┐  │
│  │  平台: [OpenAI]                           │  │
│  │  API Key: [___________________________]   │  │
│  │  Base URL: [___________________________]  │  │
│  │  [测试连接] [保存配置]                     │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**组件 Props：**

```typescript
// AdapterCard - 适配器卡片
interface AdapterCardProps {
  platform: string;
  enabled: boolean;
  config: AdapterConfig;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onTest: () => void;
}

// AdapterConfigForm - 配置表单
interface AdapterConfigFormProps {
  platform: string;
  config: AdapterConfig;
  onSubmit: (config: AdapterConfig) => void;
  onTest: (config: AdapterConfig) => Promise<boolean>;
}
```

### 2.5 请求日志页 (Logs)

**布局结构：**
```
┌─────────────────────────────────────────────────┐
│  筛选工具栏                                      │
│  [时间范围] [平台] [模型] [状态] [搜索]         │
├─────────────────────────────────────────────────┤
│  日志表格 (虚拟滚动)                             │
│  ┌───────────────────────────────────────────┐  │
│  │ 时间 │ 平台 │ 模型 │ 状态 │ 延迟 │ Tokens │  │
│  ├───────────────────────────────────────────┤  │
│  │ ...  │ ...  │ ...  │ ...  │ ...  │ ...    │  │
│  └───────────────────────────────────────────┘  │
│  (点击行显示请求/响应详情)                       │
└─────────────────────────────────────────────────┘
```

**组件 Props：**

```typescript
// LogTable - 日志表格 (虚拟滚动)
interface LogTableProps {
  logs: RequestLog[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRowClick?: (log: RequestLog) => void;
}

// LogFilter - 日志筛选器
interface LogFilterProps {
  filters: LogFilters;
  onChange: (filters: LogFilters) => void;
}

interface LogFilters {
  startTime?: Date;
  endTime?: Date;
  platform?: string;
  model?: string;
  success?: boolean;
  search?: string;
}
```

### 2.6 系统设置页 (Settings)

**布局结构：**
```
┌─────────────────────────────────────────────────┐
│  全局配置                                        │
│  ┌───────────────────────────────────────────┐  │
│  │ 探测间隔: [60] 秒                          │  │
│  │ 代理服务商: [青果网络]                      │  │
│  │ API 密钥: [___________________________]    │  │
│  └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│  用户 Token 管理                                │
│  ┌───────────────────────────────────────────┐  │
│  │ Token 列表 (创建/删除)                     │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**组件 Props：**

```typescript
// SettingsForm - 设置表单
interface SettingsFormProps {
  config: SystemConfig;
  onSave: (config: SystemConfig) => Promise<void>;
}

// TokenManager - Token 管理
interface TokenManagerProps {
  tokens: ApiToken[];
  onCreate: (name: string) => Promise<string>;
  onDelete: (tokenId: string) => Promise<void>;
}

interface ApiToken {
  id: string;
  name: string;
  token: string;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}
```

## 3. 共享组件库

### 3.1 原子组件 (基于 shadcn/ui)

```typescript
// Button 扩展
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

// Card 扩展
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered';
}

// Badge 扩展
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}
```

### 3.2 复合组件

```typescript
// DataTable - 通用数据表格
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
}

// EmptyState - 空状态
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// LoadingSpinner - 加载指示器
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}
```

## 4. 主题与样式

### 4.1 主题配置
```typescript
// 主题接口
interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  borderRadius: number;
  fontFamily: string;
}

// 毛玻璃效果类
const glassClasses = `
  backdrop-blur-md
  bg-white/70
  dark:bg-gray-900/70
  border
  border-white/20
  dark:border-gray-700/50
`;
```

## 5. 状态管理

### 5.1 React Query 配置
```typescript
// query-keys.ts
export const queryKeys = {
  keys: ['keys'] as const,
  key: (id: string) => ['keys', id] as const,
  proxies: ['proxies'] as const,
  logs: ['logs'] as const,
  metrics: ['metrics'] as const,
  settings: ['settings'] as const,
};

// api.ts - API 客户端
export const api = {
  keys: {
    getAll: () => request.get('/api/admin/keys'),
    getById: (id: string) => request.get(`/api/admin/keys/${id}`),
    create: (data: any) => request.post('/api/admin/keys', data),
    update: (id: string, data: any) => request.put(`/api/admin/keys/${id}`, data),
    delete: (id: string) => request.delete(`/api/admin/keys/${id}`),
    healthCheck: (id: string) => request.post(`/api/admin/keys/${id}/check`),
  },
  // ... 其他 API
};
```
