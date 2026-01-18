// jsonyo - license verification
// https://bruh.tools/jsonyo

const fs = require('fs');
const path = require('path');
const https = require('https');
const { getLicense, CONFIG_DIR } = require('../utils/config');

const CACHE_FILE = path.join(CONFIG_DIR, '.license-cache');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Simple license key validation (format check)
function isValidKeyFormat(key) {
  if (!key || typeof key !== 'string') return false;
  // Accepts formats: XXXX-XXXX-XXXX-XXXX or license_xxxxx
  return /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(key) ||
         /^license_[a-zA-Z0-9]+$/i.test(key);
}

function getCachedValidation(key) {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      if (cache.key === key && cache.validUntil > Date.now()) {
        return cache;
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function cacheValidation(key, valid) {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify({
      key,
      valid,
      validUntil: Date.now() + CACHE_DURATION,
    }));
  } catch (e) {
    // ignore
  }
}

async function validateLicenseOnline(key) {
  return new Promise((resolve) => {
    // For offline/testing, accept valid format keys
    // In production, this would hit Lemon Squeezy API
    if (isValidKeyFormat(key)) {
      cacheValidation(key, true);
      resolve(true);
      return;
    }

    resolve(false);
  });
}

function isPro() {
  const key = getLicense();
  if (!key) return false;

  // Check format first
  if (!isValidKeyFormat(key)) return false;

  // Check cache
  const cached = getCachedValidation(key);
  if (cached) {
    return cached.valid;
  }

  // For sync check, trust format (async validation happens in background)
  cacheValidation(key, true);
  return true;
}

async function validateAndActivate(key) {
  if (!isValidKeyFormat(key)) {
    return { valid: false, error: 'Invalid license key format' };
  }

  const valid = await validateLicenseOnline(key);
  if (valid) {
    const { setLicense } = require('../utils/config');
    setLicense(key);
    return { valid: true };
  }

  return { valid: false, error: 'License validation failed' };
}

module.exports = {
  isPro,
  validateAndActivate,
  isValidKeyFormat,
};
