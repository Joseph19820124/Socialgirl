# 多阶段构建 - 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY socialgirl-app/package*.json ./

# 安装依赖（包括开发依赖，构建时需要）
RUN npm ci

# 复制源代码
COPY socialgirl-app/ .

# 构建应用
RUN npm run build

# 生产阶段 - 使用 nginx 服务静态文件
FROM nginx:alpine

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制构建的应用到 nginx 默认目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]