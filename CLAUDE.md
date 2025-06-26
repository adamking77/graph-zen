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