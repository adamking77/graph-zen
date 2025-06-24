#!/bin/bash
echo "Starting Chart Maker App..."
pkill -f "next dev" 2>/dev/null || true
npm run dev