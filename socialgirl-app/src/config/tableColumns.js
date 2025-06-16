// Column configurations for different table types

export const videosColumns = [
    { key: 'username', label: '👤 Username', align: 'left' },
    { key: 'followers', label: '👥 Followers', align: 'right' },
    { key: 'title', label: '📝 Title', align: 'left' },
    { key: 'views', label: '👁️ Views', align: 'right' },
    { key: 'comments', label: '💬 Comments', align: 'right' },
    { key: 'likes', label: '❤️ Likes', align: 'right' },
    { key: 'shares', label: '🔄 Shares', align: 'right' },
    { key: 'url', label: '🔗 URL', align: 'center', sortable: false }
];

export const usersColumns = [
    { key: 'username', label: '👤 Username', align: 'left' },
    { key: 'followers', label: '👥 Followers', align: 'right' },
    { key: 'about', label: '📝 About', align: 'left' },
    { key: 'media', label: '📱 Media', align: 'right' },
    { key: 'url', label: '🔗 URL', align: 'center', sortable: false }
];

// YouTube-specific table columns
export const youtubeColumns = [
    { key: 'username', label: '👤 Channel', align: 'left' },
    { key: 'followers', label: '🔔 Subscribers', align: 'right' },
    { key: 'title', label: '📹 Video Title', align: 'left' },
    { key: 'views', label: '👁️ Views', align: 'right' },
    { key: 'comments', label: '💬 Comments', align: 'right' },
    { key: 'likes', label: '👍 Likes', align: 'right' },
    { key: 'shares', label: '🔄 Shares', align: 'right' },
    { key: 'url', label: '🔗 Watch', align: 'center', sortable: false }
];

// Instagram-specific table columns
export const instagramColumns = [
    { key: 'username', label: '👤 Account', align: 'left' },
    { key: 'followers', label: '👥 Followers', align: 'right' },
    { key: 'title', label: '📸 Post Caption', align: 'left' },
    { key: 'views', label: '👁️ Views', align: 'right' },
    { key: 'comments', label: '💬 Comments', align: 'right' },
    { key: 'likes', label: '❤️ Likes', align: 'right' },
    { key: 'shares', label: '📤 Shares', align: 'right' },
    { key: 'url', label: '🔗 View Post', align: 'center', sortable: false }
];

// TikTok-specific table columns
export const tiktokColumns = [
    { key: 'username', label: '👤 Creator', align: 'left' },
    { key: 'followers', label: '👥 Followers', align: 'right' },
    { key: 'title', label: '🎵 Video Title', align: 'left' },
    { key: 'views', label: '👁️ Views', align: 'right' },
    { key: 'comments', label: '💬 Comments', align: 'right' },
    { key: 'likes', label: '❤️ Likes', align: 'right' },
    { key: 'shares', label: '🔄 Shares', align: 'right' },
    { key: 'url', label: '🔗 Watch', align: 'center', sortable: false }
];