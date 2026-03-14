// Vercel Postgres Database Utilities
import { sql } from '@vercel/postgres';

/**
 * Create a new license in the database
 * @param {string} licenseKey - Generated license key
 * @param {string} lsOrderId - Lemon Squeezy order ID
 * @returns {Promise<Object>} Created license object
 */
export async function createLicense(licenseKey, lsOrderId) {
  try {
    const result = await sql`
      INSERT INTO licenses (license_key, ls_order_id, created_at)
      VALUES (${licenseKey}, ${lsOrderId}, NOW())
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating license:', error);
    throw new Error('Failed to create license');
  }
}

/**
 * Get license by key
 * @param {string} licenseKey - License key to find
 * @returns {Promise<Object|null>} License object or null
 */
export async function getLicenseByKey(licenseKey) {
  try {
    const result = await sql`
      SELECT * FROM licenses
      WHERE license_key = ${licenseKey}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting license:', error);
    throw new Error('Failed to get license');
  }
}

/**
 * Get license by Lemon Squeezy order ID
 * @param {string} lsOrderId - Lemon Squeezy order ID
 * @returns {Promise<Object|null>} License object or null
 */
export async function getLicenseByOrderId(lsOrderId) {
  try {
    const result = await sql`
      SELECT * FROM licenses
      WHERE ls_order_id = ${lsOrderId}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting license by order ID:', error);
    throw new Error('Failed to get license');
  }
}

/**
 * Activate a license (first time use)
 * @param {string} licenseKey - License key to activate
 * @returns {Promise<Object>} Updated license object
 */
export async function activateLicense(licenseKey) {
  try {
    const result = await sql`
      UPDATE licenses
      SET activated_at = NOW(), device_count = 1, last_validated_at = NOW()
      WHERE license_key = ${licenseKey} AND activated_at IS NULL
      RETURNING *
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error activating license:', error);
    throw new Error('Failed to activate license');
  }
}

/**
 * Increment device count for a license
 * @param {string} licenseKey - License key
 * @returns {Promise<Object>} Updated license object
 */
export async function incrementDeviceCount(licenseKey) {
  try {
    const result = await sql`
      UPDATE licenses
      SET device_count = device_count + 1, last_validated_at = NOW()
      WHERE license_key = ${licenseKey} AND device_count < 3
      RETURNING *
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error incrementing device count:', error);
    throw new Error('Failed to increment device count');
  }
}

/**
 * Update last validated timestamp
 * @param {string} licenseKey - License key
 * @returns {Promise<void>}
 */
export async function updateValidationTimestamp(licenseKey) {
  try {
    await sql`
      UPDATE licenses
      SET last_validated_at = NOW()
      WHERE license_key = ${licenseKey}
    `;
  } catch (error) {
    console.error('Error updating validation timestamp:', error);
  }
}

/**
 * Revoke a license
 * @param {string} licenseKey - License key to revoke
 * @returns {Promise<Object>} Updated license object
 */
export async function revokeLicense(licenseKey) {
  try {
    const result = await sql`
      UPDATE licenses
      SET status = 'revoked'
      WHERE license_key = ${licenseKey}
      RETURNING *
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error revoking license:', error);
    throw new Error('Failed to revoke license');
  }
}

/**
 * Log a validation attempt
 * @param {string} licenseKey - License key
 * @param {boolean} success - Whether validation succeeded
 * @param {string} ipAddress - IP address
 * @param {string} userAgent - User agent
 * @returns {Promise<void>}
 */
export async function logValidation(licenseKey, success, ipAddress = null, userAgent = null) {
  try {
    await sql`
      INSERT INTO validation_logs (license_key, success, ip_address, user_agent, validated_at)
      VALUES (${licenseKey}, ${success}, ${ipAddress}, ${userAgent}, NOW())
    `;
  } catch (error) {
    console.error('Error logging validation:', error);
    // Don't throw - logging should not break validation
  }
}

/**
 * Check if license key already exists (for collision detection)
 * @param {string} licenseKey - License key to check
 * @returns {Promise<boolean>} True if exists
 */
export async function licenseKeyExists(licenseKey) {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM licenses
      WHERE license_key = ${licenseKey}
    `;
    return result.rows[0].count > 0;
  } catch (error) {
    console.error('Error checking license existence:', error);
    return false;
  }
}
