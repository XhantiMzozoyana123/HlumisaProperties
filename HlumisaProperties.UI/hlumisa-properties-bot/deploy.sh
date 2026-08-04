#!/bin/bash

# ======================================================
# Hlumisa Properties Bot - VPS Deployment Script
# ======================================================

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🚀 Hlumisa Properties Bot - VPS Deployment              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo "   Please create .env file first:"
    echo "   cp .env.example .env"
    echo "   Then edit .env with your credentials"
    exit 1
fi

echo "✅ .env file found"

# Build the Docker image
echo ""
echo "📦 Building Docker image..."
docker build -t hlumisa-properties-bot:latest .

echo "✅ Docker image built successfully"

# Stop and remove existing container if running
echo ""
echo "🛑 Stopping existing container (if any)..."
docker stop hlumisa-messenger-bot 2>/dev/null || true
docker rm hlumisa-messenger-bot 2>/dev/null || true

# Run the container
echo ""
echo "🚀 Starting container..."
docker run -d \
    --name hlumisa-messenger-bot \
    --restart unless-stopped \
    -p 3001:3001 \
    --env-file .env \
    -v $(pwd)/logs:/app/logs \
    hlumisa-properties-bot:latest

echo ""
echo "✅ Container started successfully!"
echo ""
echo "📊 Container Status:"
docker ps | grep hlumisa-messenger-bot

echo ""
echo "📋 View logs:"
echo "   docker logs -f hlumisa-messenger-bot"
echo ""
echo "🎉 Deployment complete!"