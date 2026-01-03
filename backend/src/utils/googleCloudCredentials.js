const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Get Google Cloud credentials file path
 * Handles both file path and base64-encoded environment variable
 * @returns {string} Path to the credentials file
 */
function getGoogleCloudCredentialsPath() {
  // Option 1: Direct file path (for local development)
  if (process.env.GOOGLE_CLOUD_KEY_FILE) {
    if (fs.existsSync(process.env.GOOGLE_CLOUD_KEY_FILE)) {
      return process.env.GOOGLE_CLOUD_KEY_FILE;
    }
    console.warn(`⚠️  GOOGLE_CLOUD_KEY_FILE specified but file not found: ${process.env.GOOGLE_CLOUD_KEY_FILE}`);
  }

  // Option 2: Base64-encoded key (for Railway/production)
  if (process.env.GOOGLE_CLOUD_KEY_BASE64) {
    try {
      // Decode base64
      const keyJson = Buffer.from(process.env.GOOGLE_CLOUD_KEY_BASE64, 'base64').toString('utf-8');
      
      // Validate it's valid JSON
      JSON.parse(keyJson);

      // Write to temporary file
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `google-cloud-key-${Date.now()}.json`);
      
      fs.writeFileSync(tempFilePath, keyJson, 'utf-8');
      
      // Set file permissions (read-only for owner)
      fs.chmodSync(tempFilePath, 0o600);
      
      console.log('✅ Google Cloud credentials loaded from base64 environment variable');
      
      // Clean up old temp files on startup (optional)
      cleanupOldTempFiles(tempDir);
      
      return tempFilePath;
    } catch (error) {
      console.error('❌ Error decoding GOOGLE_CLOUD_KEY_BASE64:', error.message);
      throw new Error('Invalid GOOGLE_CLOUD_KEY_BASE64. Please check the base64 encoding.');
    }
  }

  // Option 3: JSON string directly (alternative)
  if (process.env.GOOGLE_CLOUD_KEY_JSON) {
    try {
      // Validate it's valid JSON
      JSON.parse(process.env.GOOGLE_CLOUD_KEY_JSON);

      // Write to temporary file
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `google-cloud-key-${Date.now()}.json`);
      
      fs.writeFileSync(tempFilePath, process.env.GOOGLE_CLOUD_KEY_JSON, 'utf-8');
      fs.chmodSync(tempFilePath, 0o600);
      
      console.log('✅ Google Cloud credentials loaded from JSON environment variable');
      return tempFilePath;
    } catch (error) {
      console.error('❌ Error parsing GOOGLE_CLOUD_KEY_JSON:', error.message);
      throw new Error('Invalid GOOGLE_CLOUD_KEY_JSON. Please check the JSON format.');
    }
  }

  // No credentials found
  return null;
}

/**
 * Get Google Cloud credentials as an object (for libraries that accept credentials directly)
 * @returns {Object|null} Credentials object or null
 */
function getGoogleCloudCredentials() {
  // Option 1: Base64-encoded key
  if (process.env.GOOGLE_CLOUD_KEY_BASE64) {
    try {
      const keyJson = Buffer.from(process.env.GOOGLE_CLOUD_KEY_BASE64, 'base64').toString('utf-8');
      return JSON.parse(keyJson);
    } catch (error) {
      console.error('❌ Error decoding GOOGLE_CLOUD_KEY_BASE64:', error.message);
      return null;
    }
  }

  // Option 2: JSON string directly
  if (process.env.GOOGLE_CLOUD_KEY_JSON) {
    try {
      return JSON.parse(process.env.GOOGLE_CLOUD_KEY_JSON);
    } catch (error) {
      console.error('❌ Error parsing GOOGLE_CLOUD_KEY_JSON:', error.message);
      return null;
    }
  }

  // Option 3: Read from file
  if (process.env.GOOGLE_CLOUD_KEY_FILE) {
    try {
      const keyJson = fs.readFileSync(process.env.GOOGLE_CLOUD_KEY_FILE, 'utf-8');
      return JSON.parse(keyJson);
    } catch (error) {
      console.error('❌ Error reading GOOGLE_CLOUD_KEY_FILE:', error.message);
      return null;
    }
  }

  return null;
}

/**
 * Clean up old temporary credential files
 * @param {string} tempDir - Temporary directory path
 */
function cleanupOldTempFiles(tempDir) {
  try {
    const files = fs.readdirSync(tempDir);
    const googleKeyFiles = files.filter(file => file.startsWith('google-cloud-key-'));
    
    // Delete files older than 1 hour
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    googleKeyFiles.forEach(file => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      if (stats.mtimeMs < oneHourAgo) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          // Ignore errors when deleting old files
        }
      }
    });
  } catch (error) {
    // Ignore cleanup errors
  }
}

module.exports = {
  getGoogleCloudCredentialsPath,
  getGoogleCloudCredentials
};

