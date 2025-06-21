import React from 'react';
import TestUserInfo from './TestUserInfo';
import '../styles/components/LoginLandingPage.css';

const LoginLandingPage = ({ onLoginClick }) => {
    return (
        <div className="login-landing">
            {/* Hero Section */}
            <div className="login-hero">
                <div className="hero-content">
                    <div className="hero-logo">
                        <div className="logo-text">
                            <span className="logo-social">SOCIAL</span>
                            <span className="logo-girl">GIRL</span>
                        </div>
                        <div className="logo-tagline">Content Analytics Dashboard</div>
                    </div>
                    
                    <div className="hero-description">
                        <h1 className="hero-title">
                            分析 <span className="highlight-youtube">YouTube</span>、
                            <span className="highlight-instagram">Instagram</span> 和 
                            <span className="highlight-tiktok">TikTok</span> 内容表现
                        </h1>
                        <p className="hero-subtitle">
                            统一的仪表板，深度的数据洞察，助力内容创作者和营销团队做出更明智的决策
                        </p>
                    </div>

                    <div className="hero-actions">
                        <button 
                            className="aurora-btn aurora-btn-primary aurora-btn-lg hero-login-btn"
                            onClick={onLoginClick}
                        >
                            <span>开始分析</span>
                            <div className="btn-icon">→</div>
                        </button>
                        <div className="hero-features">
                            <div className="feature-item">
                                <span className="feature-icon">📊</span>
                                <span>实时数据分析</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🎯</span>
                                <span>多平台支持</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">⚡</span>
                                <span>智能洞察</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="floating-elements">
                    <div className="float-element float-1"></div>
                    <div className="float-element float-2"></div>
                    <div className="float-element float-3"></div>
                    <div className="float-element float-4"></div>
                </div>
            </div>

            {/* Features Section */}
            <div className="features-section">
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon-large">📈</div>
                        <h3>YouTube 分析</h3>
                        <p>深度分析视频表现、用户参与度和频道增长趋势</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-large">📱</div>
                        <h3>Instagram 洞察</h3>
                        <p>跟踪帖子互动、Stories 表现和用户行为模式</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-large">🎵</div>
                        <h3>TikTok 数据</h3>
                        <p>监控病毒式传播、音乐趋势和创作者表现</p>
                    </div>
                </div>
            </div>

            {/* Test Users Section */}
            <div className="test-users-section">
                <TestUserInfo />
            </div>
        </div>
    );
};

export default LoginLandingPage;