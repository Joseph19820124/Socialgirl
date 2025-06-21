# SocialGirl 后端API接口规范

## 🏗️ 架构概述

前端项目已经成功改造为纯前端应用，所有API调用都将转发到独立的后端服务。

```
┌─────────────────┐    HTTP     ┌─────────────────┐    第三方API    ┌─────────────────┐
│   前端应用       │ ─────────► │   后端API服务    │ ─────────────► │ YouTube/IG/TT   │
│ (React + Vite)  │            │                 │                │                 │
└─────────────────┘            └─────────────────┘                └─────────────────┘
```

## 🔧 前端配置

### 环境变量配置
```bash
# .env 文件
VITE_API_BASE_URL=http://localhost:3001
VITE_API_VERSION=v1
```

### API客户端
前端使用统一的API客户端 (`src/config/api.js`) 处理：
- HTTP请求封装
- JWT Token 管理
- 错误处理
- 请求/响应日志

## 🔐 认证API

### POST /api/v1/auth/register
用户注册接口

**请求体：**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**成功响应：**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "JWT_TOKEN_STRING"
}
```

**错误响应：**
```json
{
  "success": false,
  "error": "用户已存在"
}
```

### POST /api/v1/auth/login
用户登录接口

**请求体：**
```json
{
  "email": "string",
  "password": "string"
}
```

**成功响应：**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  },
  "token": "JWT_TOKEN_STRING"
}
```

### POST /api/v1/auth/logout
用户登出接口

**请求头：**
```
Authorization: Bearer JWT_TOKEN
```

**响应：**
```json
{
  "success": true
}
```

## 📺 YouTube API

### GET /api/v1/youtube/videos/search
搜索YouTube视频

**查询参数：**
- `query` (string, required): 搜索关键词
- `maxResults` (number, optional): 最大结果数 (默认: 10)
- `order` (string, optional): 排序方式 (viewCount, date, rating, relevance, title)
- `publishedAfter` (string, optional): 发布日期筛选 (ISO格式)
- `regionCode` (string, optional): 地区代码

**响应格式：**
```json
{
  "items": [
    {
      "id": "videoId",
      "snippet": {
        "title": "视频标题",
        "channelTitle": "频道名称",
        "publishedAt": "2024-01-01T00:00:00Z"
      },
      "statistics": {
        "viewCount": "1000000",
        "likeCount": "50000",
        "commentCount": "1000"
      }
    }
  ],
  "pageInfo": {
    "totalResults": 1000,
    "resultsPerPage": 10
  },
  "nextPageToken": "token"
}
```

### GET /api/v1/youtube/channels/search
搜索YouTube频道

**查询参数：**
- `handle` (string): 频道handle (如: @channelname)
- `channelId` (string): 频道ID

**响应格式：**
```json
{
  "items": [
    {
      "id": "channelId",
      "snippet": {
        "title": "频道名称",
        "description": "频道描述",
        "customUrl": "频道自定义URL"
      },
      "statistics": {
        "subscriberCount": "1000000",
        "videoCount": "500"
      }
    }
  ]
}
```

### GET /api/v1/youtube/channels/:channelId/videos
获取频道视频列表

**路径参数：**
- `channelId` (string): YouTube频道ID

**查询参数：**
- `maxResults` (number): 最大结果数 (默认: 20)
- `order` (string): 排序方式 (date, rating, relevance, title, viewCount)

**响应格式：** 同视频搜索

### GET /api/v1/youtube/videos/:videoId
获取特定视频详情

**路径参数：**
- `videoId` (string): YouTube视频ID

**响应格式：** 同视频搜索

## 📱 Instagram API

### GET /api/v1/instagram/reels/search
搜索Instagram Reels

**查询参数：**
- `keyword` (string, required): 搜索关键词
- `pagination_token` (string, optional): 分页token

**响应格式：**
```json
{
  "data": {
    "items": [
      {
        "code": "帖子代码",
        "user": {
          "username": "用户名",
          "follower_count": 1000000
        },
        "caption": {
          "text": "帖子描述"
        },
        "play_count": 500000,
        "like_count": 25000,
        "comment_count": 1000,
        "share_count": 500
      }
    ]
  },
  "pagination_token": "下一页token"
}
```

