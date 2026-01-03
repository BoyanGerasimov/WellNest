#!/usr/bin/env node

/**
 * Start script that runs migrations before starting the server
 * This ensures migrations are always up-to-date on Railway deployments
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Running database migrations...');

try {
  // Run migrations
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('✅ Migrations completed successfully');
  console.log('🚀 Starting server...');
  
  // Start the server
  require('../src/server.js');
  
} catch (error) {
  console.error('❌ Error during startup:', error.message);
  process.exit(1);
}

