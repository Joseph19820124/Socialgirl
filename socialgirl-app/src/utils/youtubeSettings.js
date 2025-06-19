const STORAGE_KEY = 'youtubeSearchSettings';

const DEFAULT_SETTINGS = {
    regionCode: 'US',
    publishedFilter: '1week'
};

const REGION_CODES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'BR', name: 'Brazil' },
    { code: 'IN', name: 'India' },
    { code: 'MX', name: 'Mexico' }
];

const PUBLISHED_FILTERS = [
    { value: '1week', label: '1 Week' },
    { value: '1month', label: '1 Month' },
    { value: '3months', label: '3 Months' }
];

export function getYouTubeSettings() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
    } catch (error) {
        console.error('Error loading YouTube settings:', error);
    }
    return DEFAULT_SETTINGS;
}

export function saveYouTubeSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('Error saving YouTube settings:', error);
        return false;
    }
}

export function getPublishedAfterDate(filter) {
    const now = new Date();
    
    switch (filter) {
        case '1week':
            now.setDate(now.getDate() - 7);
            break;
        case '1month':
            now.setMonth(now.getMonth() - 1);
            break;
        case '3months':
            now.setMonth(now.getMonth() - 3);
            break;
        default:
            now.setDate(now.getDate() - 7);
    }
    
    return now.toISOString();
}

export { REGION_CODES, PUBLISHED_FILTERS };