#!/bin/bash

# E-commerce Price Prediction Web Application
# Startup Script

echo "=========================================="
echo "E-commerce Price Prediction System"
echo "=========================================="
echo ""

# Check if model exists
if [ ! -f "random_forest_price_model.pkl" ]; then
    echo "✗ Error: random_forest_price_model.pkl not found!"
    echo "Please ensure the model file exists in the current directory."
    exit 1
fi

echo "✓ Model file found"
echo ""

# Check Python version
python3 --version
echo ""

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing/updating dependencies..."
pip install -q -r requirements.txt

echo ""
echo "=========================================="
echo "Starting Flask Application..."
echo "=========================================="
echo ""
echo "Application will be available at:"
echo "  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 app.py

