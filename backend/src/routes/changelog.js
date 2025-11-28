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
      SELECT version, release_date
      FROM versions
      WHERE is_published = TRUE
      ORDER BY release_date DESC, id DESC
      LIMIT 1
    `);
    
    res.json({ 
      version: result.rows[0]?.version || '1.0.0',
      release_date: result.rows[0]?.release_date || new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error fetching current version:', error);
    res.json({ 
      version: '1.0.0',
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
      SELECT id, version, release_date
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
    const { version, release_date, published } = req.body;
    
    const result = await pool.query(`
      INSERT INTO versions (version, release_date, is_published, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [version, release_date, published || false, req.user.id]);
    
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
    const { version, release_date, published } = req.body;
    
    await pool.query(`
      UPDATE versions
      SET version = $1, release_date = $2, is_published = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [version, release_date, published || false, id]);
    
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
    
    const commits = execSync(gitCommand, { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(line => line);
    
    let newCommitsCount = 0;
    
    for (const line of commits) {
      const [hash, author, email, date, message] = line.split('|');
      
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
    if (commits.length > 0) {
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
    res.status(500).json({ error: 'Failed to sync commits' });
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

module.exports = router;
