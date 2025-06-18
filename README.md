# Socialgirl - Social Media Analytics Dashboard

A React-based dashboard for analyzing social media metrics across YouTube, Instagram, and TikTok platforms.

## Features

- **Multi-platform Analytics**: YouTube, Instagram, and TikTok integration
- **Real-time Data**: Fetch live metrics from platform APIs
- **Performance Scoring**: Color-coded performance metrics with calculated scores
- **Responsive Tables**: Sortable, resizable columns with pagination
- **Search Functionality**: Platform-specific search capabilities

## Solution Patterns & Fixes

### React: Pagination Implementation for Large Datasets

**Symptoms:**
- Tables showing all data at once causing performance issues
- Need to limit display to 10 items per page
- Pagination controls needed for navigation

**Root Cause:**
Rendering large datasets (50+ items) in tables without pagination causes poor UX and performance degradation.

**Solution:**
Implement client-side pagination with data slicing and pagination controls.

**Code Pattern:**
```javascript
// State management for pagination
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

// Calculate paginated data slice
const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
);

// Reset page when data changes
useEffect(() => {
    setSortedData(data);
    setCurrentPage(1); // Reset to first page when data changes
}, [data]);

// Render pagination component
<Pagination
    currentPage={currentPage}
    totalItems={sortedData.length}
    itemsPerPage={itemsPerPage}
    onPageChange={setCurrentPage}
/>
```

**Key Points:**
- Always slice data before rendering to improve performance
- Reset to page 1 when new data arrives
- Calculate total pages: `Math.ceil(totalItems / itemsPerPage)`
- Use consistent itemsPerPage across all tables

**Applicable To:**
- Language: JavaScript/TypeScript
- Frameworks: React
- Use Cases: Any large dataset display in tables

---

### Vite: Environment Variables Configuration

**Symptoms:**
- "process is not defined" error in browser console
- Environment variables not accessible in Vite React app
- API keys not loading from .env file

**Root Cause:**
Vite uses a different environment variable system than traditional Node.js. Variables must be prefixed with `VITE_` and accessed via `import.meta.env`.

**Solution:**
Use Vite-specific environment variable patterns.

**Code Pattern:**
```javascript
// ❌ Wrong - Node.js pattern won't work in Vite
const API_KEY = process.env.YOUTUBE_API_KEY;

// ✅ Correct - Vite pattern
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// .env file format
VITE_YOUTUBE_API_KEY=your_api_key_here
VITE_TIKTOK_RAPIDAPI_KEY=your_rapidapi_key_here
```

