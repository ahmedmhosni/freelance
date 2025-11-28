const express = require('express');
const router = express.Router();
const pool = require('../db/postgresql');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * Get current version with date (public)
 */
router.get('/current-version', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT version, version_name, release_date
      FROM versions
      WHERE is_published = TRUE
      ORDER BY release_date DESC, id DESC
      LIMIT 1
    `);
    
    res.json({ 
      version: result.rows[0]?.version || '1.0.0',
      version_name: result.rows[0]?.version_name || null,
      release_date: result.rows[0]?.release_date || new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error fetching current version:', error);
    res.json({ 
      version: '1.0.0',
      version_name: null,
      release_date: new Date().toISOString().split('T')[0]
    });
  }
});

/**
 * Get public changelog (published versions with items)
 */
router.get('/public', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get published versions
    const versionsResult = await pool.query(`
      SELECT id, version, version_name, release_date, is_major_release
      FROM versions
      WHERE is_published = TRUE
      ORDER BY release_date DESC, id DESC
      LIMIT $1
    `, [limit]);
    
    const versions = versionsResult.rows;
    
    // Get items for each version
    for (const version of versions) {
      const itemsResult = await pool.query(`
        SELECT id, category, title, description
        FROM changelog_items
        WHERE version_id = $1
        ORDER BY sort_order, id
      `, [version.id]);
      
      version.items = itemsResult.rows;
      
      // Group items by category
      version.grouped = {
        features: itemsResult.rows.filter(i => i.category === 'feature'),
        improvements: itemsResult.rows.filter(i => i.category === 'improvement'),
        fixes: itemsResult.rows.filter(i => i.category === 'fix'),
        design: itemsResult.rows.filter(i => i.category === 'design'),
        security: itemsResult.rows.filter(i => i.category === 'security')
      };
    }
    
    res.json({ versions });
  } catch (error) {
    console.error('Error fetching changelog:', error);
    res.status(500).json({ error: 'Failed to fetch changelog' });
  }
});

/**
 * Get all versions (admin only)
 */
router.get('/admin/versions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.*,
        u.name as created_by_name,
        COUNT(ci.id) as items_count
      FROM versions v
      LEFT JOIN users u ON v.created_by = u.id
      LEFT JOIN changelog_items ci ON v.id = ci.version_id
      GROUP BY v.id, u.name
      ORDER BY v.release_date DESC, v.id DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

/**
 * Get version with items (admin only)
 */
router.get('/admin/versions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const versionResult = await pool.query(`
      SELECT v.*, u.name as created_by_name
      FROM versions v
      LEFT JOIN users u ON v.created_by = u.id
      WHERE v.id = $1
    `, [id]);
    
    if (versionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Version not found' });
    }
    
    const version = versionResult.rows[0];
    
    const itemsResult = await pool.query(`
      SELECT *
      FROM changelog_items
      WHERE version_id = $1
      ORDER BY sort_order, id
    `, [id]);
    
    version.items = itemsResult.rows;
    
    res.json(version);
  } catch (error) {
    console.error('Error fetching version:', error);
    res.status(500).json({ error: 'Failed to fetch version' });
  }
});

/**
 * Create version (admin only)
 */
router.post('/admin/versions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { version, version_name, release_date, published, is_major_release } = req.body;
    
    const result = await pool.query(`
      INSERT INTO versions (version, version_name, release_date, is_published, is_major_release, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [version, version_name || null, release_date, published || false, is_major_release || false, req.user.id]);
    
    // Mark version name as used if provided
    if (version_name) {
      await pool.query(`
        UPDATE version_names 
        SET is_used = TRUE, used_at = CURRENT_TIMESTAMP 
        WHERE name = $1 AND name_type = $2
      `, [version_name, is_major_release ? 'major' : 'minor']);
    }
    
    res.json({ 
      message: 'Version created successfully',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Error creating version:', error);
    if (error.message.includes('unique')) {
      res.status(400).json({ error: 'Version already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create version' });
    }
  }
});

/**
 * Update version (admin only)
 */
