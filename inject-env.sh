#!/bin/sh

# 运行时环境变量注入脚本
# 将环境变量写入到一个 JavaScript 文件中

echo "Injecting runtime environment variables..."

# 创建环境变量 JavaScript 文件
cat > /usr/share/nginx/html/env-config.js << EOF
window._env_ = {
  VITE_YOUTUBE_API_KEY: "${VITE_YOUTUBE_API_KEY:-}",
  VITE_RAPIDAPI_KEY: "${VITE_RAPIDAPI_KEY:-}",
  NODE_ENV: "${NODE_ENV:-production}"
};
EOF

echo "Environment variables injected successfully"
echo "VITE_YOUTUBE_API_KEY exists: $([ -n "$VITE_YOUTUBE_API_KEY" ] && echo "Yes" || echo "No")"
echo "VITE_RAPIDAPI_KEY exists: $([ -n "$VITE_RAPIDAPI_KEY" ] && echo "Yes" || echo "No")"