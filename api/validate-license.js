// Vercel Serverless Function - Validate License Key with Lemon Squeezy
// Route: /api/validate-license

export default async function handler(req, res) {
  // CORS headers
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
    const { licenseKey } = req.body;
    
    if (!licenseKey) {
      res.status(400).json({
        success: false,
        message: 'License key is required'
      });
      return;
    }

    const API_KEY = process.env.LEMONSQUEEZY_API_KEY;
    
    if (!API_KEY) {
      throw new Error('Lemon Squeezy API key not configured');
    }

    // Validate license key format (UUID format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX)
    const keyFormat = /^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}$/i;
    if (!keyFormat.test(licenseKey.trim())) {
      res.status(400).json({
        success: false,
        message: 'Invalid license key format. Expected UUID format.'
      });
      return;
    }

    // Call Lemon Squeezy API to validate license
    const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        license_key: licenseKey.trim()
      })
    });

    const data = await response.json();

    // Check if validation was successful
    if (!response.ok) {
      console.error('Lemon Squeezy API error:', data);
      res.status(400).json({
        success: false,
        message: data.error || 'License validation failed'
      });
      return;
    }

    // Check license status
    if (data.valid && data.license_key.status === 'active') {
      // Get activation info
      const activationCount = data.meta?.activation_usage || 0;
      const activationLimit = data.meta?.activation_limit || 3;
      
      res.status(200).json({
        success: true,
        message: 'License is valid and active',
        valid: true,
        status: data.license_key.status,
        activation_count: activationCount,
        activation_limit: activationLimit,
        can_activate: activationCount < activationLimit
      });
    } else if (data.license_key.status === 'inactive') {
      res.status(403).json({
        success: false,
        message: 'License key has been deactivated',
        valid: false,
        status: 'inactive'
      });
    } else if (data.license_key.status === 'expired') {
      res.status(403).json({
        success: false,
        message: 'License key has expired',
        valid: false,
        status: 'expired'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid license key',
        valid: false
      });
    }

  } catch (error) {
    console.error('License validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during license validation'
    });
  }
}
