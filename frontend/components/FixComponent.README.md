# FixComponent - Reusable Layout for Issue/Check Detail Views

A highly reusable React component that provides a consistent layout and functionality for displaying technical checks, SEO issues, or any fixable items with AI-powered solutions.

## Features

- 🎨 **Consistent Design**: Matches your exact design specifications with proper styling
- 📱 **Responsive Layout**: Two-column layout with sticky fix panel
- 🤖 **AI Integration**: Simulated AI streaming and fix generation
- ✅ **Bulk Operations**: Select and fix multiple items at once
- 📊 **Progress Tracking**: Visual progress bar and completion tracking
- 🎯 **Three Fix Modes**: AI Fix, DIY Guide, and Expert Help
- 🔧 **Highly Customizable**: Flexible props for different use cases

## Quick Start

```jsx
import FixComponent from './FixComponent'

function MyPage({ issue, onBack }) {
  return (
    <FixComponent
      title="Missing Meta Descriptions"
      items={issue.urls}
      onBack={onBack}
      // ... other props
    />
  )
}
```

## Props Reference

### Core Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | string | ✅ | - | Main title of the issue/check |
| `onBack` | function | ✅ | - | Callback for back navigation |
| `items` | array | ❌ | `[]` | Array of affected pages/URLs |

### Data Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stats` | object | `{}` | Statistics object with `pagesAffected`, `seoImpact`, `difficulty` |
| `initialFixedItems` | array | `[]` | Pre-fixed items |
| `initialMode` | string | `"ai"` | Initial tab mode (`"ai"`, `"diy"`, `"help"`) |

### Content Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `description` | string | Auto-generated | Issue description |
| `whatToDo` | string | Generic text | What to do instructions |
| `diySteps` | array | 3 default steps | Step-by-step guide |
| `aiPrompt` | string | Generic prompt | AI prompt template |
| `beforeCode` | string | Placeholder | Before code example |
| `afterCode` | string | Placeholder | After code example |

### Customization Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | `"technical"` | Component type (`"technical"`, `"issues"`, or custom) |
| `showBulkActions` | boolean | `true` | Show bulk selection and actions |
| `status` | string | `"passed"` | Status (`"critical"`, `"warning"`, `"passed"`) |
| `category` | string | Based on type | Category label |
| `icon` | string | Auto-selected | Custom icon |
| `severity` | string | - | Severity level |

### Event Handlers

| Prop | Type | Description |
|------|------|-------------|
| `onFix` | function | Called when fix is initiated |
| `onMarkFixed` | function | Called when item is marked as fixed |
| `onCopyCode` | function | Called when code is copied |

## Usage Examples

### 1. Technical Check Detail

```jsx
<FixComponent
  title="Missing ALT Attributes"
  category="Technical"
  status="critical"
  items={check.affectedPages}
  stats={{
    pagesAffected: check.pages,
    seoImpact: check.impact,
    difficulty: check.difficulty
  }}
  whatToDo="Add descriptive ALT attributes to all images"
  aiPrompt="Generate SEO-optimised ALT text for this image"
  beforeCode={`<img src="/photo.jpg">`}
  afterCode={`<img src="/photo.jpg" alt="Description">`}
  type="technical"
  onBack={handleBack}
/>
```

### 2. SEO Issue Detail

```jsx
<FixComponent
  title="Missing Meta Descriptions"
  category="On-Page Issues"
  status="warning"
  items={issue.urls}
  stats={{
    pagesAffected: issue.pages,
    seoImpact: issue.impact,
    difficulty: "Easy"
  }}
  diySteps={[
    { title: "Audit pages", desc: "Find pages without meta descriptions" },
    { title: "Write descriptions", desc: "Create 150-160 character descriptions" },
    { title: "Update CMS", desc: "Add descriptions in SEO settings" }
  ]}
  type="issues"
  onBack={handleBack}
/>
```

### 3. Custom Content Issue

```jsx
<FixComponent
  title="Duplicate Content Issues"
  category="Content"
  status="warning"
  items={duplicatePages}
  stats={{
    pagesAffected: duplicatePages.length,
    seoImpact: 25,
    difficulty: "Medium"
  }}
  whatToDo="Identify and resolve duplicate content issues"
  aiPrompt="Generate unique content variations to avoid duplication"
  type="content"
  onBack={handleBack}
/>
```

