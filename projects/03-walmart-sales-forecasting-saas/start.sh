#!/bin/bash

echo "🚀 Starting ML Forecast SaaS Application..."

# Get the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start Backend using uvicorn (proper FastAPI startup)
echo "📦 Starting Backend API on port 8000..."
cd "$SCRIPT_DIR/backend"

# Activate venv if it exists
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
fi

# Create required directories before starting
mkdir -p logs data temp uploads

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start Frontend
echo "⚛️  Starting Frontend on port 5173..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Application started successfully!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo "   Health:   http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "echo '🛑 Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
