#!/usr/bin/env node

/**
 * Start script that runs migrations and seeds test user before starting the server
 * This ensures migrations and test data are always up-to-date on Railway deployments
 */

const { execSync } = require('child_process');
const path = require('path');

// Helper to run command and show output
function runCommand(command, description) {
  console.log(`   ${description}...`);
  try {
    execSync(command, {
      stdio: 'inherit', // Show output in real-time
      cwd: path.join(__dirname, '..'),
      env: process.env
    });
    return true;
  } catch (error) {
    console.error(`   ❌ ${description} failed!`);
    if (error.stdout) console.error('   Stdout:', error.stdout.toString());
    if (error.stderr) console.error('   Stderr:', error.stderr.toString());
    throw error;
  }
}

// Helper to run command and show output
function runCommand(command, description) {
  console.log(`   ${description}...`);
  try {
    execSync(command, {
      stdio: 'inherit', // Show output in real-time
      cwd: path.join(__dirname, '..'),
      env: process.env
    });
    return true;
  } catch (error) {
    console.error(`   ❌ ${description} failed!`);
    if (error.stdout) console.error('   Stdout:', error.stdout.toString());
    if (error.stderr) console.error('   Stderr:', error.stderr.toString());
    throw error;
  }
}

console.log('🔄 Running database migrations...');
console.log(`   Working directory: ${path.join(__dirname, '..')}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'NOT SET'}`);
console.log(`   DIRECT_URL: ${process.env.DIRECT_URL ? 'Set' : 'NOT SET'}`);

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set! Cannot run migrations.');
  process.exit(1);
}

try {
  // Run migrations - CRITICAL: Must succeed or server won't start
  console.log('   Executing: npx prisma migrate deploy');
  console.log('   This may take a moment...');
  runCommand('npx prisma migrate deploy', 'Running migrations');
  console.log('✅ Migrations completed successfully');
  
  // Seed test user (non-critical - can fail if user exists)
  console.log('🌱 Checking for test user...');
  try {
    runCommand('npm run seed:test', 'Seeding test user');
    console.log('✅ Test user check completed');
  } catch (seedError) {
    // Seed failures are non-fatal (user might already exist)
    console.log('ℹ️  Seed script completed (user may already exist)');
  }
  
  console.log('🚀 Starting server...');
  
  // Start the server
  require('../src/server.js');
  
} catch (error) {
  console.error('❌ CRITICAL ERROR during startup:');
  console.error('   Message:', error.message);
  console.error('   Server will NOT start until this is fixed.');
  console.error('   Check the error above and fix the issue.');
  process.exit(1);
}

