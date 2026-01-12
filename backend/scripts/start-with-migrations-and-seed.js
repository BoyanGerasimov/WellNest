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

console.log('🔄 Running database migrations...');
const backendDir = path.join(__dirname, '..');
console.log(`   Working directory: ${backendDir}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'NOT SET'}`);
console.log(`   DIRECT_URL: ${process.env.DIRECT_URL ? 'Set' : 'NOT SET'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// Check if migrations directory exists
const migrationsDir = path.join(backendDir, 'prisma', 'migrations');
const fs = require('fs');
if (fs.existsSync(migrationsDir)) {
  const migrations = fs.readdirSync(migrationsDir).filter(f => 
    fs.statSync(path.join(migrationsDir, f)).isDirectory() && f !== 'migration_lock.toml'
  );
  console.log(`   Found ${migrations.length} migration(s) in prisma/migrations`);
  migrations.forEach(m => console.log(`     - ${m}`));
} else {
  console.warn(`   ⚠️  Migrations directory not found at: ${migrationsDir}`);
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set! Cannot run migrations.');
  process.exit(1);
}

try {
  // Always generate Prisma client on startup (helps when schema/client got out of sync)
  console.log('   Executing: npx prisma generate');
  runCommand('npx prisma generate', 'Generating Prisma Client');

  // Run migrations - CRITICAL: Must succeed or server won't start
  console.log('   Executing: npx prisma migrate deploy');
  console.log('   This may take a moment...');
  
  // Check if migrations directory exists and has migration files
  const migrationsDir = path.join(backendDir, 'prisma', 'migrations');
  let useDbPush = false;
  
  if (!fs.existsSync(migrationsDir)) {
    console.warn('   ⚠️  Migrations directory not found');
    useDbPush = true;
  } else {
    const migrationDirs = fs.readdirSync(migrationsDir).filter(f => {
      const fullPath = path.join(migrationsDir, f);
      return fs.statSync(fullPath).isDirectory() && f !== 'migration_lock.toml';
    });
    
    if (migrationDirs.length === 0) {
      console.warn('   ⚠️  No migration files found in migrations directory');
      useDbPush = true;
    } else {
      console.log(`   Found ${migrationDirs.length} migration(s)`);
    }
  }
  
  if (useDbPush) {
    // If no migrations exist, db push can be used *only* for non-production environments.
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      console.error('❌ No migration files found, and NODE_ENV=production.');
      console.error('   Refusing to run `prisma db push --accept-data-loss` in production.');
      console.error('   Fix: create & commit a Prisma migration locally, then redeploy.');
      process.exit(1);
    } else {
      console.warn('   ⚠️  No migration files found. Using prisma db push (non-production only)...');
      try {
        runCommand('npx prisma db push --accept-data-loss', 'Pushing schema to database');
        console.log('✅ Database schema synced successfully');
      } catch (pushError) {
        console.error('❌ Database schema push failed!');
        console.error('   Error details:', pushError.message);
        console.error('   This is a critical error. Server will not start.');
        process.exit(1);
      }
    }
  } else {
    // Try to deploy migrations
    try {
      runCommand('npx prisma migrate deploy', 'Running migrations');
      console.log('✅ Migrations completed successfully');
    } catch (migrateError) {
      console.error('❌ Migration failed!');
      const isProduction = process.env.NODE_ENV === 'production';

      if (isProduction) {
        console.error('   NODE_ENV=production. Refusing to fallback to `db push --accept-data-loss`.');
        console.error('   Migration error:', migrateError.message);
        console.error('   This is a critical error. Server will not start.');
        process.exit(1);
      }

      console.error('   Trying db push as fallback (non-production only)...');
      try {
        runCommand('npx prisma db push --accept-data-loss', 'Pushing schema to database');
        console.log('✅ Database schema synced successfully (via fallback)');
      } catch (pushError) {
        console.error('❌ Both migrate deploy and db push failed!');
        console.error('   Migration error:', migrateError.message);
        console.error('   Push error:', pushError.message);
        console.error('   This is a critical error. Server will not start.');
        process.exit(1);
      }
    }
  }
  
  // Seed test user (non-critical - can fail if user exists)
  console.log('🌱 Checking for test user...');
  try {
    runCommand('npm run seed:test', 'Seeding test user');
    console.log('✅ Test user check completed');
  } catch (seedError) {
    // Seed failures are non-fatal (user might already exist)
    console.log('ℹ️  Seed script completed (user may already exist)');
    console.log('   This is not a critical error - server will continue');
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

