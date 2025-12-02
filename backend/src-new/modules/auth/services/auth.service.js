/**
 * Auth Service
 * Business logic for authentication
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');
const emailService = require('../../../shared/utils/emailService');
const tokenGenerator = require('../../../shared/utils/tokenGenerator');

class AuthService {
  async register(userData) {
    // Check if user exists
    const existingUser = await authRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = await authRepository.create({
      ...userData,
      password: hashedPassword,
      verificationToken: tokenGenerator.generate()
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, user.verificationToken);

    // Generate JWT
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  async login({ email, password }) {
    // Find user
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new Error('Please verify your email first');
    }

    // Generate JWT
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  async logout(userId) {
    // Implement token blacklist if needed
    return true;
  }

  async forgotPassword(email) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return true;
    }

    const resetToken = tokenGenerator.generate();
    await authRepository.updateResetToken(user.id, resetToken);
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    return true;
  }

  async resetPassword(token, newPassword) {
    const user = await authRepository.findByResetToken(token);
    if (!user) {
      throw new Error('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await authRepository.updatePassword(user.id, hashedPassword);
    await authRepository.clearResetToken(user.id);

    return true;
  }

  async verifyEmail(token) {
    const user = await authRepository.findByVerificationToken(token);
    if (!user) {
      throw new Error('Invalid verification token');
    }

    await authRepository.markAsVerified(user.id);
    return true;
  }

  async resendVerification(email) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      return true; // Don't reveal if user exists
    }

    if (user.isVerified) {
      throw new Error('Email already verified');
    }

    const verificationToken = tokenGenerator.generate();
    await authRepository.updateVerificationToken(user.id, verificationToken);
    await emailService.sendVerificationEmail(user.email, verificationToken);

    return true;
  }

  async refreshToken(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const token = this.generateToken(user);
    return { token };
  }

  async getUserById(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.sanitizeUser(user);
  }

  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  sanitizeUser(user) {
    const { password, verificationToken, resetToken, ...sanitized } = user;
    return sanitized;
  }
}

module.exports = new AuthService();
