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
console.log(`   DIRECT_URL: ${process.env.DIRECT_URL ? 'Set' : 'NOT SET'}`);

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set! Cannot run migrations.');
  process.exit(1);
}

try {
  // Run migrations with explicit error handling
  console.log('   Executing: npx prisma migrate deploy');
  const migrateOutput = execSync('npx prisma migrate deploy', {
    stdio: 'pipe',
    cwd: path.join(__dirname, '..'),
    env: process.env,
    encoding: 'utf8'
  });
  console.log(migrateOutput);
  console.log('✅ Migrations completed successfully');
  
  // Seed test user if it doesn't exist
  console.log('🌱 Checking for test user...');
  try {
    const seedOutput = execSync('npm run seed:test', {
      stdio: 'pipe',
      cwd: path.join(__dirname, '..'),
      env: process.env,
      encoding: 'utf8'
    });
    console.log(seedOutput);
    console.log('✅ Test user check completed');
  } catch (seedError) {
    // Check if it's because user already exists (exit code 0) or actual error
    if (seedError.status === 0 || seedError.message.includes('already exists')) {
      console.log('ℹ️  Test user already exists, skipping seed');
    } else {
      console.error('⚠️  Seed script error (non-fatal):', seedError.message);
      if (seedError.stdout) console.log('   Stdout:', seedError.stdout);
      if (seedError.stderr) console.log('   Stderr:', seedError.stderr);
    }
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

