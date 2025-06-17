// Test script to verify TikTok mapper extracts follower counts correctly
const { extractVideoData, extractUsersDataFromSearch } = require('./socialgirl-app/src/mappers/tiktok.js');

// Sample API response structure from /search/general endpoint
const mockApiResponse = {
    "status_code": 0,
    "data": [
        {
            "type": 1,
            "item": {
                "id": "7486082112064392494",
                "desc": "Munchkin cat #foryour #funny #animals #cute #tiktok #fyp",
                "createTime": 1742989333,
                "author": {
                    "uniqueId": "catlover123",
                    "followerCount": 124100000,
                    "videoCount": 50,
                    "signature": "Love cats and making videos"
                },
                "statsV2": {
                    "playCount": 1000000,
                    "diggCount": 50000,
                    "commentCount": 2500,
                    "shareCount": 1200
                }
            }
        },
        {
            "type": 1,
            "item": {
                "id": "7486082112064392495",
                "desc": "Another cat video",
                "createTime": 1742989400,
                "author": {
                    "uniqueId": "anothercatlover",
                    "followerCount": 5600000,
                    "videoCount": 30,
                    "signature": "Cat enthusiast"
                },
                "statsV2": {
                    "playCount": 500000,
                    "diggCount": 25000,
                    "commentCount": 1200,
                    "shareCount": 600
                }
            }
        }
    ]
};

console.log('Testing TikTok Video Data Extraction:');
const videoData = extractVideoData(mockApiResponse);
console.log(JSON.stringify(videoData, null, 2));

console.log('\nTesting TikTok Users Data Extraction:');
const usersData = extractUsersDataFromSearch(mockApiResponse);
console.log(JSON.stringify(usersData, null, 2));

// Verify follower counts are extracted correctly
console.log('\nFollower Counts Test:');
usersData.forEach(user => {
    console.log(`${user.username}: ${user.followers.toLocaleString()} followers`);
});