**Key Points:**
- All client-side environment variables must start with `VITE_`
- Use `import.meta.env` instead of `process.env`
- Variables are exposed to client-side code (don't put secrets here)
- Restart dev server after changing .env files

**Applicable To:**
- Language: JavaScript/TypeScript
- Frameworks: Vite + React
- Use Cases: Environment configuration in Vite projects

---

### CSS: Fixed Table Layout with Content Overflow Prevention

**Symptoms:**
- Table columns resize between pages causing layout shifts
- Content overflowing table cells and extending beyond column boundaries
- Inconsistent column widths based on content length
- Text not truncating properly despite CSS truncation properties

**Root Cause:**
Without `table-layout: fixed` and matching content element constraints, tables auto-size based on content. Content elements (spans) inside table cells need explicit max-width constraints that match their column definitions to prevent overflow.

**Solution:**
Implement fixed table layout with matching content element constraints and proper truncation.

**Code Pattern:**
```css
/* ✅ Fixed table layout prevents auto-sizing */
table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}

/* ✅ Base truncation for all cells */
td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ✅ Column definitions set table structure */
.username-col { width: 90px; }
.title-col { width: 250px; }
.views-col, .comments-col, .likes-col { width: 80px; }

/* ✅ Content elements must match column widths */
.username {
    max-width: 90px;  /* Matches .username-col */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;   /* Avoid flexbox interference */
}

.title {
    max-width: 250px; /* Matches .title-col */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.views, .comments, .likes {
    max-width: 80px;  /* Matches column width */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
```

**Key Points:**
- `table-layout: fixed` prevents content-based column resizing
- Content element max-width must exactly match column width definitions
- Avoid `display: flex` on text content elements (prevents truncation)
- Apply truncation properties to content elements, not just table cells
- Test that long content actually truncates instead of overflowing

**Applicable To:**
- Language: CSS
- Frameworks: Any web framework using HTML tables
- Use Cases: Data tables requiring stable layout and content constraints

---

### Security: Client-Side API Key Management Without External Services

**Symptoms:**
- Need to store API keys securely in browser-based application
- Want to avoid external services (Supabase, AWS, etc.) for simplicity
- Keys deleted when clearing browser storage/history
- Keys not shared across browsers or devices
- Environment variables exposed in client bundle with Vite

**Root Cause:**
Client-side applications expose environment variables in the bundle. Browser storage (localStorage/sessionStorage) is device-specific and cleared with browser data. Need a solution that provides security without external dependencies.

**Solution:**
Implement hybrid approach with encrypted localStorage and export/import functionality for portability.

**Code Pattern:**
```javascript
// encryption.js - Web Crypto API for client-side encryption
async function generateKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    
    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

// API key manager with fallback
async function getApiKey(keyName, envVarName) {
    try {
        // Try localStorage first
        const stored = loadEncryptedSettings();
        if (stored && password) {
            const decrypted = await decryptData(stored, password);
            if (decrypted[keyName]) return decrypted[keyName];
        }
    } catch (error) {
        console.warn('Failed to decrypt stored settings');
    }
    
    // Fallback to environment variable
    return import.meta.env[envVarName] || null;
}

// Export settings to file
async function exportSettings(apiKeys, password) {
    const encrypted = await encryptData(apiKeys, password);
    const blob = new Blob([JSON.stringify(encrypted)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'app-settings.json';
    a.click();
}

// Import settings from file
function importSettings(file, password) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const encrypted = JSON.parse(e.target.result);
        const decrypted = await decryptData(encrypted, password);
        saveEncryptedSettings(encrypted);
    };
    reader.readAsText(file);
}
```

**Key Points:**
- Use Web Crypto API for strong encryption (AES-256-GCM)
- PBKDF2 with 100,000 iterations for key derivation
- Store encrypted data in localStorage for convenience
- Export/import encrypted JSON files for portability
- Always fallback to environment variables
- User controls their own data - no external dependencies
- Password never stored, only used for encryption/decryption

**Applicable To:**
- Language: JavaScript/TypeScript
- Frameworks: React, Vue, Angular (any client-side framework)
- Use Cases: Storing sensitive configuration in browser apps without backend

---

### UI/UX: Mobile-Responsive Web Application Implementation

**Symptoms:**
- Website not optimized for mobile devices
- Navigation menus too large for mobile screens
- Search bars taking up too much space on mobile
- Tables not scrollable on small screens
- Font sizes and padding too large for mobile viewing
- Logo sizes not scaling appropriately

**Root Cause:**
Modern web applications need responsive design to work across devices. Without proper mobile-first CSS media queries and mobile navigation patterns, desktop-designed interfaces become unusable on smaller screens.

**Solution:**
Implement comprehensive mobile-responsive design with hamburger navigation, horizontal table scrolling, and progressive font/spacing reduction.

**Code Pattern:**
```css
/* Hamburger Menu Implementation */
.mobile-menu-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    flex-direction: column;
    width: 30px;
    height: 24px;
    z-index: 1001;
}

.hamburger-line {
    display: block;
    width: 100%;
    height: 3px;
    background-color: #00f5ff;
    border-radius: 2px;
    transition: all 0.3s ease;
    position: absolute;
}

/* Mobile Navigation Slide-out */
@media (max-width: 768px) {
    .mobile-menu-toggle {
        display: flex;
    }
    
    .nav-menu {
        position: fixed;
        top: 0;
        right: -100%;
        width: 280px;
        height: 100vh;
        background: linear-gradient(135deg, #1a1a1d 0%, #0e0e10 100%);
        flex-direction: column;
        transition: right 0.3s ease;
        z-index: 1000;
    }
    
    .nav-menu.mobile-menu-open {
        right: 0;
    }
    
    /* Hide header search bar on mobile */
    .header .search-bar {
        display: none;
    }
}

/* Mobile Table Horizontal Scrolling */
@media (max-width: 768px) {
    .table-wrapper {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }
    
    .table-wrapper::after {
        content: '→ Scroll horizontally →';
        position: absolute;
        bottom: 10px;
        right: 20px;
        font-size: 11px;
        color: #9146ff;
        opacity: 0.7;
        animation: fadeInOut 3s ease-in-out infinite;
    }
    
    table {
        min-width: 800px; /* Force horizontal scroll */
    }
    
    /* Progressive font size reduction */
    th {
        font-size: 9px;
        padding: 10px 8px;
    }
    
    td {
        font-size: 11px;
        padding: 8px;
    }
}

/* Extra small screens */
@media (max-width: 480px) {
    .logo {
        font-size: 20px; /* Reduced from 32px */
    }
    
    th {
        font-size: 8px;
        padding: 8px 6px;
    }
    
    td {
        font-size: 10px;
        padding: 6px;
    }
}
```

```javascript
// React Component Pattern for Mobile Menu
const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className={`header ${isMobileMenuOpen ? 'menu-open' : ''}`}>
            <div className="header-mobile-row">
                <div className="logo">YourLogo</div>
                <button 
                    className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
                    onClick={toggleMobileMenu}
                    aria-label="Toggle mobile menu"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
            </div>
            
            {isMobileMenuOpen && (
                <div 
                    className="mobile-menu-overlay" 
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            
            <nav className={`nav-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
                <Navigation closeMenu={() => setIsMobileMenuOpen(false)} />
                {/* Hide search on mobile via CSS */}
                <SearchBar />
            </nav>
        </div>
    );
};
```

**Key Points:**
- Use hamburger menu pattern for mobile navigation (≤768px breakpoint)
- Implement slide-out menu with overlay and smooth animations
- Hide less essential elements (like header search) on mobile
- Enable horizontal table scrolling with visual indicators
- Use progressive font size reduction (24px → 20px → 18px for titles)
- Disable touch interactions that don't work well (column resizing)
- Ensure minimum 44px tap targets for accessibility
- Test on actual mobile devices, not just browser dev tools

**Applicable To:**
- Language: CSS/JavaScript/TypeScript
- Frameworks: React, Vue, Angular (any web framework)
- Use Cases: Making desktop web applications mobile-responsive

---

### API Integration: Quota Manager Platform Parameter Error

**Symptoms:**
- Console error: `Error: Unsupported platform: videos`
- Error occurs when fetching YouTube video statistics
- Error trace shows: quotaManager.js:144 → youtube.js:130 → searchService.js → useSearch.js:24
- YouTube search functionality fails

**Root Cause:**
The quota manager's `canPerformOperation` function expects platform name as the first parameter (e.g., 'youtube', 'tiktok', 'instagram'), but code was passing the operation type ('videos') as the platform parameter, causing it to be interpreted as an unsupported platform.

**Solution:**
Update API calls to properly specify platform and operation parameters separately.

**Code Pattern:**
```javascript
// ❌ Wrong - Passing operation as platform
if (!canPerformOperation('videos')) {
    throw new Error('API quota exceeded');
}

