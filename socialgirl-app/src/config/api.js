/**
 * API Client Configuration for Backend Communication
 * 后端API通信配置
 */

// 获取环境变量配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

// 构建完整的API URL
export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    VERSION: API_VERSION,
    FULL_URL: `${API_BASE_URL}/api/${API_VERSION}`,
    ENDPOINTS: {
        // 认证相关
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register', 
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh'
        },
        // YouTube API
        YOUTUBE: {
            SEARCH_VIDEOS: '/youtube/videos/search',
            SEARCH_CHANNELS: '/youtube/channels/search',
            CHANNEL_VIDEOS: '/youtube/channels/:channelId/videos',
            VIDEO_DETAILS: '/youtube/videos/:videoId'
        },
        // Instagram API
        INSTAGRAM: {
            SEARCH_REELS: '/instagram/reels/search',
            USER_REELS: '/instagram/users/:username/reels'
        },
        // TikTok API
        TIKTOK: {
            SEARCH_VIDEOS: '/tiktok/videos/search',
            USER_INFO: '/tiktok/users/:username/info',
            USER_POSTS: '/tiktok/users/:secUid/posts'
        }
    }
};

/**
 * API Client class for making HTTP requests to backend
 * 后端API HTTP请求客户端
 */
export class ApiClient {
    constructor() {
        this.baseURL = API_CONFIG.FULL_URL;
        this.token = null;
    }

    /**
     * Set authentication token
     * @param {string} token JWT token
     */
    setToken(token) {
        this.token = token;
    }

    /**
     * Get authentication token
     * @returns {string|null} Current token
     */
    getToken() {
        return this.token || localStorage.getItem('socialgirl_auth_token');
    }

    /**
     * Clear authentication token
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('socialgirl_auth_token');
    }

    /**
     * Build headers for API requests
     * @param {Object} customHeaders Additional headers
     * @returns {Object} Headers object
     */
    buildHeaders(customHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...customHeaders
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Build full URL for API endpoint
     * @param {string} endpoint API endpoint
     * @param {Object} pathParams Path parameters to replace in URL
     * @returns {string} Full URL
     */
    buildUrl(endpoint, pathParams = {}) {
        let url = `${this.baseURL}${endpoint}`;
        
        // Replace path parameters
        Object.entries(pathParams).forEach(([key, value]) => {
            url = url.replace(`:${key}`, encodeURIComponent(value));
        });

        return url;
    }

    /**
     * Build query string from parameters
     * @param {Object} params Query parameters
     * @returns {string} Query string
     */
    buildQueryString(params = {}) {
        const searchParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                searchParams.append(key, value);
            }
        });

        const queryString = searchParams.toString();
        return queryString ? `?${queryString}` : '';
    }

    /**
     * Make HTTP request to backend API
     * @param {string} method HTTP method
     * @param {string} endpoint API endpoint
     * @param {Object} options Request options
     * @returns {Promise<Object>} API response
     */
    async request(method, endpoint, options = {}) {
        const {
            data,
            params = {},
            pathParams = {},
            headers = {},
            timeout = 30000
        } = options;

        const url = this.buildUrl(endpoint, pathParams) + this.buildQueryString(params);
        const requestHeaders = this.buildHeaders(headers);

        console.log(`[API Client] ${method.toUpperCase()} ${url}`);
        console.log(`[API Client] Headers:`, {
            ...requestHeaders,
            Authorization: requestHeaders.Authorization ? 'Bearer ***' : undefined
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const config = {
                method: method.toUpperCase(),
                headers: requestHeaders,
                signal: controller.signal
            };

            if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
                config.body = JSON.stringify(data);
            }

            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            console.log(`[API Client] Response status: ${response.status} ${response.statusText}`);

            // Handle different response types
            const contentType = response.headers.get('content-type');
            let responseData;

            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            if (!response.ok) {
                const errorMessage = responseData?.message || responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            console.log(`[API Client] Success:`, {
                status: response.status,
                hasData: !!responseData,
                dataType: typeof responseData
            });

            return responseData;

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }

            console.error(`[API Client] Error:`, error.message);
            throw error;
        }
    }

    // Convenience methods
    async get(endpoint, options = {}) {
        return this.request('GET', endpoint, options);
    }

    async post(endpoint, data, options = {}) {
        return this.request('POST', endpoint, { ...options, data });
    }

    async put(endpoint, data, options = {}) {
        return this.request('PUT', endpoint, { ...options, data });
    }

    async patch(endpoint, data, options = {}) {
        return this.request('PATCH', endpoint, { ...options, data });
    }

    async delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, options);
    }
}

// 导出单例实例
export const apiClient = new ApiClient();

export default apiClient;