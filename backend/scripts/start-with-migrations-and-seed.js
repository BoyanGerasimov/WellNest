#!/usr/bin/env node

/**
 * Start script that runs migrations and seeds test user before starting the server
 * This ensures migrations and test data are always up-to-date on Railway deployments
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Running database migrations...');
console.log(`   Working directory: ${path.join(__dirname, '..')}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'NOT SET'}`);

try {
  // Run migrations with explicit error handling
  console.log('   Executing: npx prisma migrate deploy');
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: process.env
  });
  
  console.log('✅ Migrations completed successfully');
  
  // Seed test user if it doesn't exist
  console.log('🌱 Checking for test user...');
  try {
    execSync('npm run seed:test', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: process.env
    });
    console.log('✅ Test user check completed');
  } catch (seedError) {
    // Seed script will create or update test user, so errors are okay if user exists
    console.log('ℹ️  Test user already exists or seed completed');
  }
  
  console.log('🚀 Starting server...');
  
  // Start the server
  require('../src/server.js');
  
} catch (error) {
  console.error('❌ Error during startup:');
  console.error('   Message:', error.message);
  if (error.stdout) console.error('   Stdout:', error.stdout.toString());
  if (error.stderr) console.error('   Stderr:', error.stderr.toString());
  console.error('   Full error:', error);
  process.exit(1);
}

