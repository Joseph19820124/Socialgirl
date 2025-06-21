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

#### 2.1 访问 Zeabur 并登录
1. 打开浏览器访问 [https://zeabur.com/](https://zeabur.com/)
2. 点击右上角 "Sign in" 按钮
3. 选择登录方式：
   - **GitHub 登录**（推荐）：直接使用 GitHub 账户登录
   - **Google 登录**：使用 Google 账户
   - **邮箱登录**：使用邮箱注册账户

#### 2.2 创建新项目
1. 登录成功后，进入 Zeabur Dashboard
2. 点击 "**Create Project**" 或 "**New Project**" 按钮
3. 输入项目名称（建议使用：`socialgirl` 或 `socialgirl-app`）
4. 选择项目区域：
   - **Hong Kong**：亚洲用户推荐
   - **US West**：美洲用户推荐
   - **Frankfurt**：欧洲用户推荐

#### 2.3 连接 GitHub 仓库
1. 在新建的项目中，点击 "**Add Service**" 按钮
2. 选择 "**Git**" 作为服务类型
3. **首次使用需要授权**：
   - 点击 "Connect to GitHub"
   - 在弹出窗口中授权 Zeabur 访问你的 GitHub 账户
   - 选择授权范围（建议选择 "All repositories" 或指定仓库）
4. **选择仓库**：
   - 在仓库列表中找到 `Socialgirl` 仓库
   - 点击仓库名称进行选择
5. **选择分支**：
   - 通常选择 `main` 或 `master` 分支
   - 这将是自动部署的触发分支

#### 2.4 确认服务配置
1. Zeabur 会自动检测到 `zbpack.json` 文件
2. 确认构建配置：
   - **Build Method**: Docker (因为有 zbpack.json 指定 Dockerfile.zeabur)
   - **Root Directory**: 保持默认（项目根目录）
   - **Dockerfile Path**: Dockerfile.zeabur (自动检测)
3. 点击 "**Deploy**" 开始首次部署

#### 2.5 监控构建过程
1. 部署开始后，可以在 "**Logs**" 标签页查看构建日志
2. 构建过程包括：
   - 拉取代码
   - 安装 Node.js 依赖
   - 构建 React 应用
   - 创建 Docker 镜像
   - 启动容器
3. 首次构建通常需要 3-8 分钟

#### 2.6 获取访问域名
1. 构建成功后，在 "**Domains**" 标签页可以看到自动分配的域名
2. 域名格式通常为：`your-service-name.zeabur.app`
3. 点击域名即可访问部署的应用
4. **可选**：绑定自定义域名
   - 点击 "Add Domain"
   - 输入你的自定义域名
   - 按照提示配置 DNS 记录

### 故障排除：连接仓库常见问题

#### 问题 1：找不到仓库
**原因**：GitHub 授权权限不足
**解决**：
1. 前往 GitHub Settings > Applications > Authorized OAuth Apps
2. 找到 Zeabur 应用，点击进入
3. 确保授权了正确的仓库访问权限

#### 问题 2：构建失败
**原因**：缺少必要的配置文件
**解决**：
1. 确保项目根目录有 `zbpack.json` 文件
2. 确保 `Dockerfile.zeabur` 文件存在且语法正确
3. 检查 `package.json` 中的脚本配置

#### 问题 3：无法访问应用（端口配置问题）
**原因**：端口配置问题是 Zeabur 部署最常见的问题
**Zeabur 端口要求**：
1. **环境变量**：Zeabur 会自动设置 `PORT` 环境变量
2. **监听地址**：必须监听 `0.0.0.0`，不能只监听 `localhost` 或 `127.0.0.1`
3. **端口动态性**：不能硬编码端口号，必须读取环境变量

**我们的解决方案**：
- ✅ 使用启动脚本 `start.sh` 动态替换端口配置
- ✅ Nginx 配置使用占位符 `PORT_PLACEHOLDER`
- ✅ 启动时自动替换为 Zeabur 提供的实际端口
- ✅ 默认端口 8080，兼容 Zeabur 标准

**验证配置**：
```bash
# 本地测试端口配置
docker build -f Dockerfile.zeabur -t test-zeabur .
docker run -p 8080:8080 -e PORT=8080 test-zeabur
```

**如果仍然无法访问**：
1. 查看 Zeabur 构建日志中的端口信息
2. 确认容器启动日志显示正确端口
3. 测试健康检查端点：`/health`

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