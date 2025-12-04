const { bootstrap } = require('../../core/bootstrap');

describe('Performance: Query Optimization', () => {
  let container;
  let database;
  let testUserId;

  beforeAll(async () => {
    const result = await bootstrap();
    container = result.container;
    database = container.resolve('database');

    // Create test user
    const userResult = await database.queryOne(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
      ['query-opt-test@example.com', 'hashedpassword', 'Query Opt Test']
    );
    testUserId = userResult.id;
  });

  afterAll(async () => {
    await database.execute('DELETE FROM users WHERE id = $1', [testUserId]);
    await database.close();
  });

  describe('Index Usage', () => {
    test('should use index for client lookups by user_id', async () => {
      const startTime = Date.now();
      
      await database.queryMany(
        'SELECT * FROM clients WHERE user_id = $1',
        [testUserId]
      );
      
      const queryTime = Date.now() - startTime;

      // Should be fast with index
      expect(queryTime).toBeLessThan(50);
    });

    test('should use index for project lookups by client_id', async () => {
      const startTime = Date.now();
      
      await database.queryMany(
        'SELECT * FROM projects WHERE client_id = $1',
        [1]
      );
      
      const queryTime = Date.now() - startTime;

      expect(queryTime).toBeLessThan(50);
    });

    test('should use index for task lookups by project_id', async () => {
      const startTime = Date.now();
      
      await database.queryMany(
        'SELECT * FROM tasks WHERE project_id = $1',
        [1]
      );
      
      const queryTime = Date.now() - startTime;

      expect(queryTime).toBeLessThan(50);
    });
  });

  describe('Join Performance', () => {
    let clientId;
    let projectId;

    beforeAll(async () => {
      // Create test data
      const clientResult = await database.queryOne(
        'INSERT INTO clients (user_id, name, email) VALUES ($1, $2, $3) RETURNING id',
        [testUserId, 'Join Test Client', 'jointest@example.com']
      );
      clientId = clientResult.id;

      const projectResult = await database.queryOne(
        'INSERT INTO projects (user_id, client_id, name, status) VALUES ($1, $2, $3, $4) RETURNING id',
        [testUserId, clientId, 'Join Test Project', 'active']
      );
      projectId = projectResult.id;
    });

    afterAll(async () => {
      if (projectId) {
        await database.execute('DELETE FROM projects WHERE id = $1', [projectId]);
      }
      if (clientId) {
        await database.execute('DELETE FROM clients WHERE id = $1', [clientId]);
      }
    });

    test('should efficiently join projects with clients', async () => {
      const startTime = Date.now();
      
      await database.queryMany(`
        SELECT p.*, c.name as client_name, c.email as client_email
        FROM projects p
        INNER JOIN clients c ON p.client_id = c.id
        WHERE p.user_id = $1
      `, [testUserId]);
      
      const queryTime = Date.now() - startTime;

      expect(queryTime).toBeLessThan(100);
    });

    test('should efficiently join tasks with projects and clients', async () => {
      const startTime = Date.now();
      
      await database.queryMany(`
        SELECT t.*, p.name as project_name, c.name as client_name
        FROM tasks t
        INNER JOIN projects p ON t.project_id = p.id
        INNER JOIN clients c ON p.client_id = c.id
        WHERE t.user_id = $1
      `, [testUserId]);
      
      const queryTime = Date.now() - startTime;

      expect(queryTime).toBeLessThan(150);
    });
  });

  describe('Aggregation Performance', () => {
    let clientIds = [];
    let projectIds = [];

    beforeAll(async () => {
      // Create test data for aggregations
      for (let i = 0; i < 10; i++) {
        const clientResult = await database.queryOne(
          'INSERT INTO clients (user_id, name, email) VALUES ($1, $2, $3) RETURNING id',
          [testUserId, `Agg Client ${i}`, `aggclient${i}@example.com`]
        );
        clientIds.push(clientResult.id);

        const projectResult = await database.queryOne(
          'INSERT INTO projects (user_id, client_id, name, status) VALUES ($1, $2, $3, $4) RETURNING id',
          [testUserId, clientResult.id, `Agg Project ${i}`, 'active']
        );
        projectIds.push(projectResult.id);
      }
    });

    afterAll(async () => {
      for (const id of projectIds) {
        await database.execute('DELETE FROM projects WHERE id = $1', [id]);
      }
      for (const id of clientIds) {
        await database.execute('DELETE FROM clients WHERE id = $1', [id]);
      }
    });

    test('should efficiently count clients', async () => {
      const startTime = Date.now();
      
      await database.queryOne(
        'SELECT COUNT(*) as total FROM clients WHERE user_id = $1',
        [testUserId]
      );
      
      const queryTime = Date.now() - startTime;

      expect(queryTime).toBeLessThan(50);
    });

    test('should efficiently count projects per client', async () => {
      const startTime = Date.now();
      
      await database.queryMany(`
        SELECT c.id, c.name, COUNT(p.id) as project_count
        FROM clients c
        LEFT JOIN projects p ON c.id = p.client_id
        WHERE c.user_id = $1
        GROUP BY c.id, c.name
      `, [testUserId]);
      
      const queryTime = Date.now() - startTime;

      expect(queryTime).toBeLessThan(100);
    });

    test('should efficiently calculate revenue totals', async () => {
      const startTime = Date.now();
      
      await database.queryOne(`
        SELECT 
          COUNT(*) as total_invoices,
          SUM(amount) as total_revenue,
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_revenue
        FROM invoices
        WHERE user_id = $1
      `, [testUserId]);
      
      const queryTime = Date.now() - startTime;

      expect(queryTime).toBeLessThan(100);
    });
  });

  describe('Bulk Operations Performance', () => {
    test('should efficiently insert multiple records', async () => {
      const startTime = Date.now();
      
      await database.transaction(async (client) => {
        for (let i = 0; i < 20; i++) {
          await client.queryOne(
            'INSERT INTO clients (user_id, name, email) VALUES ($1, $2, $3) RETURNING id',
            [testUserId, `Bulk Client ${i}`, `bulk${i}@example.com`]
          );
        }
      });
      
      const insertTime = Date.now() - startTime;

      // 20 inserts in transaction should be fast
      expect(insertTime).toBeLessThan(500);

      // Cleanup
      await database.execute(
        'DELETE FROM clients WHERE email LIKE $1',
        ['bulk%@example.com']
      );
    });

    test('should efficiently update multiple records', async () => {
      // Create test records
      const clientIds = [];
      for (let i = 0; i < 10; i++) {
        const result = await database.queryOne(
          'INSERT INTO clients (user_id, name, email) VALUES ($1, $2, $3) RETURNING id',
          [testUserId, `Update Test ${i}`, `updatetest${i}@example.com`]
        );
        clientIds.push(result.id);
      }

      const startTime = Date.now();
      
      await database.transaction(async (client) => {
        for (const id of clientIds) {
          await client.execute(
            'UPDATE clients SET name = $1 WHERE id = $2',
            [`Updated ${id}`, id]
          );
        }
      });
      
      const updateTime = Date.now() - startTime;

      expect(updateTime).toBeLessThan(300);

      // Cleanup
      for (const id of clientIds) {
        await database.execute('DELETE FROM clients WHERE id = $1', [id]);
      }
    });

    test('should efficiently delete multiple records', async () => {
      // Create test records
      const clientIds = [];
      for (let i = 0; i < 10; i++) {
        const result = await database.queryOne(
          'INSERT INTO clients (user_id, name, email) VALUES ($1, $2, $3) RETURNING id',
          [testUserId, `Delete Test ${i}`, `deletetest${i}@example.com`]
        );
        clientIds.push(result.id);
      }

      const startTime = Date.now();
      
      await database.execute(
        'DELETE FROM clients WHERE email LIKE $1',
        ['deletetest%@example.com']
      );
      
      const deleteTime = Date.now() - startTime;

      expect(deleteTime).toBeLessThan(200);
    });
  });

  describe('Complex Query Performance', () => {
    test('should efficiently execute dashboard query', async () => {
      const startTime = Date.now();
      
      await database.queryOne(`
        SELECT 
          (SELECT COUNT(*) FROM clients WHERE user_id = $1) as total_clients,
          (SELECT COUNT(*) FROM projects WHERE user_id = $1 AND status = 'active') as active_projects,
          (SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND status != 'completed') as pending_tasks,
          (SELECT SUM(amount) FROM invoices WHERE user_id = $1 AND status = 'paid') as total_revenue
      `, [testUserId]);
      
      const queryTime = Date.now() - startTime;

      // Complex dashboard query should still be fast
      expect(queryTime).toBeLessThan(300);
    });

    test('should efficiently execute time tracking report query', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const startTime = Date.now();
      
      await database.queryMany(`
        SELECT 
          t.id,
          t.description,
          t.start_time,
          t.end_time,
          t.duration,
          tk.title as task_title,
          p.name as project_name,
          c.name as client_name
        FROM time_entries t
        LEFT JOIN tasks tk ON t.task_id = tk.id
        LEFT JOIN projects p ON tk.project_id = p.id
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE t.user_id = $1
          AND t.start_time >= $2
          AND t.start_time <= $3
        ORDER BY t.start_time DESC
      `, [testUserId, startDate, endDate]);
      
      const queryTime = Date.now() - startTime;

      expect(queryTime).toBeLessThan(400);
    });
  });

  describe('Connection Pool Performance', () => {
    test('should handle rapid sequential queries', async () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        await database.queryOne('SELECT 1 as test');
      }
      
      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / 50;

      // Average query time should be very fast
      expect(avgTime).toBeLessThan(20);
    });

    test('should handle concurrent queries efficiently', async () => {
      const startTime = Date.now();
      
      const queries = Array(20).fill(null).map(() =>
        database.queryOne('SELECT 1 as test')
      );
      
      await Promise.all(queries);
      
      const totalTime = Date.now() - startTime;

      // 20 concurrent queries should complete quickly
      expect(totalTime).toBeLessThan(500);
    });
  });
});
