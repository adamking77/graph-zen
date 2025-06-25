#!/bin/bash

# Kill any existing Next.js processes
echo "Stopping existing Next.js processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

# Kill any process using port 8080
echo "Clearing port 8080..."
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Wait a moment for processes to fully terminate
sleep 2

# Start the dev server on port 8080
echo "Starting Next.js dev server on port 8080..."
PORT=8080 npm run dev