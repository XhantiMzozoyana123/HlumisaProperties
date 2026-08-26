# =====================================================
# Hlumisa Properties Bot - Official Meta Graph API
# (No Chromium / no Puppeteer)
# =====================================================

# Build stage
FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage (slim, no browser)
FROM node:18-slim AS runtime
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Health check hits the /health endpoint exposed by api-server.ts
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "const http=require('http');const req=http.get('http://localhost:3001/health',res=>{process.exit(res.statusCode===200?0:1)});req.on('error',()=>process.exit(1));req.setTimeout(3000,()=>{req.destroy();process.exit(1)})"

CMD ["node", "dist/api-server.js"]
