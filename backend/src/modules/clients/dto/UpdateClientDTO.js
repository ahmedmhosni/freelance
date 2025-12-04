/**
 * Data Transfer Object for updating a client
 */
class UpdateClientDTO {
  constructor(data) {
    this.name = data.name;
    this.email = data.email !== undefined ? data.email : undefined;
    this.phone = data.phone !== undefined ? data.phone : undefined;
    this.company = data.company !== undefined ? data.company : undefined;
    this.notes = data.notes !== undefined ? data.notes : undefined;
  }

  /**
   * Validate DTO
   * @returns {Object} { valid: boolean, errors: Array }
   */
  validate() {
    const errors = [];

    if (this.name !== undefined) {
      if (!this.name || this.name.trim().length === 0) {
        errors.push({ field: 'name', message: 'Name cannot be empty' });
      }

      if (this.name && this.name.length > 255) {
        errors.push({ field: 'name', message: 'Name must be less than 255 characters' });
      }
    }

    if (this.email !== undefined && this.email && !this.isValidEmail(this.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    if (this.company !== undefined && this.company && this.company.length > 255) {
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

  /**
   * Get only defined fields for partial update
   * @returns {Object}
   */
  getDefinedFields() {
    const fields = {};
    
    if (this.name !== undefined) fields.name = this.name;
    if (this.email !== undefined) fields.email = this.email;
    if (this.phone !== undefined) fields.phone = this.phone;
    if (this.company !== undefined) fields.company = this.company;
    if (this.notes !== undefined) fields.notes = this.notes;

    return fields;
  }
}

module.exports = UpdateClientDTO;
