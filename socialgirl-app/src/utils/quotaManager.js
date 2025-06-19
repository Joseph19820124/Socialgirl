/**
 * Multi-Platform API Quota Management
 * Supports YouTube (daily), TikTok (monthly), Instagram (monthly)
 */

// Platform configurations
const PLATFORM_CONFIGS = {
    youtube: {
        limit: 10000,
        period: 'daily',
        operations: {
            search: 100,
            videos: 1,
            channels: 1
        }
    },
    tiktok: {
        limit: 200000,
        period: 'monthly',
        operations: {
            request: 1  // All TikTok API calls cost 1 unit
        }
    },
    instagram: {
        limit: 15000,
        period: 'monthly',
        operations: {
            request: 1  // All Instagram API calls cost 1 unit
        }
    }
};

const QUOTA_STORAGE_KEY = 'platform_api_quota';

/**
 * Get current date/period key for platform
 * @param {string} platform - Platform name
 * @returns {string} Date key for storage
 */
function getPeriodKey(platform) {
    const config = PLATFORM_CONFIGS[platform];
    const now = new Date();
    
    if (config.period === 'daily') {
        return now.toDateString();
    } else if (config.period === 'monthly') {
        return `${now.getFullYear()}-${now.getMonth() + 1}`;
    }
    
    return now.toDateString();
}

/**
 * Get current quota usage data for a platform
 * @param {string} platform - Platform name (youtube, tiktok, instagram)
 * @returns {Object} Quota usage data
 */
export function getQuotaUsage(platform = 'youtube') {
    if (!PLATFORM_CONFIGS[platform]) {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    const stored = localStorage.getItem(QUOTA_STORAGE_KEY);
    const currentPeriod = getPeriodKey(platform);
    
    let allData = {};
    if (stored) {
        try {
            allData = JSON.parse(stored);
        } catch (e) {
            // If JSON parsing fails, start fresh
            allData = {};
        }
    }
    
    // Initialize platform data if it doesn't exist
    if (!allData[platform]) {
        allData[platform] = {};
    }
    
    // Check if we need to reset for the current period
    if (!allData[platform][currentPeriod]) {
        allData[platform][currentPeriod] = {
            period: currentPeriod,
            used: 0,
            operations: []
        };
        localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(allData));
    }
    
    return allData[platform][currentPeriod];
}

/**
 * Track API operation usage
 * @param {string} platform - Platform name (youtube, tiktok, instagram)
 * @param {string} operation - Operation type
 * @param {number} count - Number of operations (default: 1)
 * @returns {Object} Updated quota data
 */
export function trackOperation(platform, operation, count = 1) {
    if (!PLATFORM_CONFIGS[platform]) {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    const config = PLATFORM_CONFIGS[platform];
    const cost = (config.operations[operation] || 1) * count;
    
    // Get all stored data
    const stored = localStorage.getItem(QUOTA_STORAGE_KEY);
    let allData = stored ? JSON.parse(stored) : {};
    
    // Get current period data
    const currentPeriod = getPeriodKey(platform);
    if (!allData[platform]) {
        allData[platform] = {};
    }
    if (!allData[platform][currentPeriod]) {
        allData[platform][currentPeriod] = {
            period: currentPeriod,
            used: 0,
            operations: []
        };
    }
    
    // Update usage
    allData[platform][currentPeriod].used += cost;
    allData[platform][currentPeriod].operations.push({
        operation,
        count,
        cost,
        timestamp: new Date().toISOString()
    });
    
    // Save back to storage
    localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(allData));
    return allData[platform][currentPeriod];
}

/**
 * Check if operation can be performed within quota limits
 * @param {string} platform - Platform name
 * @param {string} operation - Operation type
 * @param {number} count - Number of operations
 * @returns {boolean} Whether operation is allowed
 */
export function canPerformOperation(platform, operation, count = 1) {
    if (!PLATFORM_CONFIGS[platform]) {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    const config = PLATFORM_CONFIGS[platform];
    const quotaData = getQuotaUsage(platform);
    const cost = (config.operations[operation] || 1) * count;
    
    return (quotaData.used + cost) <= config.limit;
}

/**
 * Get remaining quota for platform
 * @param {string} platform - Platform name
 * @returns {number} Remaining quota units
 */
export function getRemainingQuota(platform) {
    if (!PLATFORM_CONFIGS[platform]) {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    const config = PLATFORM_CONFIGS[platform];
    const quotaData = getQuotaUsage(platform);
    return Math.max(0, config.limit - quotaData.used);
}

/**
 * Get quota usage percentage for platform
 * @param {string} platform - Platform name
 * @returns {number} Usage percentage (0-100)
 */
export function getQuotaUsagePercentage(platform) {
    if (!PLATFORM_CONFIGS[platform]) {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    const config = PLATFORM_CONFIGS[platform];
    const quotaData = getQuotaUsage(platform);
    return Math.round((quotaData.used / config.limit) * 100);
}

/**
 * Reset quota for specific platform (testing purposes)
 * @param {string} platform - Platform name
 */
export function resetQuota(platform) {
    if (!PLATFORM_CONFIGS[platform]) {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    const stored = localStorage.getItem(QUOTA_STORAGE_KEY);
    let allData = stored ? JSON.parse(stored) : {};
    
    const currentPeriod = getPeriodKey(platform);
    if (!allData[platform]) {
        allData[platform] = {};
    }
    
    allData[platform][currentPeriod] = {
        period: currentPeriod,
        used: 0,
        operations: []
    };
    
    localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(allData));
    return allData[platform][currentPeriod];
}

/**
 * Get quota status for display
 * @param {string} platform - Platform name
 * @returns {Object} Quota status information
 */
export function getQuotaStatus(platform) {
    if (!PLATFORM_CONFIGS[platform]) {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    const config = PLATFORM_CONFIGS[platform];
    const quotaData = getQuotaUsage(platform);
    const remaining = getRemainingQuota(platform);
    const percentage = getQuotaUsagePercentage(platform);
    
    return {
        platform,
        used: quotaData.used,
        remaining,
        total: config.limit,
        percentage,
        period: config.period,
        operationsCount: quotaData.operations.length,
        lastReset: quotaData.period
    };
}

/**
 * Get quota status for all platforms
 * @returns {Object} Quota status for all platforms
 */
export function getAllQuotaStatus() {
    const platforms = Object.keys(PLATFORM_CONFIGS);
    const status = {};
    
    platforms.forEach(platform => {
        status[platform] = getQuotaStatus(platform);
    });
    
    return status;
}