router.put('/admin/versions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { version, version_name, release_date, published, is_major_release } = req.body;
    
    // Get old version name to unmark it if changed
    const oldVersion = await pool.query('SELECT version_name, is_major_release FROM versions WHERE id = $1', [id]);
    const oldVersionName = oldVersion.rows[0]?.version_name;
    const oldIsMajor = oldVersion.rows[0]?.is_major_release;
    
    await pool.query(`
      UPDATE versions
      SET version = $1, version_name = $2, release_date = $3, is_published = $4, is_major_release = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `, [version, version_name || null, release_date, published || false, is_major_release || false, id]);
    
    // Unmark old name if it changed
    if (oldVersionName && oldVersionName !== version_name) {
      await pool.query(`
        UPDATE version_names 
        SET is_used = FALSE, used_at = NULL 
        WHERE name = $1 AND name_type = $2
      `, [oldVersionName, oldIsMajor ? 'major' : 'minor']);
    }
    
    // Mark new name as used if provided
    if (version_name && version_name !== oldVersionName) {
      await pool.query(`
        UPDATE version_names 
        SET is_used = TRUE, used_at = CURRENT_TIMESTAMP 
        WHERE name = $1 AND name_type = $2
      `, [version_name, is_major_release ? 'major' : 'minor']);
    }
    
    res.json({ message: 'Version updated successfully' });
  } catch (error) {
    console.error('Error updating version:', error);
    if (error.message.includes('unique')) {
      res.status(400).json({ error: 'Version already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update version' });
    }
  }
});

/**
 * Delete version (admin only)
 */
router.delete('/admin/versions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM versions WHERE id = $1', [id]);
    res.json({ message: 'Version deleted successfully' });
  } catch (error) {
    console.error('Error deleting version:', error);
    res.status(500).json({ error: 'Failed to delete version' });
  }
});

/**
 * Toggle publish status (admin only)
 */
