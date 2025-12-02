/**
 * Invoices Controller
 */

const invoicesService = require('../services/invoices.service');

class InvoicesController {
  async getAll(req, res, next) {
    try {
      const { clientId, status } = req.query;
      const invoices = await invoicesService.getAll(req.user.id, { clientId, status });
      res.json(invoices);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const invoice = await invoicesService.getById(req.params.id, req.user.id);
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const invoice = await invoicesService.create(req.body, req.user.id);
      res.status(201).json(invoice);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const invoice = await invoicesService.update(req.params.id, req.body, req.user.id);
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await invoicesService.delete(req.params.id, req.user.id);
      res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const invoice = await invoicesService.updateStatus(
        req.params.id,
        req.body.status,
        req.user.id
      );
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }

  async generatePDF(req, res, next) {
    try {
      const pdf = await invoicesService.generatePDF(req.params.id, req.user.id);
      res.contentType('application/pdf');
      res.send(pdf);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InvoicesController();
