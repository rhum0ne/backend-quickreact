// Vercel Serverless Function - Validate License Key
// Route: /api/validate-license

import { getLicenseByKey, activateLicense, incrementDeviceCount, updateValidationTimestamp, logValidation } from '../lib/database.js';
import { isValidKeyFormat, sanitizeKey } from '../lib/license.js';

// Rate limiting cache (simple in-memory, resets on function cold start)
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 10; // Max 10 validations per hour per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const userLimits = rateLimitCache.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW };
  
  if (now > userLimits.resetAt) {
    // Reset window
    rateLimitCache.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimits.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  userLimits.count++;
  rateLimitCache.set(ip, userLimits);
  return true;
}

export default async function handler(req, res) {
  // CORS headers for extension
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get IP for rate limiting
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: 'Too many validation attempts. Please try again later.'
      });
      return;
    }

    // Get license key from request
    const { licenseKey } = req.body;
    
    if (!licenseKey) {
      res.status(400).json({
        success: false,
        error: 'Missing license key'
      });
      return;
    }

    // Sanitize and validate format
    const cleanKey = sanitizeKey(licenseKey);
    
    if (!isValidKeyFormat(cleanKey)) {
      await logValidation(cleanKey, false, ip, userAgent);
      res.status(400).json({
        success: false,
        error: 'Invalid license key format'
      });
      return;
    }

    // Check license in database
    const license = await getLicenseByKey(cleanKey);
    
    if (!license) {
      await logValidation(cleanKey, false, ip, userAgent);
      res.status(404).json({
        success: false,
        error: 'License key not found'
      });
      return;
    }

    // Check if revoked
    if (license.status === 'revoked') {
      await logValidation(cleanKey, false, ip, userAgent);
      res.status(403).json({
        success: false,
        error: 'License has been revoked',
        message: 'This license key has been revoked due to abuse or violation of terms.'
      });
      return;
    }

    // Check device limit
    if (license.device_count >= 3 && license.activated_at) {
      await logValidation(cleanKey, false, ip, userAgent);
      res.status(403).json({
        success: false,
        error: 'Device limit reached',
        message: 'This license key has reached the maximum of 3 devices.'
      });
      return;
    }

    // Activate license if first time
    if (!license.activated_at) {
      await activateLicense(cleanKey);
      await logValidation(cleanKey, true, ip, userAgent);
      
      res.status(200).json({
        success: true,
        message: 'License activated successfully',
        activated_at: new Date().toISOString(),
        device_count: 1
      });
      return;
    }

    // Check if we need to increment device count
    // (simple check: if last validated more than 7 days ago on a new device)
    const daysSinceLastValidation = license.last_validated_at 
      ? (Date.now() - new Date(license.last_validated_at).getTime()) / (1000 * 60 * 60 * 24)
      : 999;
    
    if (daysSinceLastValidation > 7 && license.device_count < 3) {
      // Might be a new device, increment count
      await incrementDeviceCount(cleanKey);
    } else {
      // Just update timestamp
      await updateValidationTimestamp(cleanKey);
    }

    await logValidation(cleanKey, true, ip, userAgent);

    // Return success
    res.status(200).json({
      success: true,
      message: 'License is valid',
      activated_at: license.activated_at,
      device_count: license.device_count
    });
    
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Validation failed',
      message: error.message
    });
  }
}
