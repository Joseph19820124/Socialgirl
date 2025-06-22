// Column configurations for different table types

export const videosColumns = [
    { key: 'username', label: 'Username', align: 'left', width: 120 },
    { key: 'followers', label: 'Followers', align: 'right', width: 100 },
    { key: 'title', label: 'Title', align: 'left', width: 126 },
    { key: 'views', label: 'Views', align: 'right', width: 85 },
    { key: 'comments', label: 'Comments', align: 'right', width: 70 },
    { key: 'likes', label: 'Likes', align: 'right', width: 70 },
    { key: 'shares', label: 'Shares', align: 'right', width: 70 },
    { key: 'url', label: 'URL', align: 'center', sortable: false, width: 85 }
];

export const usersColumns = [
    { key: 'username', label: 'Username', align: 'left', width: 120 },
    { key: 'followers', label: 'Followers', align: 'right', width: 100 },
    { key: 'about', label: 'About', align: 'left', width: 350 },
    { key: 'media', label: 'Media', align: 'right', width: 70 },
    { key: 'url', label: 'URL', align: 'center', sortable: false, width: 85 }
];

// User Videos columns - for YouTube, should match YouTube columns structure
export const userVideosColumns = [
    { key: 'username', label: 'Channel', align: 'left', width: 120 },
    { key: 'title', label: 'Video Title', align: 'left', width: 126 },
    { key: 'views', label: 'Views', align: 'right', width: 85 },
    { key: 'comments', label: 'Comments', align: 'right', width: 70 },
    { key: 'likes', label: 'Likes', align: 'right', width: 70 },
    { key: 'published', label: 'Published', align: 'center', width: 90 },
    { key: 'performance', label: 'Performance', align: 'center', width: 110 },
    { key: 'url', label: 'Watch', align: 'center', sortable: false, width: 85 }
];

// YouTube-specific table columns
export const youtubeColumns = [
    { key: 'username', label: 'Channel', align: 'left', width: 120 },
    { key: 'title', label: 'Video Title', align: 'left', width: 126 },
    { key: 'views', label: 'Views', align: 'right', width: 85 },
    { key: 'comments', label: 'Comments', align: 'right', width: 70 },
    { key: 'likes', label: 'Likes', align: 'right', width: 70 },
    { key: 'published', label: 'Published', align: 'center', width: 90 },
    { key: 'performance', label: 'Performance', align: 'center', width: 110 },
    { key: 'url', label: 'Watch', align: 'center', sortable: false, width: 85 }
];

// Instagram-specific table columns
export const instagramColumns = [
    { key: 'username', label: 'Account', align: 'left', width: 120 },
    { key: 'followers', label: 'Followers', align: 'right', width: 100 },
    { key: 'title', label: 'Post Caption', align: 'left', width: 126 },
    { key: 'views', label: 'Views', align: 'right', width: 85 },
    { key: 'comments', label: 'Comments', align: 'right', width: 70 },
    { key: 'likes', label: 'Likes', align: 'right', width: 70 },
    { key: 'shares', label: 'Shares', align: 'right', width: 70 },
    { key: 'performance', label: 'Performance', align: 'center', width: 110 },
    { key: 'url', label: 'Watch', align: 'center', sortable: false, width: 85 }
];

// TikTok-specific table columns
export const tiktokColumns = [
    { key: 'username', label: 'Creator', align: 'left', width: 120 },
    { key: 'followers', label: 'Followers', align: 'right', width: 100 },
    { key: 'title', label: 'Video Title', align: 'left', width: 126 },
    { key: 'views', label: 'Views', align: 'right', width: 85 },
    { key: 'comments', label: 'Comments', align: 'right', width: 70 },
    { key: 'likes', label: 'Likes', align: 'right', width: 70 },
    { key: 'shares', label: 'Shares', align: 'right', width: 70 },
    { key: 'performance', label: 'Performance', align: 'center', width: 110 },
    { key: 'url', label: 'Watch', align: 'center', sortable: false, width: 85 }
];