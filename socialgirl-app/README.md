# KenTab - Content Analytics Dashboard

A modern, cyberpunk-themed content analytics dashboard built with React and Vite. This web application provides a sleek interface for tracking social media analytics across YouTube, Instagram, and TikTok.

## Features

- 🚀 Built with React 18 and Vite for lightning-fast development
- 🎨 Cyberpunk-inspired UI with neon effects and animations
- 📊 Sortable data tables with animated statistics
- 🔍 Real-time search functionality
- 📱 Fully responsive design
- ⚡ Fast page transitions with React Router

## Tech Stack

- React 18
- Vite
- React Router DOM
- Axios (for API calls)
- Custom CSS with modern animations

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
socialgirl-app/
├── public/
├── src/
│   ├── components/       # React components
│   ├── styles/          # CSS files
│   ├── utils/           # Utility functions
│   ├── data/            # Mock data
│   ├── App.jsx          # Main App component
│   └── main.jsx         # Entry point
├── package.json
└── vite.config.js
```

## Code Architecture: React State Management Refactoring

**Symptoms:**
- Main App component managing 9+ separate state variables
- Code duplication across multiple search handlers
- Tight coupling between routing and business logic
- Difficulty adding new platforms without modifying core App component
- State management violations (single responsibility principle)

**Root Cause:**
React applications often start with simple useState hooks in the main component, but as complexity grows, this leads to "prop drilling," code duplication, and violation of separation of concerns. Multiple similar handlers indicate missing abstraction layers.

**Solution:**
Extract state management into custom hooks and implement strategy pattern for platform-specific operations.

**Code Pattern:**
```javascript
// ❌ Wrong - Multiple states in main component
function App() {
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [instagramVideos, setInstagramVideos] = useState([]);
  const [instagramLoading, setInstagramLoading] = useState(false);
  // ... more duplicate states
  
  const handleYouTubeSearch = async (query) => {
    setYoutubeLoading(true);
    try {
      // YouTube-specific logic
    } finally {
      setYoutubeLoading(false);
    }
  };
  
  const handleInstagramSearch = async (query) => {
    setInstagramLoading(true);
    try {
      // Instagram-specific logic (nearly identical)
    } finally {
      setInstagramLoading(false);
    }
  };
  // ... more duplicate handlers
}

// ✅ Correct - Extracted state management
// hooks/usePlatformData.js
const usePlatformData = () => {
  const [platformData, setPlatformData] = useState({
    youtube: { videosData: [], usersData: [], isLoading: false },
    instagram: { videosData: [], usersData: [], isLoading: false },
    tiktok: { videosData: [], usersData: [], isLoading: false }
  });
  
  const updatePlatformData = (platform, updates) => {
    setPlatformData(prev => ({
      ...prev,
      [platform]: { ...prev[platform], ...updates }
    }));
  };
  
  return { platformData, updatePlatformData, getPlatformData };
};

// services/searchService.js - Strategy pattern
class SearchService {
  constructor() {
    this.strategies = {
      youtube: new YouTubeSearchStrategy(),
      instagram: new InstagramSearchStrategy(),
      tiktok: new TikTokSearchStrategy()
    };
  }
  
  async search(platform, query) {
    const strategy = this.strategies[platform];
    return await strategy.search(query);
  }
}

// hooks/useSearch.js - Unified search logic
const useSearch = (platformData) => {
  const createSearchHandler = useCallback((platform) => {
    return async (query) => {
      platformData.setLoading(platform, true);
      try {
        const results = await searchService.search(platform, query);
        platformData.setVideosData(platform, results);
      } catch (error) {
        console.error(`${platform} search error:`, error);
      } finally {
        platformData.setLoading(platform, false);
      }
    };
  }, [platformData]);
  
  return {
    handleYouTubeSearch: createSearchHandler('youtube'),
    handleInstagramSearch: createSearchHandler('instagram'),
    handleTikTokSearch: createSearchHandler('tiktok')
  };
};

