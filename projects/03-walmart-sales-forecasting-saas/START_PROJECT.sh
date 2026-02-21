#!/bin/bash
# Startup script for ForecastAI project

echo "🚀 Starting ForecastAI Enterprise Project"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python
if ! command -v python &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.11+"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check backend dependencies
echo -e "\n${YELLOW}Checking backend dependencies...${NC}"
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null || true

if ! python -c "import fastapi" &> /dev/null; then
    echo "Installing backend dependencies..."
    pip install -r requirements.txt --quiet
fi

# Check frontend dependencies
echo -e "\n${YELLOW}Checking frontend dependencies...${NC}"
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install --silent
fi

# Start backend
echo -e "\n${GREEN}Starting backend server...${NC}"
cd ../backend
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null || true
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo -e "\n${GREEN}Starting frontend server...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}✅ Both servers are starting!${NC}"
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
