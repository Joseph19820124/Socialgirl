import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import '../styles/components/AuthForm.css';

const RegisterForm = ({ onSwitchToLogin, onClose }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { register } = useAuth();
    const { showToast } = useToast();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username) {
            newErrors.username = '请输入用户名';
        } else if (formData.username.length < 2) {
            newErrors.username = '用户名至少需要2位';
        }

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

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = '请确认密码';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = '两次输入的密码不一致';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);
        
        try {
            const result = await register(formData);
            
            if (result.success) {
                showToast('注册成功！', 'success');
                onClose();
            } else {
                showToast(result.error || '注册失败', 'error');
            }
        } catch {
            showToast('注册过程中发生错误', 'error');
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
            <h2 className="auth-title">注册</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">用户名</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={errors.username ? 'error' : ''}
                        placeholder="请输入用户名"
                        disabled={isLoading}
                    />
                    {errors.username && <span className="error-message">{errors.username}</span>}
                </div>

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
                        placeholder="请输入密码（至少6位）"
                        disabled={isLoading}
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">确认密码</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? 'error' : ''}
                        placeholder="请再次输入密码"
                        disabled={isLoading}
                    />
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>

                <button 
                    type="submit" 
                    className="auth-button primary"
                    disabled={isLoading}
                >
                    {isLoading ? '注册中...' : '注册'}
                </button>

                <div className="auth-switch">
                    <span>已有账户？</span>
                    <button 
                        type="button" 
                        className="auth-link"
                        onClick={onSwitchToLogin}
                        disabled={isLoading}
                    >
                        立即登录
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;