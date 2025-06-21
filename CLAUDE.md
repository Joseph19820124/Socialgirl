# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

Socialgirl 是一个基于 React 的 Web 应用程序，用于分析 YouTube、Instagram 和 TikTok 的内容表现。用户可以搜索视频/帖子，查看参与度指标，并在统一的仪表板中监控 API 使用情况。

## 开发命令

**开发服务器：**
```bash
cd socialgirl-app
npm run dev
```
服务器运行在 http://localhost:5173

**构建和部署：**
```bash
npm run build
npm run preview
```

**代码质量检查：**
```bash
npm run lint
```

**测试：**
```bash
npm run test
npm run test:ui
npm run test:coverage
```

## 架构概述

### 核心数据流
- **usePlatformData**：管理所有平台（YouTube、Instagram、TikTok）数据的中央状态管理钩子
- **useSearch**：协调平台搜索的 API 调用和数据更新
- **API 层**：`/apis/` 中的模块化 API 函数，配有 `/mappers/` 中特定于平台的映射器
- **上下文系统**：三个主要上下文处理不同的关注点：
  - ApiKeyContext：管理内存和 sessionStorage 中的 API 密钥
  - ToastContext：全局通知系统
  - DialogContext：模态框/对话框管理

### API 密钥管理系统
应用程序具有复杂的 API 密钥管理系统：
1. **运行时密钥**：在用户会话期间存储在 ApiKeyContext（内存 + sessionStorage）中
2. **加密存储**：API 密钥可以使用用户提供的密码加密并存储在 localStorage 中
3. **环境变量回退**：回退到 Vite 环境变量（VITE_YOUTUBE_API_KEY、VITE_RAPIDAPI_KEY）

关键文件：
- `src/utils/apiKeyManager.js`：主要的 API 密钥解析逻辑
- `src/utils/encryption.js`：处理加密存储/检索
- `src/contexts/ApiKeyContext.jsx`：运行时密钥管理

### 平台配置
平台定义集中在 `src/config/platforms.js` 和 `src/config/tableColumns.js` 中。添加新平台需要更新这两个文件，并创建相应的 API、映射器和页面组件。

### 组件架构
- **页面**：平台特定页面（`/pages/YouTubePage.jsx` 等），从钩子中消费数据
- **通用组件**：`/components/` 中的可重用 UI 组件，包括表格、对话框和表单元素
- **数据映射器**：将 API 响应转换为一致的内部格式（`/mappers/`）
- **服务层**：搜索、排序等实用程序服务（`/services/`）

### 样式系统
使用 CSS 和 CSS 自定义属性进行主题化。全局样式在 `/styles/` 中，组件特定样式与组件放在一起。

## 关键开发模式

### 添加新平台
1. 在 `src/config/platforms.js` 中添加平台配置
2. 在 `src/config/tableColumns.js` 中定义表格列
3. 在 `src/apis/[platform].js` 中创建 API 函数
4. 在 `src/mappers/[platform].js` 中创建数据映射器
5. 在 `src/pages/[Platform]Page.jsx` 中创建页面组件
6. 在 `App.jsx` 中添加路由

### API 开发
- 所有 API 函数都应使用 `apiKeyManager.getApiKey()` 进行密钥解析
- 映射器应将 API 响应转换为一致的内部格式
- 优雅地处理速率限制和错误，并提供用户反馈

### 状态管理
- 使用 `usePlatformData` 管理跨平台数据状态
- 各个组件管理自己的本地 UI 状态
- 上下文提供程序处理全局关注点（API 密钥、通知、对话框）

## 环境设置
复制 `.env.example` 到 `.env` 并配置 API 密钥：
- `VITE_YOUTUBE_API_KEY`：YouTube Data API v3 密钥
- `VITE_RAPIDAPI_KEY`：Instagram/TikTok API 的 RapidAPI 密钥

## Vite 配置
应用程序使用 Vite 和代理配置来处理 Instagram API 调用的 CORS 问题。代理在 `vite.config.js` 中配置，将 `/api/instagram` 请求转发到 RapidAPI 端点。

## Docker 部署

项目支持使用 Docker 和 docker-compose 进行部署，提供生产环境和开发环境两种配置。

### 生产环境部署

**构建并启动生产服务：**
```bash
docker-compose up -d
```

**重新构建并启动：**
```bash
docker-compose up --build -d
```

**停止服务：**
```bash
docker-compose down
```

**查看日志：**
```bash
docker-compose logs -f
```

生产环境将在 http://localhost:3000 运行，使用 Nginx 作为 Web 服务器。

### 开发环境部署

**启动开发环境：**
```bash
docker-compose --profile dev up -d
```

**同时启动生产和开发环境：**
```bash
docker-compose --profile dev up -d
```

开发环境将在 http://localhost:5173 运行，支持热重载和实时代码更新。

### Docker 配置文件

- **Dockerfile**：生产环境多阶段构建，使用 Nginx 服务静态文件
- **Dockerfile.dev**：开发环境配置，挂载源代码实现热重载
- **docker-compose.yml**：定义生产和开发服务配置
- **nginx.conf**：Nginx 配置，支持 React Router 和静态资源缓存
- **.dockerignore**：优化 Docker 构建上下文

### 环境变量配置

在 Docker 环境中，API 密钥可以通过以下方式配置：
1. 将 `.env` 文件挂载到容器中（推荐用于本地开发）
2. 在 docker-compose.yml 中直接设置环境变量
3. 使用 Docker secrets 管理敏感信息（推荐用于生产环境）

## Zeabur 云部署

项目支持部署到 Zeabur 云平台，提供完整的容器化部署解决方案。

### 快速部署到 Zeabur

**准备文件：**
- `Dockerfile.zeabur`：优化的生产环境 Dockerfile
- `nginx.zeabur.conf`：适配 Zeabur 的 Nginx 配置
- `zbpack.json`：Zeabur 构建配置
- `.env.zeabur`：环境变量模板

**部署步骤：**
```bash
# 1. 推送代码到 Git 仓库
git add .
git commit -m "Add Zeabur deployment configuration"
git push origin main

# 2. 在 Zeabur 控制台创建项目并连接仓库
# 3. 配置环境变量（API 密钥）
# 4. 部署完成，获得公网域名
```

**关键配置：**
- 端口：8080（Zeabur 标准）
- 健康检查：`/health` 端点
- 非特权用户运行
- 自动 HTTPS 和 CDN 加速

详细部署指南请参考 `ZEABUR_DEPLOY.md`。