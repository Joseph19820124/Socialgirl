/**
 * 环境变量工具函数
 * 支持构建时环境变量和运行时环境变量
 */

/**
 * 获取环境变量值
 * 优先级：运行时环境变量 > 构建时环境变量
 * @param {string} key 环境变量名
 * @returns {string|undefined} 环境变量值
 */
export function getEnvVar(key) {
    // 首先尝试从运行时环境变量获取
    if (typeof window !== 'undefined' && window._env_ && window._env_[key]) {
        return window._env_[key];
    }
    
    // 回退到构建时环境变量
    return import.meta.env[key];
}

/**
 * 获取所有可用的环境变量
 * @returns {object} 环境变量对象
 */
export function getAllEnvVars() {
    const buildTimeEnv = import.meta.env;
    const runtimeEnv = (typeof window !== 'undefined' && window._env_) ? window._env_ : {};
    
    return {
        ...buildTimeEnv,
        ...runtimeEnv
    };
}

/**
 * 检查环境变量是否存在
 * @param {string} key 环境变量名
 * @returns {boolean} 是否存在
 */
export function hasEnvVar(key) {
    const value = getEnvVar(key);
    return value !== undefined && value !== null && value !== '';
}

/**
 * 调试信息：显示环境变量来源
 * @param {string} key 环境变量名
 * @returns {object} 调试信息
 */
export function debugEnvVar(key) {
    const runtimeValue = (typeof window !== 'undefined' && window._env_) ? window._env_[key] : undefined;
    const buildTimeValue = import.meta.env[key];
    
    return {
        key,
        runtimeValue,
        buildTimeValue,
        finalValue: getEnvVar(key),
        source: runtimeValue ? 'runtime' : buildTimeValue ? 'buildtime' : 'none'
    };
}