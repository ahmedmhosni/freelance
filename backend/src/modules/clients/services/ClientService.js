const BaseService = require('../../../shared/base/BaseService');
const CreateClientDTO = require('../dto/CreateClientDTO');
const UpdateClientDTO = require('../dto/UpdateClientDTO');
const { ValidationError, NotFoundError } = require('../../../core/errors');

/**
 * Client Service
 * Handles business logic for client operations
 */
class ClientService extends BaseService {
  constructor(clientRepository) {
    super(clientRepository);
    this.clientRepository = clientRepository;
  }

  /**
   * Get all clients for a user with pagination and search
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { data: Array<Client>, pagination: Object }
   */
  async getAllForUser(userId, options = {}) {
    const { search, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    let clients;
    let total;

    if (search) {
      clients = await this.clientRepository.search(userId, search, { 
        limit: parseInt(limit), 
        offset: parseInt(offset) 
      });
      total = await this.clientRepository.countByUserId(userId, search);
    } else {
      clients = await this.clientRepository.findByUserId(userId, { 
        limit: parseInt(limit), 
        offset: parseInt(offset) 
      });
      total = await this.clientRepository.countByUserId(userId);
    }

    return {
      data: clients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get client by ID for a user
   * @param {number} id - Client ID
   * @param {number} userId - User ID
   * @returns {Promise<Client>}
   * @throws {NotFoundError} If client not found
   */
  async getByIdForUser(id, userId) {
    const client = await this.clientRepository.findByIdAndUserId(id, userId);
    
    if (!client) {
      throw new NotFoundError('Client not found');
    }

    return client;
  }

  /**
   * Create a new client
   * @param {Object} clientData - Client data
   * @param {number} userId - User ID
   * @returns {Promise<Client>}
   * @throws {ValidationError} If validation fails
   */
  async create(clientData, userId) {
    // Create and validate DTO
    const dto = new CreateClientDTO(clientData);
    const validation = dto.validate();

    if (!validation.valid) {
      throw new ValidationError('Client validation failed', validation.errors);
    }

    // Check for duplicate email if provided
    if (dto.email) {
      const existingClient = await this.clientRepository.findByEmail(dto.email, userId);
      if (existingClient) {
        throw new ValidationError('Client with this email already exists', [
          { field: 'email', message: 'Email already in use' }
        ]);
      }
    }

    // Create client
    const client = await this.clientRepository.create({
      userId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      company: dto.company,
      notes: dto.notes
    });

    return client;
  }

  /**
   * Update a client
   * @param {number} id - Client ID
   * @param {Object} clientData - Client data to update
   * @param {number} userId - User ID
   * @returns {Promise<Client>}
   * @throws {NotFoundError} If client not found
   * @throws {ValidationError} If validation fails
   */
  async update(id, clientData, userId) {
    // Check if client exists
    const existingClient = await this.clientRepository.findByIdAndUserId(id, userId);
    if (!existingClient) {
      throw new NotFoundError('Client not found');
    }

    // Create and validate DTO
    const dto = new UpdateClientDTO(clientData);
    const validation = dto.validate();

    if (!validation.valid) {
      throw new ValidationError('Client validation failed', validation.errors);
    }

    // Check for duplicate email if email is being updated
    if (dto.email && dto.email !== existingClient.email) {
      const clientWithEmail = await this.clientRepository.findByEmail(dto.email, userId);
      if (clientWithEmail && clientWithEmail.id !== id) {
        throw new ValidationError('Client with this email already exists', [
          { field: 'email', message: 'Email already in use' }
        ]);
      }
    }

    // Update client
    const updatedClient = await this.clientRepository.update(id, userId, {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      company: dto.company,
      notes: dto.notes
    });

    return updatedClient;
  }

  /**
   * Delete a client
   * @param {number} id - Client ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>}
   * @throws {NotFoundError} If client not found
   */
  async delete(id, userId) {
    // Check if client exists
    const exists = await this.clientRepository.existsForUser(id, userId);
    if (!exists) {
      throw new NotFoundError('Client not found');
    }

    // Delete client
    const deleted = await this.clientRepository.delete(id, userId);
    return deleted;
  }

  /**
   * Check if client exists for user
   * @param {number} id - Client ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>}
   */
  async exists(id, userId) {
    return await this.clientRepository.existsForUser(id, userId);
  }
}

module.exports = ClientService;
