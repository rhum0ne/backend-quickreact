// Vercel Serverless Function - Quick License Status Check
// Route: /api/check-license

import { getLicenseByKey } from '../lib/database.js';
import { isValidKeyFormat, sanitizeKey } from '../lib/license.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get license key from query
    const { key } = req.query;
    
    if (!key) {
      res.status(400).json({
        valid: false,
        error: 'Missing license key'
      });
      return;
    }

    // Sanitize and validate format
    const cleanKey = sanitizeKey(key);
    
    if (!isValidKeyFormat(cleanKey)) {
      res.status(200).json({
        valid: false,
        error: 'Invalid format'
      });
      return;
    }

    // Check license in database
    const license = await getLicenseByKey(cleanKey);
    
    if (!license) {
      res.status(200).json({
        valid: false,
        error: 'Not found'
      });
      return;
    }

    // Return status
    res.status(200).json({
      valid: license.status === 'active',
      status: license.status,
      activated: !!license.activated_at
    });
    
  } catch (error) {
    console.error('Check license error:', error);
    res.status(500).json({
      valid: false,
      error: 'Check failed'
    });
  }
}
