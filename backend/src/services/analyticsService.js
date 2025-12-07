/**
 * Analytics Service
 * 
 * Privacy-focused analytics tracking
 * - No personal data
 * - No IP addresses
 * - No cookies
 * - GDPR compliant
 */

const { query } = require('../db/postgresql');
const logger = require('../utils/logger');

class AnalyticsService {
  /**
   * Track an event
   * @param {string} eventType - Type of event (e.g., 'user_signup', 'invoice_created')
   * @param {string} eventCategory - Category (e.g., 'user', 'business', 'system')
   * @param {number} userId - User ID (optional, can be null)
   * @param {object} metadata - Additional data (optional)
   */
  async trackEvent(eventType, eventCategory, userId = null, metadata = {}) {
    try {
      await query(
        `INSERT INTO analytics_events (event_type, event_category, user_id, metadata)
         VALUES ($1, $2, $3, $4)`,
        [eventType, eventCategory, userId, JSON.stringify(metadata)]
      );
    } catch (error) {
      // Don't fail the main operation if analytics fails
      logger.error('Analytics tracking error:', error);
    }
  }

  /**
   * Get event counts by type
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   */
  async getEventCounts(startDate, endDate) {
    const result = await query(
      `SELECT 
        event_type,
        event_category,
        COUNT(*) as count
       FROM analytics_events
       WHERE created_at >= $1 AND created_at < $2 + INTERVAL '1 day'
       GROUP BY event_type, event_category
       ORDER BY count DESC`,
      [startDate, endDate]
    );
    return result.rows;
  }

  /**
   * Get daily active users
   * @param {number} days - Number of days to look back
   */
  async getDailyActiveUsers(days = 30) {
    const result = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT user_id) as active_users
       FROM analytics_events
       WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
         AND user_id IS NOT NULL
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      []
    );
    return result.rows;
  }

  /**
   * Get business metrics
   * @param {number} days - Number of days to look back
   */
  async getBusinessMetrics(days = 30) {
    const result = await query(
      `SELECT 
        event_type,
        COUNT(*) as count,
        DATE(created_at) as date
       FROM analytics_events
       WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
         AND event_category = 'business'
       GROUP BY event_type, DATE(created_at)
       ORDER BY date DESC, count DESC`,
      []
    );
    return result.rows;
  }

  /**
   * Get overview stats
   */
  async getOverviewStats() {
    // Total users
    const totalUsers = await query(
      `SELECT COUNT(*) as count FROM users`,
      []
    );

    // Active users (last 30 days)
    const activeUsers = await query(
      `SELECT COUNT(DISTINCT user_id) as count
       FROM analytics_events
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
         AND user_id IS NOT NULL`,
      []
    );

    // Total events (last 30 days)
    const totalEvents = await query(
      `SELECT COUNT(*) as count
       FROM analytics_events
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'`,
      []
    );

    // Business metrics (last 30 days)
    const businessMetrics = await query(
      `SELECT 
        event_type,
        COUNT(*) as count
       FROM analytics_events
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
         AND event_category = 'business'
       GROUP BY event_type`,
      []
    );

    return {
      totalUsers: parseInt(totalUsers.rows[0]?.count || 0),
      activeUsers: parseInt(activeUsers.rows[0]?.count || 0),
      totalEvents: parseInt(totalEvents.rows[0]?.count || 0),
      businessMetrics: businessMetrics.rows
    };
  }

  /**
   * Get popular features
   * @param {number} days - Number of days to look back
   * @param {number} limit - Number of results
   */
  async getPopularFeatures(days = 30, limit = 10) {
    const result = await query(
      `SELECT 
        event_type,
        COUNT(*) as usage_count,
        COUNT(DISTINCT user_id) as unique_users
       FROM analytics_events
       WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
         AND event_category = 'feature'
       GROUP BY event_type
       ORDER BY usage_count DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  /**
   * Get growth metrics
   */
  async getGrowthMetrics() {
    // New users per day (last 30 days)
    const newUsers = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
       FROM users
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      []
    );

    // Calculate growth rate
    const today = newUsers.rows[0]?.new_users || 0;
    const yesterday = newUsers.rows[1]?.new_users || 0;
    const growthRate = yesterday > 0 ? ((today - yesterday) / yesterday * 100).toFixed(1) : 0;

    return {
      newUsersToday: today,
      newUsersYesterday: yesterday,
      growthRate: parseFloat(growthRate),
      dailyNewUsers: newUsers.rows
    };
  }
}

module.exports = new AnalyticsService();
