# Docker 部署指南

## 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd Socialgirl
```

### 2. 配置环境变量
```bash
cp socialgirl-app/.env.example socialgirl-app/.env
# 编辑 .env 文件，添加你的 API 密钥
```

### 3. 启动应用
```bash
# 生产环境
docker-compose up -d

# 开发环境
docker-compose --profile dev up -d
```

### 4. 访问应用
- 生产环境：http://localhost:3000
- 开发环境：http://localhost:5173

## 常用命令

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重新构建
docker-compose up --build -d

# 停止服务
docker-compose down

# 清理资源
docker-compose down -v --rmi all
```

## 部署架构

### 生产环境
- **构建阶段**：Node.js 18 Alpine 构建 React 应用
- **运行阶段**：Nginx Alpine 服务静态文件
- **端口**：3000
- **特性**：Gzip 压缩、静态资源缓存、React Router 支持

### 开发环境
- **基础镜像**：Node.js 18 Alpine
- **端口**：5173
- **特性**：热重载、代码挂载、开发工具

## 故障排除

### 端口冲突
如果 3000 或 5173 端口被占用，修改 docker-compose.yml 中的端口映射：
```yaml
ports:
  - "8080:80"  # 将 3000 改为 8080
```

### 构建失败
1. 检查 Docker 和 docker-compose 版本
2. 清理 Docker 缓存：`docker system prune -a`
3. 重新构建：`docker-compose build --no-cache`

### API 密钥问题
确保 `.env` 文件格式正确，API 密钥有效。可以在应用的设置页面中重新配置。