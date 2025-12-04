/**
 * User Domain Model
 */
class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role || 'freelancer';
    this.emailVerified = data.email_verified || data.emailVerified || false;
    this.createdAt = data.created_at || data.createdAt;
    this.lastLoginAt = data.last_login_at || data.lastLoginAt;
    this.profilePicture = data.profile_picture || data.profilePicture;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      emailVerified: this.emailVerified,
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt,
      profilePicture: this.profilePicture
    };
  }

  toSafeJSON() {
    // Return user data without sensitive information
    return this.toJSON();
  }
}

module.exports = User;
