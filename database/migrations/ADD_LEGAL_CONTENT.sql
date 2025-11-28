-- Create legal_content table for Terms and Privacy Policy
CREATE TABLE IF NOT EXISTS legal_content (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('terms', 'privacy')),
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_legal_content_type_active ON legal_content(type, is_active);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_legal_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_legal_content_updated_at
    BEFORE UPDATE ON legal_content
    FOR EACH ROW
    EXECUTE FUNCTION update_legal_content_updated_at();

-- Insert default terms and conditions
INSERT INTO legal_content (type, content, is_active) VALUES
('terms', '<div class="terms-content">
  <h2>1. Acceptance of Terms</h2>
  <p>By accessing and using Roastify ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.</p>

  <h2>2. Early Access Program</h2>
  <p>Roastify is currently in early access. By participating in our early access program, you acknowledge that:</p>
  <ul>
    <li>The Service is provided "as is" and may contain bugs or incomplete features</li>
    <li>Features and functionality may change without notice</li>
    <li>Early access users receive free lifetime access to core features</li>
    <li>We may limit the number of early access participants</li>
  </ul>

  <h2>3. Use License</h2>
  <p>Permission is granted to temporarily use the Service for personal or commercial use.</p>

  <h2>4. User Accounts</h2>
  <p>When you create an account with us, you must provide accurate, complete, and current information.</p>

  <h2>5. Contact Us</h2>
  <p>If you have any questions about these Terms, please contact us at support@roastify.com</p>
</div>', true);

-- Insert default privacy policy
INSERT INTO legal_content (type, content, is_active) VALUES
('privacy', '<div class="terms-content">
  <h2>1. Information We Collect</h2>
  <p>We collect information you provide directly to us.</p>

  <h2>2. How We Use Your Information</h2>
  <p>We use the information we collect to provide and improve our services.</p>

  <h2>3. Contact Us</h2>
  <p>For privacy-related questions, contact us at support@roastify.com</p>
</div>', true);
