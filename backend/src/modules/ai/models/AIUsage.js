/**
 * AI Usage Model
 * Represents user AI usage statistics
 */
class AIUsage {
  constructor(data = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.daily_requests = data.daily_requests || 0;
    this.monthly_requests = data.monthly_requests || 0;
    this.last_request_date = data.last_request_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Check if daily limit is reached
   * @param {number} dailyLimit - Daily request limit
   * @returns {boolean} True if limit reached
   */
  isDailyLimitReached(dailyLimit) {
    return this.daily_requests >= dailyLimit;
  }

  /**
   * Check if monthly limit is reached
   * @param {number} monthlyLimit - Monthly request limit
   * @returns {boolean} True if limit reached
   */
  isMonthlyLimitReached(monthlyLimit) {
    return this.monthly_requests >= monthlyLimit;
  }

  /**
   * Check if daily counter needs reset
   * @returns {boolean} True if needs reset
   */
  needsDailyReset() {
    if (!this.last_request_date) return true;
    
    const today = new Date().toISOString().split('T')[0];
    const lastRequestDate = new Date(this.last_request_date).toISOString().split('T')[0];
    
    return today !== lastRequestDate;
  }

  /**
   * Reset daily counter
   */
  resetDaily() {
    this.daily_requests = 0;
    this.last_request_date = new Date().toISOString().split('T')[0];
  }

  /**
   * Increment usage counters
   */
  incrementUsage() {
    this.daily_requests += 1;
    this.monthly_requests += 1;
    this.last_request_date = new Date().toISOString().split('T')[0];
  }

  /**
   * Convert to database format
   * @returns {Object} Database-ready object
   */
  toDatabase() {
    return {
      user_id: this.user_id,
      daily_requests: this.daily_requests,
      monthly_requests: this.monthly_requests,
      last_request_date: this.last_request_date
    };
  }

  /**
   * Convert to API response format
   * @returns {Object} API-ready object
   */
  toResponse() {
    return {
      id: this.id,
      user_id: this.user_id,
      daily_requests: this.daily_requests,
      monthly_requests: this.monthly_requests,
      last_request_date: this.last_request_date,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = AIUsage;