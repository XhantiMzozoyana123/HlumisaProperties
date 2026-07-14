#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Pulling latest code..."
git pull origin master

echo "Rebuilding and restarting API..."
sudo docker compose down
sudo docker compose up -d --build

echo "Deployment complete."
echo "API should be available at http://$(hostname -I | awk '{print $1}'):5000"