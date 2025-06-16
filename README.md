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
- `VITE_TIKTOK_RAPIDAPI_KEY`: RapidAPI key for TikTok endpoints
- `VITE_INSTAGRAM_ACCESS_TOKEN`: Instagram Graph API token (when implemented)