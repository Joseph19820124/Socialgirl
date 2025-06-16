import fs from 'fs';
import { extractUserData } from './socialgirl-app/src/mappers/tiktok.js';

// Test with actual API response
const tiktokResponse = JSON.parse(fs.readFileSync('./api_responses/tiktok_user_response.json', 'utf8'));

console.log('👤 Extracted TikTok User Data:');
console.log(JSON.stringify(extractUserData(tiktokResponse), null, 2));