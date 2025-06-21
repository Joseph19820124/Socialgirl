#!/bin/sh

# Zeabur 启动脚本 - 处理动态端口配置和环境变量注入
# Zeabur 会自动设置 PORT 环境变量

# 获取端口，默认为 8080
PORT=${PORT:-8080}

echo "Starting Nginx on port $PORT"

# 创建临时目录
mkdir -p /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp

# 替换 nginx 配置中的端口占位符
sed -i "s/PORT_PLACEHOLDER/$PORT/g" /etc/nginx/nginx.conf

# 注入运行时环境变量
echo "Injecting runtime environment variables..."
/usr/local/bin/inject-env.sh

# 验证配置文件
nginx -t

# 启动 nginx
exec nginx -g "daemon off;"