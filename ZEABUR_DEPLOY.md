# Zeabur 部署指南

Socialgirl 项目容器化部署到 Zeabur 平台的完整指导。

## 📋 部署前准备

### 1. 项目文件
确保项目根目录包含以下文件：
- ✅ `Dockerfile.zeabur` - Zeabur 专用 Dockerfile
- ✅ `nginx.zeabur.conf` - Nginx 配置文件
- ✅ `zbpack.json` - Zeabur 构建配置
- ✅ `.env.zeabur` - 环境变量模板

### 2. API 密钥准备
获取以下 API 密钥：
- **YouTube Data API v3**：从 [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 获取
- **RapidAPI 密钥**：从 [RapidAPI](https://rapidapi.com/) 获取，用于 Instagram 和 TikTok API

## 🚀 部署步骤

### 第一步：推送代码到 Git 仓库

```bash
# 添加文件到 Git
git add .
git commit -m "Add Zeabur deployment configuration"
git push origin main
```

### 第二步：在 Zeabur 创建项目

1. 访问 [Zeabur Dashboard](https://zeabur.com/)
2. 登录你的账户
3. 点击 "New Project" 创建新项目
4. 选择 "Deploy from GitHub" 
5. 选择你的 Socialgirl 仓库

### 第三步：配置环境变量

在 Zeabur 项目设置中添加以下环境变量：

```bash
NODE_ENV=production
VITE_YOUTUBE_API_KEY=your_actual_youtube_api_key
VITE_RAPIDAPI_KEY=your_actual_rapidapi_key
```

**重要提醒：**
- 不要在代码中硬编码 API 密钥
- 使用 Zeabur 的环境变量功能安全存储密钥

### 第四步：配置构建设置

Zeabur 会自动检测 `zbpack.json` 文件并使用 `Dockerfile.zeabur` 进行构建。

**构建配置：**
- **Build Command**: 自动检测（使用 Dockerfile）
- **Output Directory**: 自动管理
- **Install Command**: 自动检测

### 第五步：部署

1. 点击 "Deploy" 开始部署
2. 等待构建完成（通常需要 3-5 分钟）
3. 部署成功后，Zeabur 会提供一个公网访问域名

## 🔧 部署配置说明

### Dockerfile.zeabur 特点
- **多阶段构建**：优化镜像大小
- **非特权用户**：提高安全性
- **端口 8080**：Zeabur 标准端口
- **健康检查**：内置 `/health` 端点

### Nginx 配置优化
- **Gzip 压缩**：减少传输大小
- **静态资源缓存**：提高加载速度
- **React Router 支持**：SPA 路由处理
- **安全头部**：增强安全性

## 🌐 访问应用

部署成功后：
1. Zeabur 会提供一个域名（如：`your-app.zeabur.app`）
2. 点击域名即可访问应用
3. 可以在 Zeabur 控制台绑定自定义域名

## 🔍 故障排除

### 构建失败
```bash
# 本地测试 Zeabur Dockerfile
docker build -f Dockerfile.zeabur -t socialgirl-zeabur .
docker run -p 8080:8080 socialgirl-zeabur
```

### 环境变量问题
- 确保在 Zeabur 控制台正确设置了所有环境变量
- 检查 API 密钥是否有效
- 环境变量名必须以 `VITE_` 开头才能在前端使用

### 应用无法访问
- 检查 Zeabur 日志（在项目控制台查看）
- 确认容器端口为 8080
- 测试健康检查端点：`https://your-domain.zeabur.app/health`

### API 调用失败
- 检查 CORS 设置
- 确认 API 密钥权限
- 查看浏览器网络请求日志

## 📊 监控与维护

### 日志查看
在 Zeabur 控制台可以查看：
- 构建日志
- 运行时日志
- 错误日志

### 性能监控
- 使用 Zeabur 内置监控查看资源使用情况
- 监控响应时间和错误率

### 自动部署
- 推送到 main 分支会自动触发重新部署
- 可以在 Zeabur 设置中配置部署分支

## 💰 成本估算

Zeabur 定价：
- **免费计划**：适合测试和小型项目
- **专业计划**：适合生产环境
- 具体费用请查看 [Zeabur 定价页面](https://zeabur.com/pricing)

## 🔄 更新部署

更新应用：
```bash
# 修改代码后
git add .
git commit -m "Update application"
git push origin main
# Zeabur 会自动重新部署
```

## 📞 技术支持

遇到问题？
- 查看 [Zeabur 文档](https://zeabur.com/docs)
- 联系 Zeabur 技术支持
- 查看项目的 GitHub Issues