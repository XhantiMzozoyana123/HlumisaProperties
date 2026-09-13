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
echo "Step 3: Preparing SQLite database..."
echo "The API uses a SQLite database file (hlumisaproperties.db) stored in the"
echo "persistent /app/data volume - no external database server is required."
echo "Data (including the Books CSV file) is preserved across container restarts."
echo ""

echo ""
echo "Step 4: Rebuilding and restarting API..."
sudo docker compose down
sudo docker compose up -d --build

echo ""
echo "Step 5: Waiting for API to respond..."
for i in {1..30}; do
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000/" | grep -q "200"; then
        echo "API is up and responding!"
        break
    fi
    if [ "$i" -eq 30 ]; then
        echo "Warning: API did not respond within 30 seconds. Check logs with: sudo docker compose logs"
    else
        echo "Waiting... ($i/30)"
        sleep 2
    fi
done

echo ""
echo "========================================="
echo "Deployment complete!"
echo "API should be available at: http://$(hostname -I | awk '{print $1}'):5000"
echo "Health check: http://localhost:5000/health"
echo "========================================="
