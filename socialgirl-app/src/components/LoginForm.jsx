import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import '../styles/components/AuthForm.css';

const LoginForm = ({ onSwitchToRegister, onClose }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { login } = useAuth();
    const { showToast } = useToast();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = '请输入邮箱';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = '请输入有效的邮箱地址';
        }

        if (!formData.password) {
            newErrors.password = '请输入密码';
        } else if (formData.password.length < 6) {
            newErrors.password = '密码至少需要6位';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);
        
        try {
            const result = await login(formData);
            
            if (result.success) {
                showToast('登录成功！', 'success');
                onClose();
            } else {
                showToast(result.error || '登录失败', 'error');
            }
        } catch {
            showToast('登录过程中发生错误', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <div className="auth-form">
            <h2 className="auth-title">登录</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">邮箱</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                        placeholder="请输入邮箱"
                        disabled={isLoading}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="password">密码</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? 'error' : ''}
                        placeholder="请输入密码"
                        disabled={isLoading}
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <button 
                    type="submit" 
                    className="auth-button primary"
                    disabled={isLoading}
                >
                    {isLoading ? '登录中...' : '登录'}
                </button>

                <div className="auth-switch">
                    <span>还没有账户？</span>
                    <button 
                        type="button" 
                        className="auth-link"
                        onClick={onSwitchToRegister}
                        disabled={isLoading}
                    >
                        立即注册
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;