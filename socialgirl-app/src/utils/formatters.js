export const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) {
        return '0';
    }
    return Number(num).toLocaleString();
};

export const calculateMinWidth = (text, fontSize = 10) => {
    // Create a temporary canvas element to measure text width
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${fontSize}px Orbitron, sans-serif`;
    const textWidth = context.measureText(text).width;
    // Add 10px padding (5px each side) plus some buffer for icons
    return Math.max(textWidth + 30, 80); // Minimum 80px for any column
};

export const getStatClass = (value, type) => {
    // Handle undefined/null values
    if (value === null || value === undefined || isNaN(value)) {
        return 'low-stats';
    }

    const thresholds = {
        followers: { high: 15000, medium: 10000 },
        views: { high: 4000, medium: 2000 },
        comments: { high: 200, medium: 100 },
        likes: { high: 4000, medium: 2000 },
        shares: { high: 100, medium: 50 },
        media: { high: 300, medium: 150 }
    };

    const threshold = thresholds[type];
    if (!threshold) return 'low-stats';
    
    const numValue = Number(value);
    if (numValue >= threshold.high) return 'high-stats';
    if (numValue >= threshold.medium) return 'medium-stats';
    return 'low-stats';
};