// ✅ Correct - Platform, operation, and count parameters
if (!canPerformOperation('youtube', 'videos', videoIds.length)) {
    throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
}

// ✅ Track operation with proper parameters
trackOperation('youtube', 'videos', videoIds.length);
```

**Key Points:**
- Always pass platform name ('youtube', 'tiktok', 'instagram') as first parameter
- Operation type ('search', 'videos', 'channels') is the second parameter
- Include count parameter when fetching multiple items for accurate quota tracking
- Quota manager validates platform parameter against supported platforms
- This pattern applies to both `canPerformOperation` and `trackOperation` functions

**Applicable To:**
- Language: JavaScript/TypeScript
- Frameworks: Any JavaScript application with API quota management
- Use Cases: Managing API rate limits and quotas across multiple platforms

---

### UI/UX: Preventing Layout Shifts with Error Messages

**Symptoms:**
- Error message appears at top of page causing entire content to shift down
- Buttons or other UI elements move position when error messages show/hide
- Poor user experience with jumpy interface
- Error message saying "Please enter a password to encrypt the export file" causes layout shifts

**Root Cause:**
Dynamically adding/removing error messages to the DOM changes the document flow, pushing other elements up or down. This creates layout shifts that are jarring for users and violate Core Web Vitals best practices.

**Solution:**
Display error messages inline near the triggering element without affecting layout, using either absolute positioning or reserved space.

**Code Pattern:**
```javascript
// ❌ Wrong - Global error message causes layout shift
const [message, setMessage] = useState('');
const handleAction = () => {
    if (!password) {
        setMessage('Please enter a password');
    }
};
// In JSX:
{message && <div className="error-message">{message}</div>}
<button onClick={handleAction}>Export</button>

// ✅ Correct - Local inline error with no layout shift
const [exportError, setExportError] = useState('');
const handleExport = () => {
    if (!password.trim()) {
        setExportError('Error. Enter password');
        return;
    }
    setExportError('');
};
// In JSX:
<div className="button-group">
    <button onClick={handleExport} className="btn-secondary">
        Export Settings
    </button>
</div>
<div className="export-error">{exportError}</div>
```

```css
/* ✅ Option 1: Reserved space (prevents all shifts) */
.export-error {
    color: #f44336;
    font-size: 11px;
    height: 14px;  /* Always takes up space */
    margin-top: 2px;
}

/* ✅ Option 2: Absolute positioning (overlay approach) */
.button-wrapper {
    position: relative;
}
.export-error {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    color: #f44336;
    font-size: 11px;
    white-space: nowrap;
}
```

**Key Points:**
- Use local error states for inline messages instead of global message states
- Keep error messages concise ("Error. [Fix]" format)
- Either reserve space for errors (height property) or use absolute positioning
- Place errors close to their trigger element for better UX
- Small font size (11px) for inline errors to minimize visual impact
- Test that UI doesn't shift when errors appear/disappear

**Applicable To:**
- Language: JavaScript/TypeScript, CSS
- Frameworks: React, Vue, Angular (any component-based framework)
- Use Cases: Form validation, action feedback, inline error displays

---

### CSS: Changing Google Fonts Across Application

**Symptoms:**
- Need to change Google Font from one font to another (e.g., Orbitron to Roboto)
- Font declarations scattered across multiple CSS files
- Font used in JavaScript for text measurements
- Need comprehensive update across entire codebase

**Root Cause:**
Google Fonts are typically imported in a global CSS file and then referenced throughout the application in various CSS files and sometimes JavaScript. Changing fonts requires updating the import URL and all font-family declarations.

**Solution:**
Update the Google Fonts import URL and replace all font-family references throughout the codebase.

**Code Pattern:**
```css
/* ❌ Old font import */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&display=swap');

