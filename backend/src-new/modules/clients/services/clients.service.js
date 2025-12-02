/**
 * Clients Service
 */

const clientsRepository = require('../repositories/clients.repository');

class ClientsService {
  async getAll(userId) {
    return await clientsRepository.findByUserId(userId);
  }

  async getById(clientId, userId) {
    const client = await clientsRepository.findById(clientId);
    
    if (!client) {
      throw new Error('Client not found');
    }

    if (client.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    return client;
  }

  async create(clientData, userId) {
    return await clientsRepository.create({
      ...clientData,
      user_id: userId
    });
  }

  async update(clientId, clientData, userId) {
    // Check ownership
    await this.getById(clientId, userId);
    
    return await clientsRepository.update(clientId, clientData);
  }

  async delete(clientId, userId) {
    // Check ownership
    await this.getById(clientId, userId);
    
    return await clientsRepository.delete(clientId);
  }
}

module.exports = new ClientsService();
