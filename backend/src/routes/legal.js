const express = require('express');
const router = express.Router();
const { query } = require('../db/postgresql');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get terms and conditions
router.get('/terms', async (req, res) => {
  try {
    const result = await query(
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
    // Return default terms if table doesn't exist
    res.json({
      content: getDefaultTerms(),
      lastUpdated: new Date().toISOString()
    });
  }
});

// Get privacy policy
router.get('/privacy', async (req, res) => {
  try {
    const result = await query(
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
    // Return default privacy if table doesn't exist
    res.json({
      content: getDefaultPrivacy(),
      lastUpdated: new Date().toISOString()
    });
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
    await query(
      'UPDATE legal_content SET is_active = false WHERE type = $1',
      [type]
    );

    // Insert new version
    const result = await query(
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
    const result = await query(
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
      <p>Your use of the Service is also governed by our Privacy Policy. We are committed to protecting your privacy and complying with GDPR and other data protection regulations.</p>
      
      <h3>5.1 Your Data Rights</h3>
      <p>Under GDPR and applicable data protection laws, you have the right to:</p>
      <ul>
        <li>Access, correct, and update your personal data</li>
        <li>Export all your data in a portable format</li>
        <li>Delete your account and all associated data</li>
        <li>Control your email preferences and opt-out of marketing communications</li>
        <li>Object to processing of your data for certain purposes</li>
      </ul>
      <p>You can exercise these rights directly from your account settings or by contacting us at support@roastify.com</p>

      <h3>5.2 Data Processing</h3>
      <p>We process your data only for the purposes necessary to provide our services, improve user experience, and comply with legal obligations. We do not sell your personal data to third parties.</p>

      <h2>6. Intellectual Property</h2>
      <p>The Service and its original content, features, and functionality are owned by Roastify and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>

      <h2>7. Termination</h2>
      <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

      <h2>8. Limitation of Liability</h2>
      <p>In no event shall Roastify, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>

      <h2>9. Changes to Terms</h2>
      <p>We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes by posting the new Terms on this page and updating the "Last updated" date.</p>

      <h2>10. GDPR Compliance</h2>
      <p>We are committed to complying with the General Data Protection Regulation (GDPR) and other applicable data protection laws. This includes:</p>
      <ul>
        <li>Transparent data processing practices</li>
        <li>Secure storage and handling of personal data</li>
        <li>Respecting your data rights and preferences</li>
        <li>Providing tools to manage, export, and delete your data</li>
        <li>Notifying you of any data breaches within 72 hours</li>
      </ul>

      <h2>11. Contact Us</h2>
      <p>If you have any questions about these Terms, please contact us at support@roastify.com</p>
      
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
        <strong>Last Updated:</strong> November 28, 2025<br>
        <strong>GDPR Compliant:</strong> Yes
      </p>
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

      <h2>5. GDPR Compliance & Your Rights</h2>
      <p>We are committed to protecting your privacy and complying with the General Data Protection Regulation (GDPR) and other applicable data protection laws.</p>
      
      <h3>5.1 Your Data Rights</h3>
      <p>You have the following rights regarding your personal data:</p>
      <ul>
        <li><strong>Right to Access:</strong> You can access all your personal data at any time through your profile</li>
        <li><strong>Right to Rectification:</strong> You can update and correct your information in your account settings</li>
        <li><strong>Right to Data Portability:</strong> You can export all your data in JSON format from your profile page</li>
        <li><strong>Right to Erasure:</strong> You can delete your account and all associated data at any time</li>
        <li><strong>Right to Object:</strong> You can opt-out of marketing emails and control your email preferences</li>
        <li><strong>Right to Restriction:</strong> You can request restriction of processing by contacting us</li>
      </ul>

      <h3>5.2 How to Exercise Your Rights</h3>
      <p>You can exercise these rights directly from your account:</p>
      <ul>
        <li><strong>Export Your Data:</strong> Go to Profile → Data & Privacy → Request Data Export</li>
        <li><strong>Delete Your Account:</strong> Go to Profile → Data & Privacy → Delete Account</li>
        <li><strong>Email Preferences:</strong> Go to Profile → Email Preferences</li>
        <li><strong>Update Information:</strong> Go to Profile → Edit your information</li>
      </ul>

      <h3>5.3 Data Processing</h3>
      <p>We process your data based on the following legal grounds:</p>
      <ul>
        <li><strong>Contract Performance:</strong> To provide our services to you</li>
        <li><strong>Legitimate Interest:</strong> To improve our services and prevent fraud</li>
        <li><strong>Consent:</strong> For marketing communications (you can withdraw consent anytime)</li>
        <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
      </ul>

      <h3>5.4 Data Retention</h3>
      <p>We retain your data as follows:</p>
      <ul>
        <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
        <li><strong>Deleted Accounts:</strong> Data anonymized and retained for 30 days for recovery purposes</li>
        <li><strong>Legal Requirements:</strong> Some data may be retained longer to comply with legal obligations</li>
        <li><strong>Backups:</strong> Data in backups is deleted according to our backup retention policy</li>
      </ul>

      <h3>5.5 International Data Transfers</h3>
      <p>Your data is stored on servers located in the European Union (Azure Europe regions). If data is transferred outside the EU, we ensure appropriate safeguards are in place.</p>

      <h3>5.6 Automated Decision Making</h3>
      <p>We do not use automated decision-making or profiling that produces legal effects concerning you.</p>

      <h2>6. Email Communications</h2>
      <p>We send the following types of emails:</p>
      <ul>
        <li><strong>Transactional Emails:</strong> Account-related, security alerts, password resets (cannot be disabled)</li>
        <li><strong>Notification Emails:</strong> Task reminders, invoice updates (can be disabled in preferences)</li>
        <li><strong>Marketing Emails:</strong> Product updates, tips, offers (can be disabled in preferences)</li>
        <li><strong>Platform Updates:</strong> New features, announcements (can be disabled in preferences)</li>
      </ul>
      <p>You can manage your email preferences in your profile settings or use the unsubscribe link in any email.</p>

      <h2>7. Data Breach Notification</h2>
      <p>In the event of a data breach that affects your personal data, we will notify you and relevant authorities within 72 hours as required by GDPR.</p>

      <h2>8. Children's Privacy</h2>
      <p>Our service is not intended for children under 16. We do not knowingly collect personal information from children under 16.</p>

      <h2>9. Changes to This Policy</h2>
      <p>We may update this privacy policy from time to time. We will notify you of any material changes by email or through the service.</p>

      <h2>10. Contact Us</h2>
      <p>For privacy-related questions or to exercise your rights, contact us at:</p>
      <ul>
        <li><strong>Email:</strong> support@roastify.com</li>
        <li><strong>Data Protection Officer:</strong> Available upon request</li>
        <li><strong>Response Time:</strong> We respond to all requests within 30 days</li>
      </ul>

      <h2>11. Supervisory Authority</h2>
      <p>If you are located in the EU/EEA, you have the right to lodge a complaint with your local data protection supervisory authority.</p>

      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
        <strong>Last Updated:</strong> November 28, 2025<br>
        <strong>GDPR Compliant:</strong> Yes<br>
        <strong>Data Controller:</strong> Roastify
      </p>
    </div>
  `;
}

module.exports = router;
