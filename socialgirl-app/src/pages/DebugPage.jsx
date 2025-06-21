import React from 'react';
import { getAllEnvVars, debugEnvVar, hasEnvVar } from '../utils/env';

const DebugPage = () => {
    const allEnvVars = getAllEnvVars();
    const youtubeDebug = debugEnvVar('VITE_YOUTUBE_API_KEY');
    const rapidApiDebug = debugEnvVar('VITE_RAPIDAPI_KEY');
    const nodeEnvDebug = debugEnvVar('NODE_ENV');

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h2>🔍 环境变量调试页面</h2>
            
            <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>📊 基本状态</h3>
                <p><strong>NODE_ENV:</strong> {nodeEnvDebug.finalValue || '未设置'} ({nodeEnvDebug.source})</p>
                <p><strong>YouTube API Key:</strong> {hasEnvVar('VITE_YOUTUBE_API_KEY') ? '✅ 存在' : '❌ 不存在'}</p>
                <p><strong>RapidAPI Key:</strong> {hasEnvVar('VITE_RAPIDAPI_KEY') ? '✅ 存在' : '❌ 不存在'}</p>
                <p><strong>运行时环境变量:</strong> {typeof window !== 'undefined' && window._env_ ? '✅ 已加载' : '❌ 未加载'}</p>
            </div>

            <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>🔧 详细调试信息</h3>
                
                <div style={{ marginBottom: '15px' }}>
                    <h4>YouTube API Key:</h4>
                    <p>来源: {youtubeDebug.source}</p>
                    <p>构建时值: {youtubeDebug.buildTimeValue ? `${youtubeDebug.buildTimeValue.substring(0, 10)}...` : '无'}</p>
                    <p>运行时值: {youtubeDebug.runtimeValue ? `${youtubeDebug.runtimeValue.substring(0, 10)}...` : '无'}</p>
                    <p>最终值: {youtubeDebug.finalValue ? `${youtubeDebug.finalValue.substring(0, 10)}...` : '无'}</p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <h4>RapidAPI Key:</h4>
                    <p>来源: {rapidApiDebug.source}</p>
                    <p>构建时值: {rapidApiDebug.buildTimeValue ? `${rapidApiDebug.buildTimeValue.substring(0, 10)}...` : '无'}</p>
                    <p>运行时值: {rapidApiDebug.runtimeValue ? `${rapidApiDebug.runtimeValue.substring(0, 10)}...` : '无'}</p>
                    <p>最终值: {rapidApiDebug.finalValue ? `${rapidApiDebug.finalValue.substring(0, 10)}...` : '无'}</p>
                </div>
            </div>

            <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>🌐 运行时环境变量（window._env_）</h3>
                <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                    {JSON.stringify(typeof window !== 'undefined' ? window._env_ : null, null, 2)}
                </pre>
            </div>

            <div style={{ background: '#fecaca', padding: '15px', borderRadius: '8px' }}>
                <p style={{ color: '#991b1b', fontWeight: 'bold' }}>
                    ⚠️ 此页面仅用于调试，生产环境请删除
                </p>
                <p style={{ color: '#7f1d1d', fontSize: '14px' }}>
                    如果运行时环境变量显示为 null，请检查：<br/>
                    1. Zeabur 控制台是否正确设置了环境变量<br/>
                    2. 容器是否正确重启<br/>
                    3. /env-config.js 文件是否正确生成
                </p>
            </div>
        </div>
    );
};

export default DebugPage;