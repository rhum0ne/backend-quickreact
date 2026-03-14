// License Key Generation and Validation Utilities
import crypto from 'crypto';

/**
 * Generate a unique license key in format: QR-XXXX-XXXX-XXXX-XXXX
 * @returns {string} A 20-character license key
 */
export function generateLicenseKey() {
  // Generate 16 random bytes
  const randomBytes = crypto.randomBytes(12);
  
  // Convert to base36 (alphanumeric) and format
  const chars = randomBytes.toString('base36').toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Ensure we have enough characters
  const paddedChars = (chars + crypto.randomBytes(8).toString('base36').toUpperCase()).slice(0, 16);
  
  // Format as QR-XXXX-XXXX-XXXX-XXXX
  const formatted = `QR-${paddedChars.slice(0, 4)}-${paddedChars.slice(4, 8)}-${paddedChars.slice(8, 12)}-${paddedChars.slice(12, 16)}`;
  
  return formatted;
}

/**
 * Validate license key format
 * @param {string} key - License key to validate
 * @returns {boolean} True if format is valid
 */
export function isValidKeyFormat(key) {
  if (!key || typeof key !== 'string') return false;
  
  // Check format: QR-XXXX-XXXX-XXXX-XXXX (20 chars total)
  const regex = /^QR-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return regex.test(key);
}

/**
 * Sanitize license key (remove spaces, convert to uppercase)
 * @param {string} key - License key to sanitize
 * @returns {string} Sanitized key
 */
export function sanitizeKey(key) {
  if (!key) return '';
  return key.trim().toUpperCase().replace(/\s+/g, '');
}

/**
 * Generate HMAC signature for webhook validation
 * @param {string} payload - Webhook payload
 * @param {string} secret - Webhook secret
 * @returns {string} HMAC signature
 */
export function generateWebhookSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Verify webhook signature
 * @param {string} payload - Webhook payload
 * @param {string} signature - Signature to verify
 * @param {string} secret - Webhook secret
 * @returns {boolean} True if signature is valid
 */
export function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
