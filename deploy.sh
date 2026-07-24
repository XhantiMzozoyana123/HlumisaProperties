#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================="
echo "  Hlumisa Properties Deployment Script"
echo "========================================="

echo ""
echo "Step 1: Pulling latest code..."
git pull origin master

echo ""
echo "Step 2: Loading environment variables..."
if [ -f "$SCRIPT_DIR/.env" ]; then
    source "$SCRIPT_DIR/setup-env-vars.sh"
    echo "Environment variables loaded successfully."
else
    echo "Warning: .env file not found. Please create .env file with required variables."
    echo "Continuing with deployment..."
fi

echo ""
echo "Step 3: Rebuilding and restarting API..."
sudo docker compose down
sudo docker compose up -d --build

echo ""
echo "========================================="
echo "Deployment complete!"
echo "API should be available at: http://$(hostname -I | awk '{print $1}'):5000"
echo "========================================="