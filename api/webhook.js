// Vercel Serverless Function - Lemon Squeezy Webhook Handler
// Route: /api/webhook

import crypto from 'crypto';
import { createLicense, getLicenseByOrderId } from '../lib/database.js';
import { generateLicenseKey, licenseKeyExists } from '../lib/license.js';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      throw new Error('Webhook secret not configured');
    }

    // Get signature from headers
    const signature = req.headers['x-signature'];
    if (!signature) {
      res.status(401).json({ error: 'Missing signature' });
      return;
    }

    // Verify webhook signature
    const payload = JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const digest = hmac.update(payload).digest('hex');
    
    if (signature !== digest) {
      console.error('Invalid webhook signature');
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // Parse webhook event
    const event = req.body;
    const eventName = event.meta?.event_name;
    
    console.log('Webhook received:', eventName);

    // Handle order_created event
    if (eventName === 'order_created') {
      const orderId = event.data?.id;
      const orderData = event.data?.attributes;
      
      if (!orderId) {
        throw new Error('Missing order ID');
      }

      // Check if license already exists for this order
      const existingLicense = await getLicenseByOrderId(orderId);
      if (existingLicense) {
        console.log('License already exists for order:', orderId);
        res.status(200).json({
          success: true,
          message: 'License already exists',
          license_key: existingLicense.license_key
        });
        return;
      }

      // Generate unique license key
      let licenseKey;
      let attempts = 0;
      do {
        licenseKey = generateLicenseKey();
        attempts++;
        if (attempts > 10) {
          throw new Error('Failed to generate unique license key');
        }
      } while (await licenseKeyExists(licenseKey));

      // Create license in database
      const license = await createLicense(licenseKey, orderId);
      
      console.log('License created:', licenseKey, 'for order:', orderId);

      // Return license key (Lemon Squeezy can display this to user)
      res.status(200).json({
        success: true,
        license_key: licenseKey,
        order_id: orderId
      });
      
    } else {
      // Other events - just acknowledge
      console.log('Unhandled event:', eventName);
      res.status(200).json({ success: true, message: 'Event received' });
    }
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
}
