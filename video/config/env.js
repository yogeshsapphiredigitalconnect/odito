/**
 * Video Service Configuration - PRODUCTION READY
 * Strict environment variable validation with fail-fast behavior
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Validate required environment variables - FAIL FAST if missing
 */
export const validateEnvironment = () => {
  const required = [
    'BACKEND_URL',
    'MONGO_URI'
  ];

  const missing = [];

  for (const envVar of required) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // CRITICAL: Fail fast if required variables are missing
  if (missing.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💥 Video service cannot start without these variables.');
    process.exit(1);
  }

  return {
    isValid: true,
    missing: []
  };
};

/**
 * Get environment variable - NO FALLBACKS for production safety
 */
export const getEnvVar = (key) => {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};

/**
 * Get service URLs - CENTRALIZED CONFIGURATION
 */
export const getServiceUrls = () => {
  return {
    backend: getEnvVar('BACKEND_URL')
  };
};

/**
 * Get media URLs for audio/video files
 */
export const getMediaUrls = () => {
  const backend = getEnvVar('BACKEND_URL');
  return {
    audio: `${backend}/audio`,
    video: `${backend}/video`
  };
};

/**
 * Get database configuration
 */
export const getDatabaseConfig = () => {
  const uri = getEnvVar('MONGO_URI');
  
  return {
    uri,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  };
};

/**
 * Log configuration (without exposing secrets)
 */
export const logConfiguration = () => {
  const config = {
    BACKEND_URL: getEnvVar('BACKEND_URL'),
    MONGO_URI: getEnvVar('MONGO_URI') ? '***CONFIGURED***' : 'NOT_SET'
  };

  console.log('🔧 Video Service Configuration:');
  console.table(config);
};
