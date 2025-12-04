/**
 * Data Transfer Object for creating a client
 */
class CreateClientDTO {
  constructor(data) {
    this.name = data.name;
    this.email = data.email || null;
    this.phone = data.phone || null;
    this.company = data.company || null;
    this.notes = data.notes || null;
  }

  /**
   * Validate DTO
   * @returns {Object} { valid: boolean, errors: Array }
   */
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Name is required' });
    }

    if (this.name && this.name.length > 255) {
      errors.push({ field: 'name', message: 'Name must be less than 255 characters' });
    }

    if (this.email && !this.isValidEmail(this.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    if (this.company && this.company.length > 255) {
      errors.push({ field: 'company', message: 'Company name must be less than 255 characters' });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = CreateClientDTO;
