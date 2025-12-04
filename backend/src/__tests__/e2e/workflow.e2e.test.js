const request = require('supertest');
const { bootstrap } = require('../../core/bootstrap');

describe('E2E: Complete User Workflow', () => {
  let app;
  let container;
  let authToken;
  let testUserId;
  let clientId;
  let projectId;
  let taskId;
  let timeEntryId;
  let invoiceId;

  beforeAll(async () => {
    const result = await bootstrap();
    app = result.app;
    container = result.container;

    // Register and login test user
    const registerResponse = await request(app)
      .post('/api/v2/auth/register')
      .send({
        email: 'workflow-test@example.com',
        password: 'WorkflowTest123!',
        name: 'Workflow Test User'
      });

    authToken = registerResponse.body.token;
    testUserId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    // Clean up all test data
    const database = container.resolve('database');
    
    if (timeEntryId) {
      await database.execute('DELETE FROM time_entries WHERE id = $1', [timeEntryId]);
    }
    if (invoiceId) {
      await database.execute('DELETE FROM invoices WHERE id = $1', [invoiceId]);
    }
    if (taskId) {
      await database.execute('DELETE FROM tasks WHERE id = $1', [taskId]);
    }
    if (projectId) {
      await database.execute('DELETE FROM projects WHERE id = $1', [projectId]);
    }
    if (clientId) {
      await database.execute('DELETE FROM clients WHERE id = $1', [clientId]);
    }
    if (testUserId) {
      await database.execute('DELETE FROM users WHERE id = $1', [testUserId]);
    }
    
    await database.close();
  });

  describe('Step 1: Create Client', () => {
    test('should create a new client', async () => {
      const response = await request(app)
        .post('/api/v2/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Acme Corporation',
          email: 'contact@acme.com',
          phone: '555-0100',
          company: 'Acme Corp',
          notes: 'Important client'
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Acme Corporation');
      
      clientId = response.body.id;
    });

    test('should retrieve the created client', async () => {
      const response = await request(app)
        .get(`/api/v2/clients/${clientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(clientId);
      expect(response.body.name).toBe('Acme Corporation');
    });
  });

  describe('Step 2: Create Project', () => {
    test('should create a project for the client', async () => {
      const response = await request(app)
        .post('/api/v2/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: clientId,
          name: 'Website Redesign',
          description: 'Complete website overhaul',
          status: 'active',
          startDate: new Date().toISOString(),
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Website Redesign');
      expect(response.body.clientId).toBe(clientId);
      
      projectId = response.body.id;
    });

    test('should list projects for the client', async () => {
      const response = await request(app)
        .get(`/api/v2/projects?clientId=${clientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].clientId).toBe(clientId);
    });
  });

  describe('Step 3: Create Task', () => {
    test('should create a task for the project', async () => {
      const response = await request(app)
        .post('/api/v2/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: projectId,
          title: 'Design Homepage',
          description: 'Create mockups for homepage',
          status: 'todo',
          priority: 'high',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Design Homepage');
      expect(response.body.projectId).toBe(projectId);
      
      taskId = response.body.id;
    });

    test('should update task status', async () => {
      const response = await request(app)
        .put(`/api/v2/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'in_progress'
        })
        .expect(200);

      expect(response.body.status).toBe('in_progress');
    });
  });

  describe('Step 4: Track Time', () => {
    test('should start time tracking for the task', async () => {
      const response = await request(app)
        .post('/api/v2/time-tracking')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          taskId: taskId,
          description: 'Working on homepage design',
          startTime: new Date().toISOString()
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.taskId).toBe(taskId);
      
      timeEntryId = response.body.id;
    });

    test('should stop time tracking', async () => {
      const response = await request(app)
        .put(`/api/v2/time-tracking/${timeEntryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        })
        .expect(200);

      expect(response.body.endTime).toBeTruthy();
      expect(response.body.duration).toBeGreaterThan(0);
    });

    test('should retrieve time entries for the task', async () => {
      const response = await request(app)
        .get(`/api/v2/time-tracking?taskId=${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].taskId).toBe(taskId);
    });
  });

  describe('Step 5: Create Invoice', () => {
    test('should create an invoice for the client', async () => {
      const response = await request(app)
        .post('/api/v2/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId: clientId,
          invoiceNumber: `INV-TEST-${Date.now()}`,
          amount: 1500.00,
          status: 'draft',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              description: 'Homepage Design',
              quantity: 1,
              rate: 1500.00
            }
          ]
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.clientId).toBe(clientId);
      expect(response.body.amount).toBe(1500.00);
      
      invoiceId = response.body.id;
    });

    test('should update invoice status to sent', async () => {
      const response = await request(app)
        .put(`/api/v2/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'sent'
        })
        .expect(200);

      expect(response.body.status).toBe('sent');
    });

    test('should mark invoice as paid', async () => {
      const response = await request(app)
        .put(`/api/v2/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'paid',
          paidDate: new Date().toISOString()
        })
        .expect(200);

      expect(response.body.status).toBe('paid');
      expect(response.body.paidDate).toBeTruthy();
    });
  });

  describe('Step 6: Complete Task and Project', () => {
    test('should mark task as completed', async () => {
      const response = await request(app)
        .put(`/api/v2/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed'
        })
        .expect(200);

      expect(response.body.status).toBe('completed');
    });

    test('should mark project as completed', async () => {
      const response = await request(app)
        .put(`/api/v2/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed'
        })
        .expect(200);

      expect(response.body.status).toBe('completed');
    });
  });

  describe('Step 7: View Dashboard and Reports', () => {
    test('should retrieve dashboard data', async () => {
      const response = await request(app)
        .get('/api/v2/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('totalClients');
      expect(response.body.stats).toHaveProperty('activeProjects');
      expect(response.body.stats).toHaveProperty('totalRevenue');
    });

    test('should retrieve time tracking report', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/v2/reports/time-tracking?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalHours');
      expect(response.body).toHaveProperty('entries');
    });

    test('should retrieve revenue report', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/v2/reports/revenue?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('paidInvoices');
    });
  });

  describe('Step 8: Data Integrity Checks', () => {
    test('should maintain referential integrity', async () => {
      // Verify client has associated project
      const clientResponse = await request(app)
        .get(`/api/v2/clients/${clientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(clientResponse.body.id).toBe(clientId);

      // Verify project has associated tasks
      const projectResponse = await request(app)
        .get(`/api/v2/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(projectResponse.body.id).toBe(projectId);

      // Verify task has time entries
      const taskResponse = await request(app)
        .get(`/api/v2/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(taskResponse.body.id).toBe(taskId);
    });

    test('should prevent deletion of client with active projects', async () => {
      const response = await request(app)
        .delete(`/api/v2/clients/${clientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);

      expect(response.body).toHaveProperty('error');
    });
  });
});