### 4. Minimal Configuration

```jsx
<FixComponent
  title="Simple Issue"
  items={["/page1", "/page2"]}
  onBack={handleBack}
  // Uses sensible defaults for everything else
/>
```

## Item Structure

The `items` prop accepts an array of items that can be:

### Simple Strings
```jsx
items={["/page1", "/page2", "/page3"]}
```

### Objects with URL and Description
```jsx
items={[
  { url: "/about", description: "Missing meta description" },
  { url: "/contact", description: "Title too short" }
]}
```

### Objects with Custom Properties
```jsx
items={[
  { 
    url: "/services", 
    issue: "Missing H1 tag",
    severity: "high",
    impact: 15
  }
]}
```

## Styling & Theming

The component uses inline styles for consistency and includes:

- **Color Scheme**: Consistent with your design (#00dfff, #7730ed, #00f5a0, #ff3860)
- **Typography**: Syne (headings), DM Mono (code), DM Sans (body)
- **Animations**: fadeUp, blink, slideUp for smooth interactions
- **Responsive**: Adapts to different screen sizes

## State Management

The component manages its own internal state:

- `mode`: Current tab (ai/diy/help)
- `selectedItem`: Currently selected item
- `fixedItems`: Array of fixed items
- `checkedItems`: Items selected for bulk operations
- `streaming`: AI streaming state
- `bulkModal`: Bulk fix modal visibility

## Integration Tips

### 1. Replace Existing Components

```jsx
// Instead of your existing TechCheckDetailView
import FixComponent from './FixComponent'

export default function TechCheckDetailView({ check, onBack }) {
  return (
    <FixComponent
      title={check.name}
      category="Technical"
      status={check.status}
      items={check.affectedPages}
      stats={{
        pagesAffected: check.pages,
        seoImpact: check.impact,
        difficulty: check.difficulty
      }}
      onBack={onBack}
      type="technical"
    />
  )
}
```

### 2. Add Custom Event Handlers

```jsx
<FixComponent
  // ... other props
  onFix={(item) => {
    // Call your API to fix the item
    apiService.fixItem(item)
  }}
  onMarkFixed={(item) => {
    // Update your state
    setFixedItems(prev => [...prev, item])
  }}
  onCopyCode={(code) => {
    // Track analytics
    analytics.track('code_copied', { code })
  }}
/>
```

### 3. Customize for Different Types

```jsx
// For performance issues
<FixComponent
  type="performance"
  category="Speed Issues"
  whatToDo="Optimize page load times and Core Web Vitals"
  diySteps={[
    { title: "Image optimization", desc: "Compress and lazy-load images" },
    { title: "Minify code", desc: "Reduce CSS/JS file sizes" }
  ]}
/>

// For security issues
<FixComponent
  type="security"
  category="Security Issues"
  status="critical"
  whatToDo="Address security vulnerabilities"
  aiPrompt="Generate secure code implementation"
/>
```

## File Structure

```
components/
├── FixComponent.jsx          # Main reusable component
├── FixComponent.example.jsx  # Usage examples
└── FixComponent.README.md    # This documentation
```

## Benefits

1. **Consistency**: Same layout and behavior across all issue types
2. **Maintainability**: Single component to update and maintain
3. **Flexibility**: Highly customizable for different use cases
4. **Developer Experience**: Easy to use with sensible defaults
5. **Performance**: Optimized rendering and state management
6. **Accessibility**: Proper ARIA labels and keyboard navigation

## Migration Guide

To migrate existing detail views:

1. **Import the component**: `import FixComponent from './FixComponent'`
2. **Map your data**: Transform your existing data to match the props structure
3. **Replace JSX**: Replace your existing component JSX with `<FixComponent />`
4. **Test functionality**: Ensure all interactions work as expected
5. **Customize as needed**: Add custom content or styling for specific cases

The component is designed to be a drop-in replacement for most detail view patterns while providing enhanced functionality and consistency.
