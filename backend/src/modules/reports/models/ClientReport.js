/**
 * Client Report Domain Model
 */
class ClientReport {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.company = data.company;
    this.projectCount = data.projectCount || 0;
    this.invoiceCount = data.invoiceCount || 0;
    this.totalRevenue = data.totalRevenue || 0;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      company: this.company,
      projectCount: this.projectCount,
      invoiceCount: this.invoiceCount,
      totalRevenue: this.totalRevenue
    };
  }
}

module.exports = ClientReport;
