const fs = require('fs');
const path = require('path');

console.log('🧪 Validating XAPI Project...\n');

// Required files
const requiredFiles = [
  'docker-compose.yml',
  'backend/package.json',
  'backend/src/app.ts',
  'backend/src/adapters/openai.adapter.ts',
  'backend/src/adapters/anthropic.adapter.ts',
  'backend/src/adapters/moonshot.adapter.ts',
  'frontend/package.json',
  'frontend/src/app/layout.tsx',
  'frontend/src/app/(dashboard)/page.tsx',
  '.env.example'
];

// Required directories
const requiredDirs = [
  'backend/src/adapters',
  'backend/src/core',
  'backend/src/routes',
  'frontend/src/app',
  'frontend/src/components',
  'docs'
];

let allGood = true;

// Check files
console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allGood = false;
  }
});

console.log('\n📁 Checking required directories...');
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`  ✅ ${dir}`);
  } else {
    console.log(`  ❌ ${dir} - MISSING`);
    allGood = false;
  }
});

// Count files
console.log('\n📊 File statistics:');
try {
  const adapterFiles = fs.readdirSync('backend/src/adapters').filter(f => f.endsWith('.ts'));
  console.log(`  Backend adapters: ${adapterFiles.length}`);
  adapterFiles.forEach(f => console.log(`    - ${f}`));
} catch (e) {
  console.log('  Backend adapters: 0');
}

try {
  const pageFiles = [];
  const walkDir = (dir) => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    items.forEach(item => {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        walkDir(fullPath);
      } else if (item.name.endsWith('.tsx') && item.name.startsWith('(')) {
        pageFiles.push(fullPath);
      }
    });
  };
  walkDir('frontend/src/app');
  console.log(`  Frontend pages: ${pageFiles.length}`);
} catch (e) {
  console.log('  Frontend pages: 0');
}

try {
  const docFiles = fs.readdirSync('docs').filter(f => f.endsWith('.md'));
  console.log(`  Documentation: ${docFiles.length}`);
} catch (e) {
  console.log('  Documentation: 0');
}

console.log('\n' + (allGood ? '✅ All checks passed!' : '❌ Some checks failed!'));

if (allGood) {
  console.log('\n🚀 Project is ready for development!');
  console.log('\nNext steps:');
  console.log('  1. Configure environment variables in .env');
  console.log('  2. Install dependencies:');
  console.log('     cd backend && npm install');
  console.log('     cd frontend && npm install');
  console.log('  3. Start development servers');
}

process.exit(allGood ? 0 : 1);
