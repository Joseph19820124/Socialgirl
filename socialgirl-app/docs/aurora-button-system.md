# Aurora Button Design System

## Overview

The Aurora Button System provides a consistent, themeable set of button styles that align with the Aurora theme's aesthetic of cyan, purple, and gradient effects. All buttons feature smooth animations, proper accessibility, and responsive design.

## Button Variants

### Primary (`.aurora-btn-primary`)
- **Usage**: Main calls-to-action, primary user actions
- **Appearance**: Cyan gradient background with glow effect on hover
- **Example**: "Save", "Submit", "Create"

### Secondary (`.aurora-btn-secondary`)
- **Usage**: Alternative actions, secondary importance
- **Appearance**: Purple gradient background with purple glow on hover
- **Example**: "Edit", "Update", "Configure"

### Success (`.aurora-btn-success`)
- **Usage**: Positive actions, confirmations
- **Appearance**: Green gradient background with green glow on hover
- **Example**: "Confirm", "Approve", "Complete"

### Danger (`.aurora-btn-danger`)
- **Usage**: Destructive actions, warnings
- **Appearance**: Red/pink gradient background with red glow on hover
- **Example**: "Delete", "Remove", "Cancel Subscription"

### Surface (`.aurora-btn-surface`)
- **Usage**: Standard actions on dark backgrounds
- **Appearance**: Subtle gradient with elevated shadow on hover
- **Example**: "View Details", "More Options"

### Ghost (`.aurora-btn-ghost`)
- **Usage**: Low-emphasis actions, toggles
- **Appearance**: Transparent with cyan border, fills on hover
- **Example**: "Skip", "Learn More"

### Ghost Secondary (`.aurora-btn-ghost-secondary`)
- **Usage**: Alternative ghost style with purple accent
- **Appearance**: Transparent with purple border

### Ghost Danger (`.aurora-btn-ghost-danger`)
- **Usage**: Destructive ghost actions
- **Appearance**: Transparent with red border

### Subtle (`.aurora-btn-subtle`)
- **Usage**: Minimal emphasis, background actions
- **Appearance**: Translucent background with subtle border
- **Example**: Pagination buttons, filters

## Button Sizes

### Small (`.aurora-btn-sm`)
```html
<button class="aurora-btn aurora-btn-primary aurora-btn-sm">Small</button>
```

### Default
```html
<button class="aurora-btn aurora-btn-primary">Default</button>
```

### Large (`.aurora-btn-lg`)
```html
<button class="aurora-btn aurora-btn-primary aurora-btn-lg">Large</button>
```

## Button States

### Disabled
```html
<button class="aurora-btn aurora-btn-primary" disabled>Disabled</button>
```

### Loading
```html
<button class="aurora-btn aurora-btn-primary loading">Loading...</button>
```

## Special Effects

### Pulse Animation (`.aurora-btn-pulse`)
Adds a pulsing glow effect for important CTAs:
```html
<button class="aurora-btn aurora-btn-primary aurora-btn-pulse">Get Started</button>
```

### Glow Animation (`.aurora-btn-glow`)
Adds an animated glow effect on hover:
```html
<button class="aurora-btn aurora-btn-primary aurora-btn-glow">Upgrade Now</button>
```

## Layout Modifiers

### Full Width (`.aurora-btn-block`)
```html
<button class="aurora-btn aurora-btn-primary aurora-btn-block">Full Width Button</button>
```

### Icon Buttons
```html
<!-- Button with icon and text -->
<button class="aurora-btn aurora-btn-primary aurora-btn-icon">
    <span>🚀</span>
    Launch
</button>

<!-- Icon-only button -->
<button class="aurora-btn aurora-btn-subtle aurora-btn-icon aurora-btn-icon-only">
    ⚙️
</button>
```

## Button Groups

### Horizontal Group
```html
<div class="aurora-btn-group">
    <button class="aurora-btn aurora-btn-subtle">Left</button>
    <button class="aurora-btn aurora-btn-subtle">Center</button>
    <button class="aurora-btn aurora-btn-subtle">Right</button>
</div>
```

### Vertical Group
```html
<div class="aurora-btn-group aurora-btn-group-vertical">
    <button class="aurora-btn aurora-btn-subtle">Top</button>
    <button class="aurora-btn aurora-btn-subtle">Middle</button>
    <button class="aurora-btn aurora-btn-subtle">Bottom</button>
</div>
```

## Usage Examples

### Form Actions
```html
<div class="form-actions">
    <button class="aurora-btn aurora-btn-primary">Save Changes</button>
    <button class="aurora-btn aurora-btn-ghost-secondary">Cancel</button>
</div>
```

### Dialogs
```html
<div class="dialog-actions">
    <button class="aurora-btn aurora-btn-danger">Delete</button>
    <button class="aurora-btn aurora-btn-subtle">Cancel</button>
</div>
```

### Table Actions
```html
<button class="aurora-btn aurora-btn-secondary aurora-btn-sm">Export CSV</button>
<button class="aurora-btn aurora-btn-subtle aurora-btn-sm">Filter</button>
```

## Accessibility

- All buttons include proper focus states with visible outlines
- Buttons have a minimum touch target of 44x44px on mobile
- Use descriptive text or aria-labels for icon-only buttons
- Loading states maintain button dimensions to prevent layout shift

## Migration Guide

If migrating from custom button classes:

1. Replace `.export-btn` with `.aurora-btn .aurora-btn-secondary .aurora-btn-sm`
2. Replace `.pagination-btn` with `.aurora-btn .aurora-btn-subtle .aurora-btn-sm`
3. Replace custom button styles with appropriate Aurora button variants

## Best Practices

1. **Consistency**: Use the same variant for similar actions across the app
2. **Hierarchy**: Use primary for main actions, secondary for alternatives
3. **Spacing**: Maintain consistent spacing between button groups
4. **Loading States**: Always show loading state for async operations
5. **Mobile**: Ensure buttons are easily tappable on touch devices