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

### Memory Commitment
This fix should be applied automatically whenever server startup issues occur in this project.