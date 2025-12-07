const bcrypt = require('bcryptjs');

/**
 * GDPR Service
 * Business logic for GDPR compliance operations
 */
class GDPRService {
  constructor(repository, authService) {
    this.repository = repository;
    this.authService = authService;
  }

  /**
   * Request data export
   */
  async requestDataExport(userId, userEmail) {
    // Check for recent requests (rate limiting)
    const recentRequest = await this.repository.getRecentExportRequest(userId, 24);
    
    if (recentRequest) {
      throw new Error('You can only request a data export once every 24 hours. Please try again later.');
    }

    // Create export request
    const request = await this.repository.createExportRequest(userId);

    // In a real implementation, this would:
    // 1. Queue a background job to generate the export
    // 2. Send an email with download link when ready
    // For now, we'll just create the request record

    // TODO: Implement background job for data export
    // - Gather all user data
    // - Create ZIP file
    // - Upload to secure storage
    // - Send email with download link
    // - Set expiration (e.g., 7 days)

    return request;
  }

  /**
   * Get export requests for user
   */
  async getExportRequests(userId) {
    const requests = await this.repository.getExportRequestsByUserId(userId);
    return requests.map(r => r.toJSON());
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId, password, reason) {
    // Verify password
    const user = await this.authService.getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      const error = new Error('Invalid password');
      error.statusCode = 401;
      throw error;
    }

    // Log deletion reason (for analytics/improvement)
    if (reason) {
      // TODO: Store deletion reason in analytics table
      console.log(`Account deletion reason for user ${userId}: ${reason}`);
    }

    // Delete all user data
    await this.repository.deleteUserData(userId);

    // TODO: Send confirmation email
    // TODO: Revoke all active sessions/tokens
  }

  /**
   * Export user data (for background job)
   */
  async exportUserData(userId) {
    const data = await this.repository.getUserData(userId);
    
    // Remove sensitive fields
    if (data.profile) {
      delete data.profile.password;
    }

    return {
      exported_at: new Date().toISOString(),
      user_id: userId,
      data
    };
  }
}

module.exports = GDPRService;
