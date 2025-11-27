const express = require('express');
const router = express.Router();
const pool = require('../db/postgresql');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get terms and conditions
router.get('/terms', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM legal_content WHERE type = $1 AND is_active = true ORDER BY updated_at DESC LIMIT 1',
      ['terms']
    );

    if (result.rows.length === 0) {
      return res.json({
        content: getDefaultTerms(),
        lastUpdated: new Date().toISOString()
      });
    }

    res.json({
      content: result.rows[0].content,
      lastUpdated: result.rows[0].updated_at
    });
  } catch (error) {
    console.error('Error fetching terms:', error);
    res.status(500).json({ error: 'Failed to fetch terms' });
  }
});

// Get privacy policy
router.get('/privacy', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM legal_content WHERE type = $1 AND is_active = true ORDER BY updated_at DESC LIMIT 1',
      ['privacy']
    );

    if (result.rows.length === 0) {
      return res.json({
        content: getDefaultPrivacy(),
        lastUpdated: new Date().toISOString()
      });
    }

    res.json({
      content: result.rows[0].content,
      lastUpdated: result.rows[0].updated_at
    });
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    res.status(500).json({ error: 'Failed to fetch privacy policy' });
  }
});

// Admin: Update legal content
router.put('/:type', authenticateToken, requireAdmin, async (req, res) => {
  const { type } = req.params;
  const { content } = req.body;

  if (!['terms', 'privacy'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }

  try {
    // Deactivate old versions
    await pool.query(
      'UPDATE legal_content SET is_active = false WHERE type = $1',
      [type]
    );

    // Insert new version
    const result = await pool.query(
      `INSERT INTO legal_content (type, content, updated_by, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [type, content, req.user.id]
    );

    res.json({
      message: 'Legal content updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating legal content:', error);
    res.status(500).json({ error: 'Failed to update legal content' });
  }
});

// Admin: Get all versions
router.get('/:type/versions', authenticateToken, requireAdmin, async (req, res) => {
  const { type } = req.params;

  try {
    const result = await pool.query(
      `SELECT lc.*, u.username as updated_by_name
       FROM legal_content lc
       LEFT JOIN users u ON lc.updated_by = u.id
       WHERE lc.type = $1
       ORDER BY lc.updated_at DESC`,
      [type]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

// Default terms content
function getDefaultTerms() {
  return `
    <div class="terms-content">
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
      <p>Permission is granted to temporarily use the Service for personal or commercial use. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
      <ul>
        <li>Modify or copy the materials</li>
        <li>Use the materials for any commercial purpose without authorization</li>
        <li>Attempt to decompile or reverse engineer any software contained in the Service</li>
        <li>Remove any copyright or other proprietary notations from the materials</li>
      </ul>

      <h2>4. User Accounts</h2>
      <p>When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.</p>
      <p>You are responsible for safeguarding the password and for all activities that occur under your account.</p>

      <h2>5. Data and Privacy</h2>
      <p>Your use of the Service is also governed by our Privacy Policy. We collect and use your data as described in our Privacy Policy.</p>

      <h2>6. Intellectual Property</h2>
      <p>The Service and its original content, features, and functionality are owned by Roastify and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>

      <h2>7. Termination</h2>
      <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

      <h2>8. Limitation of Liability</h2>
      <p>In no event shall Roastify, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>

      <h2>9. Changes to Terms</h2>
      <p>We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes by posting the new Terms on this page and updating the "Last updated" date.</p>

      <h2>10. Contact Us</h2>
      <p>If you have any questions about these Terms, please contact us at support@roastify.com</p>
    </div>
  `;
}

// Default privacy policy content
function getDefaultPrivacy() {
  return `
    <div class="terms-content">
      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly to us, including:</p>
      <ul>
        <li>Account information (name, email, password)</li>
        <li>Profile information</li>
        <li>Client and project data you create</li>
        <li>Usage data and analytics</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, maintain, and improve our services</li>
        <li>Process transactions and send related information</li>
        <li>Send technical notices and support messages</li>
        <li>Respond to your comments and questions</li>
      </ul>

      <h2>3. Data Security</h2>
      <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>

      <h2>4. Data Retention</h2>
      <p>We retain your information for as long as your account is active or as needed to provide you services.</p>

      <h2>5. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Correct inaccurate data</li>
        <li>Request deletion of your data</li>
        <li>Export your data</li>
      </ul>

      <h2>6. Contact Us</h2>
      <p>For privacy-related questions, contact us at privacy@roastify.com</p>
    </div>
  `;
}

module.exports = router;
