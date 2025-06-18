# Aurora Button System Documentation

## Overview
The Aurora button system provides a comprehensive set of button styles that align with the Aurora theme design language. All buttons feature consistent hover effects, shimmer animations, and responsive behavior.

## Base Classes

### Primary Button Classes
- `.aurora-btn` - Base button class (required)
- `.aurora-btn-primary` - Cyan gradient button
- `.aurora-btn-secondary` - Purple gradient button
- `.aurora-btn-success` - Green gradient button
- `.aurora-btn-danger` - Red-pink gradient button
- `.aurora-btn-surface` - Surface gradient button
- `.aurora-btn-subtle` - Subtle background with border

### Ghost Button Variants
- `.aurora-btn-ghost` - Transparent with cyan border
- `.aurora-btn-ghost-secondary` - Transparent with purple border
- `.aurora-btn-ghost-danger` - Transparent with red border

### Size Modifiers
- `.aurora-btn-sm` - Small button (12px font, 4px 12px padding)
- Default - Normal size (14px font, 8px 16px padding)
- `.aurora-btn-lg` - Large button (16px font, 12px 24px padding)

### State Classes
- `:disabled` or `.disabled` - Disabled state (50% opacity, no hover effects)
- `.loading` - Shows loading spinner, hides text
- `:focus-visible` - Accessibility focus indicator

### Layout Modifiers
- `.aurora-btn-block` - Full width button
- `.aurora-btn-icon` - Button with icon support
- `.aurora-btn-icon-only` - Icon-only button (square padding)

## Button Groups
Use the `ButtonGroup` component or `.aurora-btn-group` class:

```jsx
import ButtonGroup from './components/ButtonGroup';

<ButtonGroup>
    <button className="aurora-btn aurora-btn-subtle">Option 1</button>
    <button className="aurora-btn aurora-btn-subtle">Option 2</button>
    <button className="aurora-btn aurora-btn-subtle">Option 3</button>
</ButtonGroup>
```

For vertical groups, add the `vertical` prop:
```jsx
<ButtonGroup vertical>
    <button className="aurora-btn aurora-btn-primary">Top</button>
    <button className="aurora-btn aurora-btn-secondary">Bottom</button>
</ButtonGroup>
```

## Usage Examples

### Basic Buttons
```jsx
<button className="aurora-btn aurora-btn-primary">Save Changes</button>
<button className="aurora-btn aurora-btn-secondary">Learn More</button>
<button className="aurora-btn aurora-btn-danger">Delete Item</button>
```

### Icon Buttons
```jsx
// Button with icon and text
<button className="aurora-btn aurora-btn-primary aurora-btn-icon">
    <span>🚀</span>
    Launch
</button>

// Icon-only button
<button className="aurora-btn aurora-btn-subtle aurora-btn-icon aurora-btn-icon-only aurora-btn-sm">
    ⚙️
</button>
```

### Loading State
```jsx
const [loading, setLoading] = useState(false);

<button 
    className={`aurora-btn aurora-btn-primary ${loading ? 'loading' : ''}`}
    onClick={handleSubmit}
>
    {loading ? 'Processing...' : 'Submit'}
</button>
```

### Disabled State
```jsx
<button className="aurora-btn aurora-btn-primary" disabled>
    Not Available
</button>
```

## Migration Guide

### From Old Button Classes
- `.btn-primary` → `.aurora-btn aurora-btn-primary`
- `.btn-secondary` → `.aurora-btn aurora-btn-surface`
- `.btn-danger` → `.aurora-btn aurora-btn-danger`
- `.pagination-btn` → `.aurora-btn aurora-btn-subtle aurora-btn-sm`
- `.toggle-btn` → `.aurora-btn aurora-btn-subtle aurora-btn-icon aurora-btn-icon-only aurora-btn-sm`

### Component Updates
1. Replace all button class names with Aurora button classes
2. Add appropriate size modifiers where needed
3. Use ButtonGroup component for grouped buttons
4. Add aria-labels to icon-only buttons for accessibility

## Accessibility Features
- Focus states with visible outlines
- Proper contrast ratios for all variants
- Support for keyboard navigation
- Loading states maintain button dimensions
- Disabled states are clearly indicated

## Performance Considerations
- All animations use CSS transforms for optimal performance
- Shimmer effects use GPU-accelerated properties
- Hover states are debounced with CSS transitions
- Loading spinners use CSS animations (no JavaScript)