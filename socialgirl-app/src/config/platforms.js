import { youtubeColumns, instagramColumns, tiktokColumns } from './tableColumns';

export const PLATFORMS = {
    youtube: {
        id: 'youtube',
        name: 'YouTube',
        title: 'YouTube Analytics',
        path: '/youtube',
        columns: youtubeColumns
    },
    instagram: {
        id: 'instagram',
        name: 'Instagram', 
        title: 'Instagram Analytics',
        path: '/instagram',
        columns: instagramColumns
    },
    tiktok: {
        id: 'tiktok',
        name: 'TikTok',
        title: 'TikTok Analytics',
        path: '/tiktok',
        columns: tiktokColumns
    }
};

export const PLATFORM_LIST = Object.values(PLATFORMS);
export const DEFAULT_PLATFORM = 'youtube';