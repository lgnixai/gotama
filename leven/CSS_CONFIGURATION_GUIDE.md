# Grid Table CSS Configuration Guide

## Overview

This guide explains the CSS configuration differences between the original `apps/nextjs-app` and the demo, and how to properly configure your app for Grid Table scrollbars.

---

## ❌ Problem: Original Demo Configuration

### Missing CSS Import

```tsx
// ❌ WRONG - Missing glide-data-grid CSS
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  // Only app CSS
import App from './App.tsx'
```

### Incorrect Container CSS

```css
/* ❌ WRONG - Prevents Grid from calculating height */
body {
  display: flex;
  place-items: center;  /* Centers content vertically */
  min-height: 100vh;    /* Only minimum height, not explicit */
}

#root {
  max-width: 1280px;    /* Limits width */
  margin: 0 auto;
  padding: 2rem;        /* Adds padding, reducing available space */
}
```

**Why this breaks scrollbars:**
- `place-items: center` prevents Grid from expanding to full height
- `min-height: 100vh` doesn't give Grid an explicit height to calculate scrollbars
- `max-width` and `padding` reduce available space unpredictably

---

## ✅ Solution: Correct Configuration

### 1. Import CSS in Correct Order

```tsx
// ✅ CORRECT
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@glideapps/glide-data-grid/dist/index.css'  // ← Import FIRST!
import './index.css'
import App from './App.tsx'
```

**Order matters!** The glide-data-grid CSS must be imported before your app CSS so you can override styles if needed.

### 2. Set Up Full-Height Container

```css
/* ✅ CORRECT */
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;      /* Explicit height, not min-height */
  overflow: hidden;  /* Critical! */
}

#root {
  width: 100%;
  height: 100%;      /* Match parent dimensions */
}
```

**Key points:**
- `height: 100%` gives explicit dimensions (not `min-height`)
- `overflow: hidden` on html/body prevents double scrollbars
- Grid manages its own internal scrolling

### 3. Grid Container Component

```tsx
// ✅ CORRECT - Using Flexbox
function App() {
  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1>Title</h1>
      </div>

      {/* Grid Container - flex-1 takes remaining space */}
      <div className="flex-1 min-h-0 p-4">
        <div className="h-full bg-white rounded-lg">
          <Grid
            style={{ width: '100%', height: '100%' }}
            // ... props
          />
        </div>
      </div>
    </div>
  )
}
```

**Important CSS classes:**
- `h-screen` - Sets container to 100vh
- `flex flex-col` - Vertical flexbox layout
- `flex-1` - Grid container takes remaining space
- `min-h-0` - Critical! Allows flex item to shrink below content size
- `h-full` - Inner div matches flex container height

---

## Reference: How nextjs-app Does It

### Import Pattern (from `apps/nextjs-app/src/pages/_app.tsx`)

```tsx
import '@glideapps/glide-data-grid/dist/index.css'
import 'reactflow/dist/style.css'
import '../styles/global.css'
```

### Global CSS (from `apps/nextjs-app/src/styles/global.css`)

```css
html,
body {
  overflow: hidden;
}
```

### Grid Container (from `apps/nextjs-app/src/features/app/blocks/view/grid/GridViewBaseInner.tsx`)

```tsx
<div ref={containerRef} className="relative size-full">
  <Grid
    ref={gridRef}
    theme={theme}
    rowCount={realRowCount}
    columns={columns}
    // ...
  />
</div>
```

Where `size-full` is Tailwind for `width: 100%; height: 100%`.

---

## Common Patterns

### Pattern 1: Full Screen Grid

```tsx
function FullScreenGrid() {
  return (
    <div className="h-screen w-screen">
      <Grid style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
```

### Pattern 2: Grid with Header/Footer

```tsx
function GridWithToolbar() {
  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="h-16 bg-white border-b">
        <Toolbar />
      </div>

      {/* Grid - takes remaining space */}
      <div className="flex-1 min-h-0">
        <Grid style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Footer */}
      <div className="h-12 bg-gray-100">
        <StatusBar />
      </div>
    </div>
  )
}
```

### Pattern 3: Grid in Sidebar Layout

```tsx
function SidebarLayout() {
  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800">
        <Sidebar />
      </div>

      {/* Main content with Grid */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 min-h-0 p-4">
          <Grid style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  )
}
```

---

## Debugging Checklist

If scrollbars don't appear, check:

1. ✅ **CSS Import**
   ```tsx
   import '@glideapps/glide-data-grid/dist/index.css'
   ```

2. ✅ **html/body overflow**
   ```css
   html, body { overflow: hidden; }
   ```

3. ✅ **Explicit container height**
   - Use `h-screen`, `h-full`, or `height: 100%`
   - NOT `min-height: 100vh`

4. ✅ **Flexbox min-height fix**
   ```tsx
   <div className="flex-1 min-h-0">
   ```

5. ✅ **Grid dimensions**
   ```tsx
   <Grid style={{ width: '100%', height: '100%' }} />
   ```

6. ✅ **Check DevTools**
   - Grid container should have computed height (not 0px or auto)
   - Look for `.dvn-scroller` element in DOM
   - Check if canvas element has dimensions

---

## Browser DevTools Inspection

### What to Look For

1. **Grid Container Dimensions**
   ```
   .grid-container {
     width: 1200px;  ✅ Should be > 0
     height: 800px;  ✅ Should be > 0
   }
   ```

2. **Canvas Element**
   ```html
   <canvas width="1200" height="800"></canvas>
   ```
   Should have actual pixel dimensions, not 0.

3. **Scroller Element**
   ```html
   <div class="dvn-scroller">
     <div class="dvn-scroll-inner" style="width: 2000px; height: 3000px;"></div>
   </div>
   ```
   Should be present in DOM when content overflows.

---

## Quick Start Templates

### Minimal Template

```tsx
// main.tsx
import '@glideapps/glide-data-grid/dist/index.css'
import './index.css'

// index.css
html, body, #root {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

// App.tsx
function App() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Grid 
        style={{ width: '100%', height: '100%' }}
        // ... props
      />
    </div>
  )
}
```

### Tailwind Template

```tsx
// main.tsx
import '@glideapps/glide-data-grid/dist/index.css'
import './index.css'

// index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  @apply w-full h-full m-0 p-0 overflow-hidden;
}

// App.tsx
function App() {
  return (
    <div className="h-screen w-screen">
      <Grid 
        style={{ width: '100%', height: '100%' }}
        // ... props
      />
    </div>
  )
}
```

---

## Summary

| Aspect | ❌ Wrong | ✅ Correct |
|--------|---------|-----------|
| **CSS Import** | Only app CSS | `@glideapps/glide-data-grid/dist/index.css` first |
| **html/body** | `min-height: 100vh` | `height: 100%; overflow: hidden;` |
| **Container** | `max-width`, `padding`, `place-items` | `width: 100%; height: 100%;` |
| **Flexbox** | `flex-1` only | `flex-1 min-h-0` |
| **Grid style** | No dimensions | `width: '100%', height: '100%'` |

Follow these patterns, and scrollbars will work correctly! 🎉