-- QuickReact Premium License Database Schema
-- Database: Vercel Postgres

-- Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key VARCHAR(24) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at TIMESTAMP DEFAULT NOW(),
  activated_at TIMESTAMP,
  ls_order_id VARCHAR(255) UNIQUE,
  device_count INTEGER DEFAULT 0,
  last_validated_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_license_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_ls_order_id ON licenses(ls_order_id);
CREATE INDEX IF NOT EXISTS idx_status ON licenses(status);

-- Create validation logs table (optional, for abuse detection)
CREATE TABLE IF NOT EXISTS validation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key VARCHAR(24) NOT NULL,
  validated_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_validation_license ON validation_logs(license_key);
CREATE INDEX IF NOT EXISTS idx_validation_time ON validation_logs(validated_at);

-- Sample query to check license
-- SELECT * FROM licenses WHERE license_key = 'QR-XXXX-XXXX-XXXX-XXXX' AND status = 'active';

-- Sample query to count devices
-- SELECT device_count FROM licenses WHERE license_key = 'QR-XXXX-XXXX-XXXX-XXXX';

-- Sample query to revoke license
-- UPDATE licenses SET status = 'revoked' WHERE license_key = 'QR-XXXX-XXXX-XXXX-XXXX';
