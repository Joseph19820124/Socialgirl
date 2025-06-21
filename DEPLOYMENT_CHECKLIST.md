# 🚀 Zeabur 部署检查清单

## 📋 部署前检查

### ✅ 代码准备
- [ ] 代码已推送到 GitHub
- [ ] Dockerfile 配置正确
- [ ] zbpack.json 存在
- [ ] start.sh 启动脚本可执行

### ✅ API 密钥配置

#### YouTube Data API v3
- [ ] 已在 Google Cloud Console 创建项目
- [ ] 已启用 YouTube Data API v3
- [ ] 已创建 API 密钥
- [ ] 在 Zeabur 环境变量中设置 `VITE_YOUTUBE_API_KEY`

#### RapidAPI（可选）
- [ ] 已注册 RapidAPI 账户
- [ ] 已获取 Instagram/TikTok API 密钥
- [ ] 在 Zeabur 环境变量中设置 `VITE_RAPIDAPI_KEY`

### ✅ Zeabur 配置
- [ ] 项目已在 Zeabur 创建
- [ ] 已连接 GitHub 仓库
- [ ] 已配置环境变量
- [ ] 构建成功
- [ ] 应用可访问

## 🔍 部署后验证

### 访问检查
- [ ] 主页正常加载：`https://your-app.zeabur.app/`
- [ ] 健康检查正常：`https://your-app.zeabur.app/health`
- [ ] 调试页面显示环境变量：`https://your-app.zeabur.app/debug`

### 功能测试
- [ ] YouTube 搜索功能正常
- [ ] Instagram 功能正常（如果配置了 API）
- [ ] TikTok 功能正常（如果配置了 API）
- [ ] 设置页面可以保存 API 密钥

## 🛠️ 故障排除

### 常见问题

#### 1. 应用无法访问
**检查项：**
- Zeabur 构建日志是否有错误
- 端口配置是否正确（应该是 8080）
- 健康检查端点是否返回 200

#### 2. API 功能不工作
**检查项：**
- 环境变量是否正确设置
- API 密钥是否有效
- 浏览器开发者工具中的网络请求

#### 3. 构建失败
**检查项：**
- package.json 依赖是否正确
- Dockerfile 语法是否正确
- Node.js 版本兼容性

## 📞 获取帮助

### API 密钥相关
- **YouTube API**: [Google Cloud Console](https://console.cloud.google.com/)
- **RapidAPI**: [RapidAPI Dashboard](https://rapidapi.com/developer/dashboard)

### 部署平台
- **Zeabur 文档**: [docs.zeabur.com](https://docs.zeabur.com)
- **Zeabur 支持**: 控制台中的帮助页面

### 项目相关
- **GitHub Issues**: 项目仓库的 Issues 页面
- **部署日志**: Zeabur 控制台的 Logs 页面