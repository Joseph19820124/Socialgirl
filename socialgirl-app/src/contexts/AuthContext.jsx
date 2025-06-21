import React, { createContext, useContext, useState, useEffect } from 'react';

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
        // Initialize test users if none exist
        const existingUsers = JSON.parse(localStorage.getItem('socialgirl_users') || '[]');
        if (existingUsers.length === 0) {
            const testUsers = [
                {
                    id: '1',
                    email: 'test@example.com',
                    username: 'testuser',
                    password: '123456',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    email: 'admin@socialgirl.com',
                    username: 'admin',
                    password: 'admin123',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '3',
                    email: 'demo@demo.com',
                    username: 'demo',
                    password: 'demo123',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('socialgirl_users', JSON.stringify(testUsers));
            console.log('[Auth] Initialized test users');
        }

        const storedUser = localStorage.getItem('socialgirl_user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
            } catch (error) {
                console.error('[Auth] Failed to parse stored user data:', error);
                localStorage.removeItem('socialgirl_user');
            }
        }
        setIsLoading(false);
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