/* ✅ New font import */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');

/* Update global font declaration */
* {
    font-family: 'Roboto', sans-serif !important;
}

body {
    font-family: 'Roboto', sans-serif;
}
```

```javascript
// Update JavaScript text measurement functions
// ❌ Old
context.font = `${fontSize}px Orbitron, sans-serif`;

// ✅ New
context.font = `${fontSize}px Roboto, sans-serif`;
```

**Key Points:**
- Update Google Fonts import URL with correct font weights
- Search for all occurrences of old font name in CSS files
- Check JavaScript files for canvas text measurements using the font
- Use global CSS rule with !important to ensure consistency
- Include appropriate font weights in import (300, 400, 500, 700, 900)
- Test that new font loads correctly and displays as expected

**Applicable To:**
- Language: CSS, JavaScript
- Frameworks: Any web application using Google Fonts
- Use Cases: Rebranding, improving readability, changing design aesthetics

### Code Architecture: React Component Refactoring to Eliminate Duplication

**Symptoms:**
- Multiple platform page components (YouTubePage, TikTokPage, InstagramPage) with nearly identical code
- Only difference between components is a single platform prop
- Repetitive routing logic in App.jsx with duplicate route handlers
- Platform-specific logic scattered across multiple files
- Duplicate column configurations for identical table structures

**Root Cause:**
Platform-specific components were created separately without recognizing the shared patterns. Each platform page was essentially a wrapper around the same TableContainer component with different props, leading to significant code duplication and maintenance overhead.

**Solution:**
Create a generic PlatformPage component and centralize platform configuration while maintaining individual platform files for future extensibility.

**Code Pattern:**
```javascript
// ✅ Generic reusable platform page component
const PlatformPage = ({ 
    videosData, 
    usersData, 
    userVideosData, 
    isLoading, 
    platform,
    onSearch, 
    onClearData 
}) => {
    return (
        <div className="platform-page">
            <TableContainer 
                videosData={videosData} 
                usersData={usersData} 
                userVideosData={userVideosData}
                isLoading={isLoading} 
                platform={platform}
                onSearch={onSearch}
                onClearData={onClearData}
            />
        </div>
    );
};

// ✅ Platform-specific pages become simple wrappers
const YouTubePage = (props) => {
    return <PlatformPage {...props} platform="youtube" />;
};

// ✅ Centralized platform configuration
export const PLATFORMS = {
    youtube: {
        id: 'youtube',
        name: 'YouTube',
        title: 'YouTube Analytics',
        path: '/youtube',
        columns: youtubeColumns
    },
    // ... other platforms
};

// ✅ Dynamic platform data initialization
const createInitialState = () => {
    const initialState = {};
    PLATFORM_LIST.forEach(platform => {
        initialState[platform.id] = {
            videosData: [],
            usersData: [],
            userVideosData: [],
            isLoading: false
        };
    });
    return initialState;
};

// ✅ Platform-aware table configuration
const getVideoColumns = () => {
    const platformConfig = PLATFORMS[platform];
    return platformConfig?.columns || videosColumns;
};
```

**Key Points:**
- Keep individual platform files as clean interfaces for future platform-specific features
- Centralize shared logic in reusable components and configuration files
- Use spread operator to pass props through wrapper components
- Create dynamic initial state based on platform configuration
- Extract platform-specific logic to configuration objects rather than switch statements
- Consolidate duplicate configurations (userVideosColumns can reference videosColumns)

**Applicable To:**
- Language: JavaScript/TypeScript
- Frameworks: React (pattern applies to Vue/Angular with modifications)
- Use Cases: Multi-platform applications, repeated component patterns, reducing maintenance overhead

---

### API Integration: Multi-Step API Flow Implementation

**Symptoms:**
- Need to make multiple API calls in sequence where second call depends on first
- HTTP 204 (No Content) responses failing JSON parsing
- Complex data flow requiring intermediate data extraction
- User sees no results despite API calls succeeding

**Root Cause:**
Some API operations require multiple steps where data from one endpoint is needed for subsequent calls. Additionally, APIs may return 204 status codes for valid "no data" responses, which cannot be parsed as JSON and will throw errors if attempted.

**Solution:**
Implement sequential API calls with proper error handling and 204 response management.

**Code Pattern:**
```javascript
// Multi-step API flow pattern
async function searchUserContent(username) {
    try {
        // Step 1: Get initial data
        console.log(`Step 1: Getting user info for ${username}...`);
        const userResponse = await getUserInfo(username);
        
        if (!userResponse.data || !userResponse.data.user) {
            throw new Error(`User '${username}' not found`);
        }
        
        // Extract intermediate data
        const userId = userResponse.data.user.id;
        if (!userId) {
            throw new Error(`Could not get ID for user '${username}'`);
        }
        
        // Step 2: Use extracted data for second call
        console.log(`Step 2: Getting content for user ID ${userId}...`);
        const contentResponse = await getUserContent(userId);
        
        // Step 3: Process and return final data
        return extractContentData(contentResponse);
        
    } catch (error) {
        console.error('Error in multi-step flow:', error);
        throw error;
    }
}