router.patch('/admin/versions/:id/publish', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { published } = req.body;
    
    await pool.query(`
      UPDATE versions
      SET is_published = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [published || false, id]);
    
    res.json({ message: 'Publish status updated successfully' });
  } catch (error) {
    console.error('Error updating publish status:', error);
    res.status(500).json({ error: 'Failed to update publish status' });
  }
});

/**
 * Add item to version (admin only)
 */
router.post('/admin/versions/:id/items', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, title, description } = req.body;
    
    const result = await pool.query(`
      INSERT INTO changelog_items (version_id, category, title, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [id, category, title, description || null]);
    
    res.json({ 
      message: 'Item added successfully',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

/**
 * Update item (admin only)
 */
router.put('/admin/items/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, title, description } = req.body;
    
    await pool.query(`
      UPDATE changelog_items
      SET category = $1, title = $2, description = $3
      WHERE id = $4
    `, [category, title, description || null, id]);
    
    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

/**
 * Delete item (admin only)
 */
router.delete('/admin/items/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM changelog_items WHERE id = $1', [id]);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

/**
 * Sync git commits (admin only)
 */
router.post('/admin/sync-commits', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { execSync } = require('child_process');
    const fs = require('fs');
    const path = require('path');
    
    // Check if .git directory exists (only works in development)
    const gitDir = path.join(__dirname, '../../.git');
    if (!fs.existsSync(gitDir)) {
      return res.status(400).json({ 
        error: 'Git repository not available',
        message: 'Git sync only works in development environment. In production, create versions manually.'
      });
    }
    
    // Get last synced commit
    const syncStatus = await pool.query('SELECT last_synced_commit FROM git_sync_status WHERE id = 1');
    const lastCommit = syncStatus.rows[0]?.last_synced_commit;
    
    // Get new commits since last sync
    let gitCommand = 'git log --format="%H|%an|%ae|%cd|%s" --date=iso --no-merges';
    if (lastCommit) {
      gitCommand += ` ${lastCommit}..HEAD`;
    } else {
      gitCommand += ' -50'; // Get last 50 commits on first sync
    }
    
    let commits;
    try {
      commits = execSync(gitCommand, { encoding: 'utf-8', cwd: path.join(__dirname, '../..') })
        .trim()
        .split('\n')
        .filter(line => line);
    } catch (gitError) {
      return res.status(400).json({ 
        error: 'Git command failed',
        message: 'Unable to execute git commands. Make sure git is installed and you are in a git repository.'
      });
    }
    
    if (commits.length === 0 || (commits.length === 1 && !commits[0])) {
      return res.json({ 
        message: 'No new commits to sync',
        newCommits: 0
      });
    }
    
    let newCommitsCount = 0;
    
    for (const line of commits) {
      if (!line) continue;
      
      const parts = line.split('|');
      if (parts.length < 5) continue;
      
      const [hash, author, email, date, ...messageParts] = parts;
      const message = messageParts.join('|'); // In case message contains |
      
      // Skip noise commits
      const lowerMessage = message.toLowerCase();
      if (
        lowerMessage.match(/^(merge|wip|temp|test|debug|minor|typo|formatting)/i) ||
        message.length < 10
      ) {
        continue;
      }
      
      // Insert commit
      await pool.query(`
        INSERT INTO git_commits (commit_hash, commit_message, commit_date, author_name, author_email, is_processed)
        VALUES ($1, $2, $3, $4, $5, FALSE)
        ON CONFLICT (commit_hash) DO NOTHING
      `, [hash, message.trim(), date, author, email]);
      
      newCommitsCount++;
    }
    
    // Update last synced commit
    if (commits.length > 0 && commits[0]) {
      const latestHash = commits[0].split('|')[0];
      await pool.query(`
        UPDATE git_sync_status 
        SET last_synced_commit = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = 1
      `, [latestHash]);
    }
    
    res.json({ 
      message: 'Commits synced successfully',
      newCommits: newCommitsCount
    });
  } catch (error) {
    console.error('Error syncing commits:', error);
    res.status(500).json({ 
      error: 'Failed to sync commits',
      message: error.message 
    });
  }
});

/**
 * Get unprocessed commits (admin only)
 */
router.get('/admin/pending-commits', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        commit_hash,
        commit_message,
        commit_date,
        author_name,
        author_email
      FROM git_commits
      WHERE is_processed = FALSE
      ORDER BY commit_date DESC
      LIMIT 100
    `);
    
    res.json({ commits: result.rows });
  } catch (error) {
    console.error('Error fetching pending commits:', error);
    res.status(500).json({ error: 'Failed to fetch pending commits' });
  }
});

/**
 * Mark commits as processed when version is created (admin only)
 */
router.post('/admin/mark-commits-processed', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { commitIds, versionId } = req.body;
    
    await pool.query(`
      UPDATE git_commits
      SET is_processed = TRUE, version_id = $1
      WHERE id = ANY($2::int[])
    `, [versionId, commitIds]);
    
    res.json({ message: 'Commits marked as processed' });
  } catch (error) {
    console.error('Error marking commits:', error);
    res.status(500).json({ error: 'Failed to mark commits' });
  }
});

/**
 * Get version names (admin only)
 */
router.get('/admin/version-names', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, unused_only } = req.query; // 'minor' or 'major', 'true' or 'false'
    
    let query = 'SELECT * FROM version_names WHERE is_active = TRUE';
    const params = [];
    
    if (type) {
      query += ' AND name_type = $1';
      params.push(type);
    }
    
    // Only return unused names if requested
    if (unused_only === 'true') {
      query += ' AND is_used = FALSE';
    }
    
    query += ' ORDER BY sort_order, name';
    
    const result = await pool.query(query, params);
    res.json({ names: result.rows });
  } catch (error) {
    console.error('Error fetching version names:', error);
    res.status(500).json({ error: 'Failed to fetch version names' });
  }
});

/**
 * Add version name (admin only)
 */
router.post('/admin/version-names', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, name_type, description } = req.body;
    
    // Get max sort_order for this type
    const maxOrder = await pool.query(
      'SELECT COALESCE(MAX(sort_order), 0) as max FROM version_names WHERE name_type = $1',
      [name_type]
    );
    
    const result = await pool.query(`
      INSERT INTO version_names (name, name_type, sort_order, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, name_type, maxOrder.rows[0].max + 1, description || null]);
    
    res.json({ 
      message: 'Version name added successfully',
      name: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding version name:', error);
    if (error.message.includes('unique')) {
      res.status(400).json({ error: 'Name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add version name' });
    }
  }
});

/**
 * Update version name (admin only)
 */
router.put('/admin/version-names/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sort_order } = req.body;
    
    await pool.query(`
      UPDATE version_names
      SET name = $1, description = $2, sort_order = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [name, description || null, sort_order, id]);
    
    res.json({ message: 'Version name updated successfully' });
  } catch (error) {
    console.error('Error updating version name:', error);
    res.status(500).json({ error: 'Failed to update version name' });
  }
});

/**
 * Delete version name (admin only)
 */
router.delete('/admin/version-names/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM version_names WHERE id = $1', [id]);
    res.json({ message: 'Version name deleted successfully' });
  } catch (error) {
    console.error('Error deleting version name:', error);
    res.status(500).json({ error: 'Failed to delete version name' });
  }
});

module.exports = router;