### GET /api/v1/instagram/users/:username/reels
获取用户Instagram帖子

**路径参数：**
- `username` (string): Instagram用户名

**查询参数：**
- `pagination_token` (string, optional): 分页token

**响应格式：** 同Reels搜索

## 🎵 TikTok API

### GET /api/v1/tiktok/videos/search
搜索TikTok视频

**查询参数：**
- `keyword` (string, required): 搜索关键词
- `cursor` (number, optional): 分页游标 (默认: 0)
- `search_id` (number, optional): 搜索ID (默认: 0)

**响应格式：**
```json
{
  "data": [
    {
      "item": {
        "id": "视频ID",
        "desc": "视频描述",
        "createTime": 1640995200,
        "author": {
          "uniqueId": "用户名"
        },
        "authorStats": {
          "followerCount": 1000000
        },
        "statsV2": {
          "playCount": "500000",
          "diggCount": "25000",
          "commentCount": "1000",
          "shareCount": "500"
        }
      }
    }
  ],
  "cursor": 20,
  "log_pb": {
    "impr_id": "搜索ID"
  }
}
```

### GET /api/v1/tiktok/users/:username/info
获取TikTok用户信息

**路径参数：**
- `username` (string): TikTok用户名

**响应格式：**
```json
{
  "userInfo": {
    "user": {
      "uniqueId": "用户名",
      "secUid": "安全用户ID"
    }
  }
}
```

### GET /api/v1/tiktok/users/:secUid/posts
获取TikTok用户热门帖子

**路径参数：**
- `secUid` (string): 用户安全ID

**查询参数：**
- `count` (number): 帖子数量 (默认: 35)
- `cursor` (number): 分页游标 (默认: 0)

**响应格式：**
```json
{
  "data": {
    "itemList": [
      // TikTok帖子列表，格式同搜索结果中的item
    ]
  }
}
```

## 🔒 认证机制

### JWT Token
- 前端自动在所有API请求中添加 `Authorization: Bearer <token>`
- Token 存储在 localStorage 中
- Token 过期时需要重新登录

### 错误处理
- 401: Token无效或过期，前端自动跳转登录
- 403: 权限不足
- 429: 请求频率限制
- 500: 服务器错误

## 🚀 部署配置

### 环境变量
```bash
# 生产环境
VITE_API_BASE_URL=https://api.socialgirl.com
VITE_API_VERSION=v1

# 开发环境
VITE_API_BASE_URL=http://localhost:3001
VITE_API_VERSION=v1
```

### CORS配置
后端需要配置CORS允许前端域名访问：
```javascript
// 允许的域名
const allowedOrigins = [
  'http://localhost:5173',  // 开发环境
  'https://socialgirl.app', // 生产环境
];
```

## 📋 实施清单

### ✅ 前端改造已完成
- [x] API客户端封装
- [x] 认证系统改造
- [x] YouTube API调用重构
- [x] Instagram API调用重构
- [x] TikTok API调用重构
- [x] 错误处理统一
- [x] Token管理
- [x] 构建测试通过

### 🔄 后端需要实施
- [ ] 用户认证系统
- [ ] JWT Token 生成/验证
- [ ] YouTube API代理
- [ ] Instagram API代理
- [ ] TikTok API代理
- [ ] 数据缓存机制
- [ ] 请求限速
- [ ] 日志系统
- [ ] 错误处理

## 🛠️ 开发建议

### 后端技术栈推荐
- **Node.js + Express/Fastify**
- **Python + FastAPI/Django**
- **Java + Spring Boot**
- **Go + Gin/Echo**

### 数据库
- **用户数据**: PostgreSQL/MySQL
- **缓存**: Redis
- **日志**: MongoDB/Elasticsearch

### 部署
- **容器化**: Docker
- **编排**: Docker Compose/Kubernetes
- **反向代理**: Nginx
- **SSL**: Let's Encrypt

## 📝 注意事项

1. **API密钥安全**: 第三方API密钥只在后端存储，前端不可见
2. **请求限制**: 实施合理的请求频率限制
3. **数据缓存**: 缓存第三方API响应，减少调用次数
4. **错误日志**: 记录所有API调用和错误
5. **监控告警**: 监控API可用性和响应时间

前端项目现在已经完全独立，可以与任何实现了上述API规范的后端服务配合使用！