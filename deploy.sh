#!/bin/bash
set -e

echo "🚀 Deploying URL Shortener..."
echo ""

# ─── Check .env.production exists ──────────────────────────
if [ ! -f .env.production ]; then
  echo "❌ .env.production not found!"
  echo "Copy .env.production.example and fill in values."
  exit 1
fi

# ─── Load env vars ────────────────────────────────────────
export $(cat .env.production | grep -v '^#' | xargs)

# ─── Build & Start ────────────────────────────────────────
echo "📦 Building containers..."
docker-compose -f docker-compose.prod.yml build

echo "🗄️ Starting database & Redis..."
docker-compose -f docker-compose.prod.yml up -d postgres redis

echo "⏳ Waiting for services..."
sleep 10

echo "📋 Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy

echo "🌱 Running database seed..."
docker-compose -f docker-compose.prod.yml run --rm api npx prisma db seed || true

echo "🚀 Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Services:"
echo "  🌐 Website:  http://localhost (or your domain)"
echo "  📡 API:      http://localhost/api/health"
echo "  🗄️ Postgres: localhost:5432"
echo "  📮 Redis:    localhost:6379"
echo ""
echo "Logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""