// Handle 204 No Content responses
async function apiCall(url, options) {
    const response = await fetch(url, options);
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    // Handle 204 No Content - return empty structure
    if (response.status === 204) {
        console.log('No content available (204 response)');
        return { data: { items: [] } }; // Return expected empty structure
    }
    
    return await response.json();
}

// Platform-specific implementation example
class PlatformSearchStrategy {
    async search(query, context = {}) {
        const { activeTab } = context;
        
        // Route to appropriate multi-step flow
        if (activeTab === 'userContent') {
            return await this.searchUserContent(query);
        }
        
        // Single-step flow for other tabs
        return await this.searchGeneral(query);
    }
}
```

**Key Points:**
- Always check intermediate response structure before accessing nested properties
- Handle 204 responses by returning empty data structures matching expected format
- Use descriptive console logs to track multi-step flow progress
- Extract only necessary data between steps to minimize coupling
- Throw descriptive errors at each step for better debugging
- Consider rate limiting between sequential API calls if needed

**Applicable To:**
- Language: JavaScript/TypeScript
- Frameworks: Any JavaScript application making API calls
- Use Cases: OAuth flows, user profile lookups, content aggregation requiring user IDs

---

### React: Platform-Specific UI Components

**Symptoms:**
- Need different UI elements for different platforms/sections
- Components should only appear on specific pages
- Passing platform context through multiple component layers
- UI inconsistency between platform pages

**Root Cause:**
Multi-platform applications need platform-aware components that show different UI elements based on context. Without proper platform detection and conditional rendering, all platforms show the same UI elements.

**Solution:**
Implement platform-aware components with conditional rendering based on platform prop.

**Code Pattern:**
```javascript
// Platform-aware component pattern
const NavigationTabs = ({ activeTab, onTabChange, platform = 'default' }) => {
    const getTabsForPlatform = (platform) => {
        const baseTabs = [
            { id: 'videos', label: 'Videos', icon: '🎬' },
            { id: 'channels', label: 'Channels', icon: '📺' }
        ];

        // Platform-specific tabs
        if (platform === 'social') {
            return [
                ...baseTabs,
                { id: 'stories', label: 'Stories', icon: '📱' },
                { id: 'users', label: 'Users', icon: '👥' }
            ];
        }

        return [
            ...baseTabs,
            { id: 'analytics', label: 'Analytics', icon: '📊' }
        ];
    };

    const tabs = getTabsForPlatform(platform);

    return (
        <div className="tabs-container">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

// Pass platform prop through component hierarchy
const ParentComponent = ({ platform, data }) => {
    return (
        <Container>
            <NavigationTabs platform={platform} />
            <DataTable platform={platform} data={data} />
        </Container>
    );
};
```

**Key Points:**
- Define platform-specific configurations in functions or objects
- Use platform prop consistently throughout component tree
- Keep base/shared elements separate from platform-specific ones
- Consider using context API for deeply nested platform props
- Test each platform configuration thoroughly
- Document which features are platform-specific

**Applicable To:**
- Language: JavaScript/TypeScript
- Frameworks: React (adaptable to Vue/Angular)
- Use Cases: Multi-platform dashboards, white-label applications, feature flags

---

### API Integration: Client-Side CORS Bypass with Vite Development Proxy

**Symptoms:**
- API works externally but fails in browser with CORS error
- Error: `Access-Control-Allow-Origin header contains multiple values '*, *'`
- Server returns malformed CORS headers but API endpoint is functional
- Same request works in Postman/curl but fails in frontend application

**Root Cause:**
External API servers sometimes have misconfigured CORS headers that browsers reject. The API itself is functional, but the browser's same-origin policy blocks direct requests due to malformed headers like multiple `*` values in `Access-Control-Allow-Origin`.

**Solution:**
Configure Vite development proxy to route API requests through the dev server, completely bypassing CORS restrictions during development.

**Code Pattern:**
```javascript
// vite.config.js - Development proxy configuration
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/[service]': {
        target: 'https://external-api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/[service]/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Add required headers to proxied request
            proxyReq.setHeader('x-api-host', 'external-api.example.com');
            console.log('[Vite Proxy] Proxying request:', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes) => {
            console.log('[Vite Proxy] Response status:', proxyRes.statusCode);
          });
        }
      }
    }
  }
})

// API client - Update to use local proxy path
const BASE_URL = `/api/[service]`; // Vite proxy routes to external API

