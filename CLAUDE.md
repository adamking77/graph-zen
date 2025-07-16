# Claude Memory - Development Notes

## Server Startup Fix

### Common Issue
When starting the Next.js development server on port 8080, compilation errors often occur due to:

1. **Cached build files**: The `.next/cache` directory can contain stale compilation artifacts
2. **Port conflicts**: Existing processes may be using port 8080
3. **Process conflicts**: Previous Next.js dev processes may still be running

### Standard Fix Process
To restart the server successfully:

1. **Kill existing processes**:
   ```bash
   pkill -f "next dev" 2>/dev/null || true
   lsof -ti:8080 | xargs kill -9 2>/dev/null || true
   ```

2. **Clear Next.js cache**:
   ```bash
   rm -rf .next/cache
   ```

3. **Start the server**:
   ```bash
   npm run dev:8080
   ```

### Quick Script
Use the existing `start-8080.sh` script which already implements this fix:
```bash
./start-8080.sh
```

### Why This Works
- Clearing the cache forces Next.js to rebuild all components from scratch
- Killing existing processes prevents port conflicts
- The combination resolves most compilation and startup issues

### Fundamental Fix for Port 8080 Issues

**Complete Server Startup Fix Process:**

1. **Dependency Resolution Issues**: If npm install fails with peer dependency conflicts:
   ```bash
   rm -rf node_modules
   npm install --legacy-peer-deps
   ```

2. **Hostname Binding**: Add hostname binding to package.json:
   ```json
   "scripts": {
     "dev:8080": "next dev -p 8080 -H 0.0.0.0"
   }
   ```

3. **Complete Reset Sequence** (when server shows "Ready" but isn't accessible):
   ```bash
   killall node
   rm -rf .next
   rm -rf node_modules
   npm install --legacy-peer-deps
   npm run dev:8080
   ```

4. **Keep Server Running in Background**:
   ```bash
   nohup npm run dev:8080 > dev-server.log 2>&1 &
   ```

**Logical Troubleshooting Process:**
1. Check if process is running: `ps aux | grep "next dev"`
2. Check port binding: `lsof -i :8080`
3. Test connectivity: `curl -I http://localhost:8080`
4. If no response, apply complete reset sequence above

### Memory Commitment
This complete fix sequence should be applied automatically whenever server startup issues occur in this project.

## Chart Styling and Data Label Best Practices

### Data Label Color Strategy

**Problem**: Data labels that adapt to bar colors can become unreadable on certain color palettes (especially neon colors where brightness calculations fail).

**Solution**: Use position-based color strategy:

1. **Inside chart elements** (bars, segments): Always use white (`#ffffff`) for maximum readability
2. **Outside chart elements**: Use background-based contrast:
   ```javascript
   color: isDark ? '#f3f4f6' : '#1f2937'
   ```

**Implementation Pattern**:
```javascript
const isInside = [condition] // e.g., barHeight > 40 or percentage > 30
const labelStyle = isInside ? 
  { className: 'text-xs font-medium', style: { color: '#ffffff' } } :
  { className: 'text-xs font-medium', style: { color: isDark ? '#f3f4f6' : '#1f2937' } }
```

### Chart Element Consistency Rules

**Bar Charts**: All bar charts (vertical, horizontal, combo) should have:
- Rounded corners (`rx="2"` for SVG, `rounded-t` or `rounded-sm` for CSS)
- Consistent hover behavior (`hover:opacity-80`, no scaling)
- Consistent gradient patterns (`${color}f0` to `${color}` for vertical, `${color}e6` to `${color}` for horizontal)
- Animation timing with 150ms stagger intervals

**Donut Charts**: 
- Outer radius: 115px (maintain chart size)
- Inner radius: 80px (increased thickness from previous 93px)
- Results in 35px thickness for better visual presence

### Color Palette Handling

When working with neon or bright color palettes, avoid using `getDataLabelStyle()` with bar color contrast for labels positioned outside chart elements. The `isColorLight()` function can misclassify bright neon colors, causing readability issues.

**Safe approach**: Always use background-based contrast for external labels, regardless of chart element colors.

## Modal Layout Best Practices

### Edit Data Modal Responsive Design

**Problem**: Large modals with fixed dimensions can overflow on smaller screens, causing layout issues and poor user experience.

**Solution**: Implement responsive modal layout with proper constraints:

```typescript
// Modal container with responsive sizing
className="max-w-7xl w-[95%] max-w-[95vw] h-[90vh] max-h-[900px] sm:h-[85vh] sm:max-h-[800px] flex flex-col"

// Responsive grid layout
className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0 overflow-hidden"

// Table section with scroll constraints
className="overflow-auto h-full max-h-[300px] sm:max-h-[400px] lg:max-h-[500px]"
```

**Key Principles**:
1. **Viewport-relative sizing**: Use `vh` units for height, `vw` for width constraints
2. **Responsive breakpoints**: Stack content on mobile (`grid-cols-1`), side-by-side on desktop (`lg:grid-cols-5`)
3. **Overflow management**: Add `overflow-hidden` to parent, `overflow-auto` to scrollable sections
4. **Flexible constraints**: Use `min-h-0` to prevent flex items from expanding beyond container
5. **Progressive enhancement**: Smaller constraints on mobile, larger on desktop

**Mobile-First Approach**:
- Mobile: Single column layout with compact spacing
- Tablet: Slightly larger modal dimensions
- Desktop: Full side-by-side layout with maximum space utilization

This ensures modals work properly across all device sizes while maintaining functionality and visual hierarchy.