// App.jsx - Clean and focused
function App() {
  const platformData = usePlatformData();
  const { handleYouTubeSearch, handleInstagramSearch, handleTikTokSearch } = useSearch(platformData);
  
  return (
    <Router>
      <Routes>
        <Route path="/youtube" element={
          <YouTubePage 
            {...platformData.getPlatformData('youtube')}
            onSearch={handleYouTubeSearch}
          />
        } />
        {/* Adding new platforms requires zero changes to App.jsx */}
      </Routes>
    </Router>
  );
}
```

**Key Points:**
- Extract state management into custom hooks when managing 3+ related states
- Use strategy pattern to eliminate code duplication across similar handlers
- Keep main App component focused on routing and composition
- Platform data should be managed centrally, not scattered across components
- Adding new platforms should require zero changes to existing code

**Applicable To:**
- Language: JavaScript/TypeScript
- Frameworks: React
- Use Cases: Any multi-platform or multi-entity state management in React applications

---

## API Management: Multi-Platform Quota Tracking System

**Symptoms:**
- API quota exceeded errors across different platforms
- No visibility into API usage patterns
- Different quota limits and reset periods per platform (YouTube: daily, TikTok/Instagram: monthly)
- Manual tracking of API costs and limits
- Inability to prevent quota overages before they happen

**Root Cause:**
Modern applications often integrate multiple APIs with different quota systems. Without centralized tracking, it's impossible to monitor usage, predict overages, or implement preventive measures. Each API has different cost structures and reset periods.

**Solution:**
Implement a centralized quota management system that tracks usage per platform with different time periods and cost structures.

**Code Pattern:**
```javascript
// utils/quotaManager.js - Centralized quota tracking
const PLATFORM_CONFIGS = {
  youtube: {
    limit: 10000,
    period: 'daily',
    operations: { search: 100, videos: 1, channels: 1 }
  },
  tiktok: {
    limit: 200000,
    period: 'monthly',
    operations: { request: 1 }
  },
  instagram: {
    limit: 15000,
    period: 'monthly',
    operations: { request: 1 }
  }
};

export function trackOperation(platform, operation, count = 1) {
  const config = PLATFORM_CONFIGS[platform];
  const cost = (config.operations[operation] || 1) * count;
  
  // Get stored data for current period
  const currentPeriod = getPeriodKey(platform);
  const stored = getStoredQuotaData();
  
  // Update usage
  stored[platform][currentPeriod].used += cost;
  stored[platform][currentPeriod].operations.push({
    operation, count, cost, timestamp: new Date().toISOString()
  });
  
  localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(stored));
  return stored[platform][currentPeriod];
}

export function canPerformOperation(platform, operation, count = 1) {
  const config = PLATFORM_CONFIGS[platform];
  const quotaData = getQuotaUsage(platform);
  const cost = (config.operations[operation] || 1) * count;
  
  return (quotaData.used + cost) <= config.limit;
}

// API integration with quota checking
async function searchYouTubeVideos(query) {
  if (!canPerformOperation('youtube', 'search')) {
    throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
  }
  
  const response = await fetch(youtubeSearchURL);
  if (response.ok) {
    trackOperation('youtube', 'search');
    return response.json();
  }
}

// Settings page quota dashboard
function QuotaDashboard() {
  const [quotaStatus, setQuotaStatus] = useState({});
  
  useEffect(() => {
    setQuotaStatus(getAllQuotaStatus());
  }, []);
  
  return (
    <div className="quota-dashboard">
      {Object.entries(quotaStatus).map(([platform, status]) => (
        <div key={platform} className="quota-card">
          <h4>{platform.toUpperCase()}</h4>
          <span>{status.period}</span>
          <div className="quota-progress">
            <div style={{ width: `${status.percentage}%` }} />
          </div>
          <span>{status.used} / {status.total} units</span>
        </div>
      ))}
    </div>
  );
}
```

**Key Points:**
- Support different quota periods (daily/monthly) per platform
- Track operation costs specific to each API's pricing structure
- Implement quota checking before API calls to prevent overages
- Provide visual dashboard for monitoring usage across all platforms
- Store quota data in localStorage with automatic period-based resets

**Applicable To:**
- Language: JavaScript/TypeScript
- Frameworks: Any (React example shown)
- Use Cases: Applications integrating multiple APIs with different quota systems

---

## CSS Layout: Preventing Layout Shifts in Multi-Page Applications

**Symptoms:**
- Content "jumps" or shifts when navigating between pages
- Inconsistent page widths causing horizontal scrolling
- Container sizing differences between pages
- Flickering or reflow during page transitions

**Root Cause:**
Different pages using inconsistent container structures, styling approaches, or content overflow patterns. Layout shifts occur when pages have different content widths, container constraints, or CSS box-sizing behaviors.

**Solution:**
Ensure identical DOM structure depth and container behavior across all pages. Remove styling differences at the container level.

**Code Pattern:**
```javascript
// ❌ Wrong - Inconsistent container structures
// Page 1: platform-page -> table-container -> content
// Page 2: platform-page -> settings-container (with background/border) -> content

