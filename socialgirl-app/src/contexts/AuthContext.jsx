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
            const existingUsers = JSON.parse(localStorage.getItem('socialgirl_users') || '[]');
            
            if (existingUsers.find(u => u.email === userData.email)) {
                throw new Error('用户已存在');
            }

            const newUser = {
                id: Date.now().toString(),
                email: userData.email,
                username: userData.username,
                password: userData.password,
                createdAt: new Date().toISOString()
            };

            existingUsers.push(newUser);
            localStorage.setItem('socialgirl_users', JSON.stringify(existingUsers));

            const userSession = {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username
            };

            setUser(userSession);
            localStorage.setItem('socialgirl_user', JSON.stringify(userSession));

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const login = async (credentials) => {
        try {
            const existingUsers = JSON.parse(localStorage.getItem('socialgirl_users') || '[]');
            const user = existingUsers.find(u => 
                u.email === credentials.email && u.password === credentials.password
            );

            if (!user) {
                throw new Error('邮箱或密码错误');
            }

            const userSession = {
                id: user.id,
                email: user.email,
                username: user.username
            };

            setUser(userSession);
            localStorage.setItem('socialgirl_user', JSON.stringify(userSession));

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('socialgirl_user');
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