#!/bin/bash
# Quick script to run the microservice wizard

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if a port number is provided as argument
PORT=${1:-8000}

echo "Starting Microservice Design Wizard..."
echo "Opening browser in 2 seconds..."
echo ""
echo "Access the wizard at: http://localhost:$PORT/external/external_detailed_design.html"
echo "Press Ctrl+C to stop the server"
echo ""

# Start Python HTTP server in background
python3 -m http.server $PORT 2>/dev/null || python -m SimpleHTTPServer $PORT 2>/dev/null || {
    echo "Python not found. Trying Node.js..."
    npx http-server -p $PORT 2>/dev/null || {
        echo "Node.js not found. Trying PHP..."
        php -S localhost:$PORT 2>/dev/null || {
            echo "Error: Could not start a web server."
            echo "Please install Python 3, Node.js, or PHP"
            exit 1
        }
    }
}

# Wait a bit then open browser
sleep 2
open "http://localhost:$PORT/external/external_detailed_design.html"