// Page 1 (YouTube/TikTok/Instagram)
function YouTubePage() {
  return (
    <div className="platform-page">
      <div className="table-container">  {/* No styling */}
        <TableComponent />
      </div>
    </div>
  );
}

// Page 2 (Settings - WRONG)
function SettingsPage() {
  return (
    <div className="platform-page">
      <div className="settings-container">  {/* Has background/border/padding */}
        <SettingsGrid />
      </div>
    </div>
  );
}

// ✅ Correct - Identical container behavior
// All pages: platform-page -> content-container -> content

// Page 1 (YouTube/TikTok/Instagram)
function YouTubePage() {
  return (
    <div className="platform-page">
      <div className="table-container">  {/* Plain container */}
        <TableComponent />
      </div>
    </div>
  );
}

// Page 2 (Settings - FIXED)
function SettingsPage() {
  return (
    <div className="platform-page">
      <div className="settings-grid">  {/* Plain container, same level */}
        <div className="settings-section"> {/* Styling moved to content level */}
          <SettingsContent />
        </div>
      </div>
    </div>
  );
}

// CSS - Ensure consistent container behavior
.platform-page {
  /* No specific styling - just a wrapper */
}

.table-container,
.settings-grid {
  /* No background, border, or padding at container level */
  margin: 0;
  box-sizing: border-box;
  min-width: 0; /* Prevent content overflow */
}

.settings-section,
.table-section {
  /* Visual styling only at content level */
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 24px;
  box-sizing: border-box;
  min-width: 0;
}

// Grid layouts - prevent overflow
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.settings-left-column,
.settings-right-column {
  min-width: 0; /* Critical: prevents grid overflow */
}
```

**Key Points:**
- Keep container structure identical across all pages (same DOM depth)
- Apply visual styling (background, border, padding) only at content level, not container level
- Use `min-width: 0` on grid columns and flex items to prevent content overflow
- Ensure `box-sizing: border-box` on all containers and content elements
- Remove any styling differences between equivalent containers across pages

**Applicable To:**
- Language: CSS/JavaScript
- Frameworks: Any (especially React with React Router)
- Use Cases: Multi-page applications with consistent navigation and layout requirements

## Features in Development

- API integration for real social media data
- User authentication
- Advanced filtering options
- Data export functionality
- Dark/Light theme toggle

## CSS Styling: Component-Specific Style Conflicts

**Symptoms:**
- Buttons appearing with different sizes despite using same CSS classes
- Global styles being overridden by component-specific styles
- Inconsistent UI elements across different pages/components
- CSS classes not producing expected results

**Root Cause:**
Component-specific CSS files may contain style overrides that increase specificity and override global design system styles. This commonly happens when developers add "quick fixes" to component CSS files that unintentionally override carefully designed global styles.

**Solution:**
Identify and remove component-specific style overrides that conflict with global design system classes.

**Code Pattern:**
```css
/* ❌ Wrong - Component CSS overriding global styles */
/* TableContainer.css */
.table-actions .aurora-btn-sm {
    padding: 8px 16px;  /* Overrides global: 4px 12px */
    font-size: 14px;    /* Overrides global: 12px */
}

/* ✅ Correct - Remove conflicting overrides */
/* TableContainer.css */
.table-actions {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-left: auto;
}
/* Let aurora-btn-sm use its global definition */

/* Global styles (globals.css) - Design system definition */
.aurora-btn-sm {
    padding: 4px 12px;
    font-size: 12px;
}
```

**Debugging Steps:**
1. Inspect element in browser DevTools
2. Check "Computed" styles to see final values
3. Look for crossed-out styles indicating overrides
4. Search for the class name in component-specific CSS files
5. Remove or comment out conflicting rules

**Key Points:**
- Global design system classes should not be overridden in component CSS
- Use browser DevTools to identify style conflicts and specificity issues
- Component CSS should only contain layout and component-specific styles
- When buttons/elements don't match despite same classes, check for overrides
- Higher specificity selectors (e.g., `.parent .child`) override single classes

**Applicable To:**
- Language: CSS/SCSS
- Frameworks: Any (React, Vue, Angular)
- Use Cases: Design system implementation, consistent UI styling, CSS debugging

---

## License

This project is licensed under the MIT License.
