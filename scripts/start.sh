#!/bin/bash

# XAPI 启动脚本

set -e

echo "🚀 Starting XAPI - AI API Gateway..."

# 检查环境变量
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your configuration."
    exit 1
fi

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# 启动服务
echo "📦 Starting Docker containers..."
docker-compose up -d

# 等待服务启动
echo "⏳ Waiting for services to be ready..."
sleep 10

# 检查服务状态
echo "🔍 Checking service status..."
docker-compose ps

# 显示访问信息
echo ""
echo "✅ XAPI is running!"
echo ""
echo "Access URLs:"
echo "  - Frontend:    http://localhost:3000"
echo "  - Backend API: http://localhost:3001"
echo "  - Prometheus:  http://localhost:9090"
echo "  - Grafana:     http://localhost:3002 (admin/admin123)"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop:"
echo "  docker-compose down"
echo ""