// Remove problematic headers (proxy will add them)
const options = {
    method: 'GET',
    headers: {
        'x-api-key': apiKey
        // x-api-host header added by Vite proxy
    }
};
```

**Key Points:**
- Proxy only works in development - plan production CORS solution separately
- Use `changeOrigin: true` to avoid host header issues
- Remove headers from client requests that proxy will add automatically
- Add debug logging to proxy events for troubleshooting
- Test that proxy correctly forwards requests and responses
- Consider rate limiting if API has strict limits

**Applicable To:**
- Language: JavaScript/TypeScript
- Frameworks: Vite + React (similar patterns for Webpack/other bundlers)
- Use Cases: Third-party APIs with broken CORS, development environment API testing

---

### State Management: Session-Based API Key Storage with React Context

**Symptoms:**
- API keys stored in settings but not accessible to API functions
- "API key not found" errors despite user configuring keys in settings
- API functions can't decrypt stored settings without password
- Need secure key storage without external authentication services

**Root Cause:**
Encrypted localStorage requires a password for decryption, but API functions don't have access to the user's password. The settings page encrypts/decrypts keys locally, but this doesn't make them available to other components during the session.

**Solution:**
Implement React Context to store decrypted API keys in memory during the user session, combined with an API key manager that checks context first before falling back to environment variables.

**Code Pattern:**
```javascript
// contexts/ApiKeyContext.jsx - Session storage for decrypted keys
const ApiKeyContext = createContext({
    setApiKeys: () => {},
    getApiKey: () => null,
    clearApiKeys: () => {}
});

export const ApiKeyProvider = ({ children }) => {
    const [apiKeys, setApiKeysState] = useState({});

    const setApiKeys = (keys) => {
        console.log('[API Key Context] Setting API keys');
        setApiKeysState(keys);
    };

    const getApiKey = (keyName) => {
        const key = apiKeys[keyName];
        console.log('[API Key Context] Getting key:', { keyName, hasKey: !!key });
        return key || null;
    };

    const clearApiKeys = () => {
        setApiKeysState({});
    };

    return (
        <ApiKeyContext.Provider value={{ setApiKeys, getApiKey, clearApiKeys }}>
            {children}
        </ApiKeyContext.Provider>
    );
};

// utils/apiKeyManager.js - Context-aware key retrieval
let getApiKeyFromContext = null;

export function setApiKeyContextGetter(contextGetter) {
    getApiKeyFromContext = contextGetter;
}

export async function getApiKey(keyName, envVar) {
    // Priority 1: Check memory context (current session)
    if (getApiKeyFromContext) {
        const contextKey = getApiKeyFromContext(keyName);
        if (contextKey) {
            console.log(`[API Key Manager] Found key in context: ${keyName}`);
            return contextKey;
        }
    }
    
    // Priority 2: Fall back to environment variable
    const envValue = import.meta.env[envVar];
    if (envValue) {
        console.log(`[API Key Manager] Using environment variable: ${envVar}`);
        return envValue;
    }
    
    return null;
}

// App.jsx - Connect context to API manager
function AppContent() {
    const { getApiKey } = useApiKeys();

    useEffect(() => {
        setApiKeyContextGetter(getApiKey);
    }, [getApiKey]);

    return <YourAppContent />;
}

function App() {
    return (
        <ApiKeyProvider>
            <Router>
                <AppContent />
            </Router>
        </ApiKeyProvider>
    );
}

// Settings page - Store keys in context after load/save
const handleLoad = async () => {
    try {
        const decrypted = await decryptData(stored, password);
        setApiKeys(decrypted); // Local state
        setContextApiKeys(decrypted); // Context for session use
        showMessage('Settings loaded successfully!', 'success');
    } catch (error) {
        showMessage('Failed to load settings: ' + error.message, 'error');
    }
};
```

**Key Points:**
- Context stores keys only in memory - they don't persist between sessions
- User must load settings each session to populate context
- API functions get keys immediately without needing passwords
- Maintains security by not persisting decrypted keys
- Falls back to environment variables for development/testing
- Clear context when user logs out or clears settings

**Applicable To:**
- Language: JavaScript/TypeScript
- Frameworks: React (adaptable to Vue/Angular state management)
- Use Cases: Session-based secure configuration, API key management without backend

---

### Data Transformation: Robust API Response Mapping with Fallback Patterns

**Symptoms:**
- API returns different data structures than expected
- Fields missing or in different nested locations
- "Cannot read property of undefined" errors when accessing response data
- Need to map external API data to internal table format

**Root Cause:**
External APIs often have inconsistent response structures, optional fields, or nested data in unexpected locations. Direct property access fails when the expected structure doesn't match the actual response.

**Solution:**
Implement robust data mapping with multiple fallback paths and comprehensive field extraction utilities.

**Code Pattern:**
```javascript
// Robust field extraction with multiple fallback paths
function extractField(obj, paths, defaultValue = null) {
    for (const path of paths) {
        try {
            const value = path.split('.').reduce((current, key) => current?.[key], obj);
            if (value !== undefined && value !== null && value !== '') {
                console.log(`Found field at path '${path}':`, value);
                return value;
            }
        } catch (error) {
            console.log(`Failed to extract path '${path}':`, error.message);
        }
    }
    
    console.log(`Field not found in any path ${JSON.stringify(paths)}, using default:`, defaultValue);
    return defaultValue;
}

