#!/bin/bash
echo "Starting Chart Maker App on port 8080..."
pkill -f "next dev" 2>/dev/null || true
npm run dev:8080