// Vercel Serverless Function - Create Lemon Squeezy Checkout
// Route: /api/checkout

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
    const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
    const LEMONSQUEEZY_VARIANT_ID = process.env.LEMONSQUEEZY_VARIANT_ID;
    const SUCCESS_URL = process.env.SUCCESS_URL || 'https://backend-quickreact.vercel.app/success';
    
    if (!LEMONSQUEEZY_STORE_ID || !LEMONSQUEEZY_VARIANT_ID) {
      throw new Error('Lemon Squeezy configuration missing');
    }

    // Create checkout URL
    // Lemon Squeezy uses a simple URL format for checkouts
    const checkoutUrl = `https://quickreact.lemonsqueezy.com/checkout/buy/${LEMONSQUEEZY_VARIANT_ID}`;
    
    // Add custom data to track in webhook
    const customData = {
      source: 'extension',
      timestamp: Date.now()
    };
    
    // Full checkout URL with redirect
    const fullUrl = `${checkoutUrl}?checkout[custom][source]=extension&checkout[custom][timestamp]=${customData.timestamp}&redirect_url=${encodeURIComponent(SUCCESS_URL)}`;
    
    res.status(200).json({
      success: true,
      checkoutUrl: fullUrl
    });
    
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      error: 'Failed to create checkout',
      message: error.message
    });
  }
}
