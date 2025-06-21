# Zeabur 部署专用 Dockerfile
# 多阶段构建 - 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY socialgirl-app/package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY socialgirl-app/ .

# 构建应用 - 接收构建时的环境变量
ARG VITE_YOUTUBE_API_KEY
ARG VITE_RAPIDAPI_KEY
ARG NODE_ENV=production

# 设置环境变量供 Vite 构建使用
ENV VITE_YOUTUBE_API_KEY=$VITE_YOUTUBE_API_KEY
ENV VITE_RAPIDAPI_KEY=$VITE_RAPIDAPI_KEY
ENV NODE_ENV=$NODE_ENV

RUN npm run build

# 生产阶段 - 使用 nginx 服务静态文件
FROM nginx:alpine

# 删除默认的 nginx 配置
RUN rm /etc/nginx/nginx.conf

# 复制优化的 nginx 配置（完整配置文件）
COPY nginx.zeabur.simple.conf /etc/nginx/nginx.conf

# 复制启动脚本和环境变量注入脚本
COPY start.sh /usr/local/bin/start.sh
COPY inject-env.sh /usr/local/bin/inject-env.sh

# 复制构建的应用到 nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 设置脚本权限
RUN chmod +x /usr/local/bin/start.sh && \
    chmod +x /usr/local/bin/inject-env.sh

# 创建临时目录
RUN mkdir -p /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp

# 暴露端口（Zeabur 会动态分配）
EXPOSE 8080

# 使用启动脚本来处理动态端口配置
CMD ["/usr/local/bin/start.sh"]