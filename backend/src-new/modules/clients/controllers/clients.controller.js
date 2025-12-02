/**
 * Clients Controller
 */

const clientsService = require('../services/clients.service');

class ClientsController {
  async getAll(req, res, next) {
    try {
      const clients = await clientsService.getAll(req.user.id);
      res.json(clients);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const client = await clientsService.getById(req.params.id, req.user.id);
      res.json(client);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const client = await clientsService.create(req.body, req.user.id);
      res.status(201).json(client);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const client = await clientsService.update(req.params.id, req.body, req.user.id);
      res.json(client);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await clientsService.delete(req.params.id, req.user.id);
      res.json({ message: 'Client deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClientsController();
