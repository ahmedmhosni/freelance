const express = require('express');
const router = express.Router();
const { execSync } = require('child_process');

/**
 * Get version information from git
 */
function getVersionInfo() {
  try {
    // Get latest commit hash (short)
    const commitHash = execSync('git rev-parse --short HEAD', {
      encoding: 'utf-8',
    }).trim();

    // Get commit count (build number)
    const buildNumber = execSync('git rev-list --count HEAD', {
      encoding: 'utf-8',
    }).trim();

    // Get latest commit date
    const commitDate = execSync('git log -1 --format=%cd --date=short', {
      encoding: 'utf-8',
    }).trim();

    // Get latest commit message
    const commitMessage = execSync('git log -1 --format=%s', {
      encoding: 'utf-8',
    }).trim();

    // Get branch name
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8',
    }).trim();

    // Get last 10 commits with messages
    const recentCommits = execSync(
      'git log -10 --format="%h|%cd|%s" --date=short',
      { encoding: 'utf-8' }
    )
      .trim()
      .split('\n')
      .map((line) => {
        const [hash, date, message] = line.split('|');
        return { hash, date, message: parseCommitMessage(message) };
      });

    // Generate semantic version (v1.0.buildNumber)
    const version = `v1.0.${buildNumber}`;

    return {
      version,
      buildNumber: parseInt(buildNumber),
      commitHash,
      commitDate,
      commitMessage: parseCommitMessage(commitMessage),
      branch,
      recentCommits,
      environment: process.env.NODE_ENV || 'development',
    };
  } catch (error) {
    console.error('Error getting version info:', error);
    return {
      version: 'v1.0.0',
      buildNumber: 0,
      commitHash: 'unknown',
      commitDate: new Date().toISOString().split('T')[0],
      commitMessage: { type: 'unknown', message: 'Version info unavailable' },
      branch: 'unknown',
      recentCommits: [],
      environment: process.env.NODE_ENV || 'development',
    };
  }
}

/**
 * Parse commit message to categorize changes
 */
function parseCommitMessage(message) {
  const lowerMessage = message.toLowerCase();

  let type = 'other';
  let icon = '📝';

  if (lowerMessage.includes('fix') || lowerMessage.includes('bug')) {
    type = 'fix';
    icon = '🐛';
  } else if (
    lowerMessage.includes('add') ||
    lowerMessage.includes('new') ||
    lowerMessage.includes('feature')
  ) {
    type = 'feature';
    icon = '✨';
  } else if (
    lowerMessage.includes('update') ||
    lowerMessage.includes('improve') ||
    lowerMessage.includes('enhance')
  ) {
    type = 'improvement';
    icon = '⚡';
  } else if (
    lowerMessage.includes('remove') ||
    lowerMessage.includes('delete')
  ) {
    type = 'removal';
    icon = '🗑️';
  } else if (
    lowerMessage.includes('security') ||
    lowerMessage.includes('auth')
  ) {
    type = 'security';
    icon = '🔒';
  } else if (
    lowerMessage.includes('style') ||
    lowerMessage.includes('design') ||
    lowerMessage.includes('ui')
  ) {
    type = 'design';
    icon = '🎨';
  } else if (lowerMessage.includes('docs') || lowerMessage.includes('readme')) {
    type = 'docs';
    icon = '📚';
  }

  return {
    type,
    icon,
    message: message.trim(),
  };
}

/**
 * @swagger
 * /api/version:
 *   get:
 *     summary: Get application version and changelog (Public)
 *     tags: [Version]
 *     responses:
 *       200:
 *         description: Version information
 */
router.get('/', (req, res) => {
  const versionInfo = getVersionInfo();
  res.json(versionInfo);
});

/**
 * @swagger
 * /api/version/changelog:
 *   get:
 *     summary: Get recent changelog (Public)
 *     tags: [Version]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Recent changes
 */
router.get('/changelog', (req, res) => {
  const { limit = 50 } = req.query;

  try {
    // Get more commits to filter out noise
    const allCommits = execSync(
      `git log -${limit * 2} --format="%h|%cd|%s" --date=short --no-merges`,
      { encoding: 'utf-8' }
    )
      .trim()
      .split('\n')
      .map((line) => {
        const [hash, date, message] = line.split('|');

        // Filter out non-meaningful commits (like GitHub does)
        const lowerMessage = message.toLowerCase();

        // Skip noise commits
        if (
          lowerMessage.match(
            /^(merge|wip|temp|test|debug|cleanup|minor|typo|formatting)/i
          ) ||
          lowerMessage.match(
            /^(update readme|update gitignore|update package|update dependencies)/i
          ) ||
          message.length < 10 // Too short to be meaningful
        ) {
          return null;
        }

        const parsed = parseCommitMessage(message);

        // Only include meaningful categories
        if (
          !['feature', 'improvement', 'fix', 'design', 'security'].includes(
            parsed.type
          )
        ) {
          return null;
        }

        return {
          hash,
          date,
          ...parsed,
        };
      })
      .filter((commit) => commit !== null)
      .slice(0, limit); // Limit after filtering

    // Group by type
    const grouped = {
      features: allCommits.filter((c) => c.type === 'feature'),
      improvements: allCommits.filter((c) => c.type === 'improvement'),
      fixes: allCommits.filter((c) => c.type === 'fix'),
      design: allCommits.filter((c) => c.type === 'design'),
      security: allCommits.filter((c) => c.type === 'security'),
    };

    res.json({
      total: allCommits.length,
      commits: allCommits,
      grouped,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch changelog' });
  }
});

module.exports = router;