// Numeric field extraction with parsing
function extractNumericField(obj, paths, defaultValue = 0) {
    const value = extractField(obj, paths, defaultValue);
    
    if (typeof value === 'number') {
        return Math.max(0, Math.floor(value));
    }
    
    if (typeof value === 'string') {
        const parsed = parseInt(value.replace(/[^0-9]/g, ''), 10);
        return isNaN(parsed) ? defaultValue : Math.max(0, parsed);
    }
    
    return defaultValue;
}

// Main data extraction function with structure detection
export function extractUserPostsData(apiResponse) {
    console.log('[Data Mapper] Starting extraction');
    
    if (!apiResponse) {
        console.error('[Data Mapper] No API response provided');
        return [];
    }

    // Handle multiple possible response structures
    let itemsArray = null;
    
    if (Array.isArray(apiResponse)) {
        itemsArray = apiResponse;
    } else if (apiResponse.data) {
        if (Array.isArray(apiResponse.data)) {
            itemsArray = apiResponse.data;
        } else if (apiResponse.data.items && Array.isArray(apiResponse.data.items)) {
            itemsArray = apiResponse.data.items;
        } else {
            // Log structure for debugging
            console.log('[Data Mapper] Data object structure:', {
                dataType: typeof apiResponse.data,
                dataKeys: Object.keys(apiResponse.data),
                sampleData: apiResponse.data
            });
            itemsArray = [apiResponse.data]; // Treat as single item
        }
    } else {
        console.error('[Data Mapper] Unknown response structure:', Object.keys(apiResponse));
        return [];
    }

    return itemsArray.map((item, index) => {
        try {
            // Extract with multiple fallback paths
            const username = extractField(item, ['user.username', 'owner.username', 'username'], 'Unknown');
            const followers = extractNumericField(item, ['user.follower_count', 'follower_count'], 0);
            const title = extractField(item, ['caption.text', 'caption', 'description'], 'No caption');
            const likes = extractNumericField(item, ['like_count', 'likes'], 0);
            const shares = extractNumericField(item, ['reshare_count', 'share_count'], 0);
            
            // Generate URL from code field
            let url = extractField(item, ['permalink', 'url']);
            if (!url) {
                const code = extractField(item, ['code', 'shortcode']);
                if (code) {
                    url = `https://platform.com/p/${code}/`;
                }
            }

            return {
                username,
                followers,
                title: truncateText(title, 100),
                likes,
                shares,
                url: url || 'https://platform.com/'
            };

        } catch (error) {
            console.error(`[Data Mapper] Error processing item ${index + 1}:`, error);
            return {
                username: 'Error',
                followers: 0,
                title: 'Error processing item',
                likes: 0,
                shares: 0,
                url: 'https://platform.com/'
            };
        }
    });
}
```

**Key Points:**
- Always provide multiple fallback paths for each field
- Use optional chaining (`?.`) and array fallbacks for robust extraction
- Log structure information when unexpected formats are encountered
- Return sensible defaults rather than throwing errors
- Handle both array and object response structures
- Parse numeric strings by removing non-digit characters
- Include comprehensive error handling for each item

**Applicable To:**
- Language: JavaScript/TypeScript
- Frameworks: Any application consuming external APIs
- Use Cases: API integration, data normalization, third-party service integration

---

### API Integration: Environment Variable Standardization Pattern

**Symptoms:**
- Different API endpoints using different environment variable names for the same key
- "API key not found" despite key being configured
- Inconsistent naming patterns across platform integrations
- Same RapidAPI key referenced by multiple variable names

**Root Cause:**
When multiple API endpoints share the same API key (like RapidAPI), using different environment variable names creates configuration confusion and failures when the expected variable name doesn't exist.

**Solution:**
Standardize environment variable names across platforms that share the same API service, ensuring consistency and reducing configuration complexity.

**Code Pattern:**
```javascript
// ❌ Inconsistent naming - each platform uses different env var
// TikTok API
return await getApiKey('rapidApiKey', 'VITE_TIKTOK_RAPIDAPI_KEY');

// Instagram API  
return await getApiKey('rapidApiKey', 'VITE_INSTAGRAM_RAPIDAPI_KEY');

// ✅ Standardized naming - both use same env var
// TikTok API
return await getApiKey('rapidApiKey', 'VITE_RAPIDAPI_KEY');

// Instagram API
return await getApiKey('rapidApiKey', 'VITE_RAPIDAPI_KEY');

// .env file - Single variable for shared service
VITE_YOUTUBE_API_KEY=your_youtube_key_here
VITE_RAPIDAPI_KEY=your_rapidapi_key_here  // Used by both TikTok and Instagram

// API service factory pattern for shared keys
class APIKeyManager {
    static getSharedKey(service) {
        const keyMap = {
            'rapidapi': 'VITE_RAPIDAPI_KEY',
            'youtube': 'VITE_YOUTUBE_API_KEY',
            'twitter': 'VITE_TWITTER_API_KEY'
        };
        
        return import.meta.env[keyMap[service]];
    }
}

