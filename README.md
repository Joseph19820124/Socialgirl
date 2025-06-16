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