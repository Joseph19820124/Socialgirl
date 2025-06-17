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

---

## Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: CSS3 with cyberpunk theme
- **Database**: SQLite (schema defined)
- **APIs**: YouTube Data API v3, TikTok RapidAPI, Instagram Graph API
- **State Management**: React useState/useEffect

## Project Structure

```
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
- `VITE_TIKTOK_RAPIDAPI_KEY`: RapidAPI key (shared for TikTok and Instagram)

Note: API keys can be configured through the Settings page in the application for secure, encrypted storage.