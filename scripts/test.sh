#!/bin/bash

echo "🧪 Testing XAPI Project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

echo "✅ All dependencies installed"

# Check project structure
echo "📁 Checking project structure..."

required_files=(
    "docker-compose.yml"
    "backend/package.json"
    "backend/src/app.ts"
    "frontend/package.json"
    "frontend/src/app/layout.tsx"
    ".env.example"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
done

echo "✅ Project structure complete"

# Check for required directories
echo "📁 Checking directories..."

required_dirs=(
    "backend/src/adapters"
    "backend/src/core"
    "backend/src/routes"
    "frontend/src/app"
    "frontend/src/components"
    "docs"
)

for dir in "${required_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ Missing required directory: $dir"
        exit 1
    fi
done

echo "✅ All directories present"

# Count files
echo "📊 File statistics:"
echo "  Backend adapters: $(ls backend/src/adapters/*.ts 2>/dev/null | wc -l)"
echo "  Frontend pages: $(ls frontend/src/app/\(*\)/*.tsx 2>/dev/null | wc -l)"
echo "  Documentation: $(ls docs/*.md 2>/dev/null | wc -l)"

echo ""
echo "✅ XAPI project validation completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Configure environment variables in .env"
echo "  2. Run: docker-compose up -d"
echo "  3. Visit: http://localhost:3000"
