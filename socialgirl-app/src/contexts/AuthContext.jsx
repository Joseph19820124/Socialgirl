import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, API_CONFIG } from '../config/api';

const AuthContext = createContext({
    user: null,
    isAuthenticated: false,
    login: () => {},
    register: () => {},
    logout: () => {},
    isLoading: true
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 检查本地存储的认证token
        const checkAuthToken = async () => {
            const token = localStorage.getItem('socialgirl_auth_token');
            const userData = localStorage.getItem('socialgirl_user');
            
            if (token && userData) {
                try {
                    // 设置token到API客户端
                    apiClient.setToken(token);
                    
                    // 验证token是否仍然有效（可选，发送到后端验证）
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    console.log('[Auth] Restored user session from local storage');
                } catch (error) {
                    console.error('[Auth] Failed to restore user session:', error);
                    // 清理无效的数据
                    localStorage.removeItem('socialgirl_auth_token');
                    localStorage.removeItem('socialgirl_user');
                    apiClient.clearToken();
                }
            }
            setIsLoading(false);
        };

        checkAuthToken();
    }, []);

    const register = async (userData) => {
        try {
            console.log('[Auth] Attempting to register user:', { 
                email: userData.email, 
                username: userData.username 
            });

            // 调用后端注册API
            const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
                username: userData.username,
                email: userData.email,
                password: userData.password
            });

            if (response.success && response.user) {
                const userSession = {
                    id: response.user.id,
                    email: response.user.email,
                    username: response.user.username
                };

                // 如果后端返回token，保存它
                if (response.token) {
                    localStorage.setItem('socialgirl_auth_token', response.token);
                    apiClient.setToken(response.token);
                }

                setUser(userSession);
                localStorage.setItem('socialgirl_user', JSON.stringify(userSession));

                console.log('[Auth] Registration successful');
                return { success: true };
            } else {
                throw new Error(response.error || '注册失败');
            }
        } catch (error) {
            console.error('[Auth] Registration failed:', error.message);
            return { success: false, error: error.message };
        }
    };

    const login = async (credentials) => {
        try {
            console.log('[Auth] Attempting to login user:', { 
                email: credentials.email 
            });

            // 调用后端登录API
            const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
                email: credentials.email,
                password: credentials.password
            });

            if (response.success && response.user) {
                const userSession = {
                    id: response.user.id,
                    email: response.user.email,
                    username: response.user.username
                };

                // 保存token
                if (response.token) {
                    localStorage.setItem('socialgirl_auth_token', response.token);
                    apiClient.setToken(response.token);
                }

                setUser(userSession);
                localStorage.setItem('socialgirl_user', JSON.stringify(userSession));

                console.log('[Auth] Login successful');
                return { success: true };
            } else {
                throw new Error(response.error || '登录失败');
            }
        } catch (error) {
            console.error('[Auth] Login failed:', error.message);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            // 如果有token，通知后端登出（可选）
            if (apiClient.getToken()) {
                try {
                    await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
                } catch (error) {
                    console.warn('[Auth] Logout API call failed (non-critical):', error.message);
                }
            }
        } catch (error) {
            console.warn('[Auth] Logout cleanup error:', error.message);
        } finally {
            // 无论后端调用是否成功，都清理本地状态
            setUser(null);
            localStorage.removeItem('socialgirl_user');
            localStorage.removeItem('socialgirl_auth_token');
            apiClient.clearToken();
            console.log('[Auth] User logged out and tokens cleared');
        }
    };

    const contextValue = {
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isLoading
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;