// Usage in platform APIs
async function getRapidApiKey() {
    return APIKeyManager.getSharedKey('rapidapi');
}
```

**Key Points:**
- Use descriptive but generic names for shared API services
- Group related platforms under the same service key when they share credentials
- Update all platform APIs simultaneously when changing variable names  
- Document which platforms share which API keys
- Test that all affected platforms work after standardization
- Consider backwards compatibility during transition periods

**Applicable To:**
- Language: JavaScript/TypeScript
- Frameworks: Any application using environment variables for API keys
- Use Cases: Multi-platform API integration, shared service credentials, configuration management

---

### API Integration: Tab Name to API Functionality Mapping

**Symptoms:**

- Tab functionality working previously but broken after UI changes
- Error: "Cannot read properties of undefined (reading 'author')"
- API calls succeeding but data extraction failing
- User clicks "User Videos" tab but no data appears despite successful API responses

**Root Cause:**
When UI tab names are changed or replaced (e.g., "User Posts" → "User Videos"), the backend routing logic may not be updated to handle the new tab names. The search strategy checks for specific tab names (`activeTab === 'userPosts'`) but the UI now sends different tab names (`activeTab === 'userVideos'`), causing the request to route to the wrong API flow.

**Solution:**
Update search strategy routing to handle both old and new tab names, ensuring UI changes don't break existing API functionality.

**Code Pattern:**

```javascript
// ❌ Wrong - Only handles old tab name
class PlatformSearchStrategy {
    async search(query, context = {}) {
        const { activeTab } = context;
        
        if (activeTab === 'userPosts') {  // UI no longer sends this
            return await this.searchUserPosts(query);
        }
        
        return await this.searchGeneral(query);
    }
}

// ✅ Correct - Handle both old and new tab names
class PlatformSearchStrategy {
    async search(query, context = {}) {
        const { activeTab } = context;
        
        // Handle both old and new tab names for same functionality
        if (activeTab === 'userVideos' || activeTab === 'userPosts') {
            return await this.searchUserPosts(query);
        }
        
        return await this.searchGeneral(query);
    }
}

// Error handling should also be updated
const useSearch = (platformData) => {
    const createSearchHandler = useCallback((platform, activeTab = 'videos') => {
        return async (query) => {
            try {
                // ... API call logic
            } catch (error) {
                // Handle both tab names in error messages
                if (activeTab === 'userPosts' || activeTab === 'userVideos') {
                    const tabName = activeTab === 'userVideos' ? 'User Videos' : 'User Posts';
                    alert(`${tabName} Error: ${error.message}`);
                }
            }
        };
    }, []);
};

// Data mapping should handle different response structures
export function extractVideoData(apiResponse) {
    return apiResponse.data.map(dataItem => {
        const item = dataItem.item;  // General search structure
        
        if (!item) {
            return null;  // Skip invalid items
        }
        
        return {
            username: item.author?.uniqueId || 'Unknown',
            // ... other fields
        };
    }).filter(item => item !== null);
}

export function extractUserPostsData(apiResponse) {
    return apiResponse.data.itemList.map(item => {  // User posts structure
        return {
            username: item.author?.uniqueId || 'Unknown',
            // ... other fields with fallback to stats if statsV2 missing
            views: parseInt(item.statsV2?.playCount) || parseInt(item.stats?.playCount) || 0,
        };
    });
}
```

**Key Points:**

- Always check for both old and new tab names when refactoring UI
- Use separate data extraction functions for different API response structures
- Update error handling to recognize both tab names
- Verify that API routing logic matches current UI tab names
- Test that previously working functionality still works after UI changes
- Consider creating a mapping object for tab name aliases

**Applicable To:**

- Language: JavaScript/TypeScript
- Frameworks: React, Vue, Angular (any frontend with backend API routing)
- Use Cases: UI refactoring, tab name changes, maintaining backward compatibility

---

## Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: CSS3 with cyberpunk theme
- **Database**: SQLite (schema defined)
- **APIs**: YouTube Data API v3, TikTok RapidAPI, Instagram Graph API
- **State Management**: React useState/useEffect

## Project Structure

```text
socialgirl-app/
├── src/
│   ├── apis/           # API integration modules
│   ├── components/     # Reusable React components
│   ├── mappers/        # Data transformation utilities
│   ├── pages/          # Platform-specific page components
│   ├── styles/         # CSS styling files
│   └── utils/          # Helper functions
└── database/
    └── schema.sql      # SQLite database schema
```

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and add your API keys
3. Start development server: `npm run dev`
4. Visit `http://localhost:5173`

## API Keys Required

- `VITE_YOUTUBE_API_KEY`: YouTube Data API v3 key
- `VITE_RAPIDAPI_KEY`: RapidAPI key (shared for TikTok and Instagram)

Note: API keys can be configured through the Settings page in the application for secure, encrypted storage.
