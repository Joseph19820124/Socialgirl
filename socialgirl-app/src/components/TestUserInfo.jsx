import React from 'react';
import '../styles/components/TestUserInfo.css';

const TestUserInfo = () => {
    const testUsers = [
        {
            email: 'test@example.com',
            username: 'testuser',
            password: '123456'
        },
        {
            email: 'admin@socialgirl.com',
            username: 'admin',
            password: 'admin123'
        },
        {
            email: 'demo@demo.com',
            username: 'demo',
            password: 'demo123'
        }
    ];

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Copied to clipboard:', text);
        });
    };

    return (
        <div className="test-user-info">
            <h3>🧪 测试用户账户</h3>
            <p className="test-user-note">以下是预设的测试账户，您可以直接使用：</p>
            
            <div className="test-users-list">
                {testUsers.map((user, index) => (
                    <div key={index} className="test-user-card">
                        <h4>{user.username}</h4>
                        <div className="test-user-details">
                            <div className="test-user-field">
                                <label>邮箱:</label>
                                <span 
                                    className="copy-text" 
                                    onClick={() => copyToClipboard(user.email)}
                                    title="点击复制"
                                >
                                    {user.email}
                                </span>
                            </div>
                            <div className="test-user-field">
                                <label>密码:</label>
                                <span 
                                    className="copy-text" 
                                    onClick={() => copyToClipboard(user.password)}
                                    title="点击复制"
                                >
                                    {user.password}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="test-user-instructions">
                <p>💡 <strong>使用说明：</strong></p>
                <ul>
                    <li>点击邮箱或密码可复制到剪贴板</li>
                    <li>建议使用 <code>test@example.com</code> 作为主要测试账户</li>
                    <li>您也可以注册新账户进行测试</li>
                </ul>
            </div>
        </div>
    );
};

export default TestUserInfo;