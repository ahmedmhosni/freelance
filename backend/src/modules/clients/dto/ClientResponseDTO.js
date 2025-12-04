/**
 * Data Transfer Object for client API responses
 */
class ClientResponseDTO {
  constructor(client) {
    this.id = client.id;
    this.userId = client.userId || client.user_id;
    this.name = client.name;
    this.email = client.email;
    this.phone = client.phone;
    this.company = client.company;
    this.notes = client.notes;
    this.createdAt = client.createdAt || client.created_at;
    this.updatedAt = client.updatedAt || client.updated_at;
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      company: this.company,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create from Client model
   * @param {Client} client
   * @returns {ClientResponseDTO}
   */
  static fromClient(client) {
    return new ClientResponseDTO(client);
  }

  /**
   * Create array from Client models
   * @param {Array<Client>} clients
   * @returns {Array<ClientResponseDTO>}
   */
  static fromClientArray(clients) {
    return clients.map(client => ClientResponseDTO.fromClient(client));
  }
}

module.exports = ClientResponseDTO;
