const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env file
function loadEnv() {
  const envPath = path.join(__dirname, 'backend', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnv();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_DATABASE || 'roastify',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123'
});

async function seedTimeEntries() {
  const client = await pool.connect();
  
  try {
    console.log('Seeding time entries for user 23...\n');
    
    // Get user's projects and tasks
    const projectsResult = await client.query(
      'SELECT id, name, client_id FROM projects WHERE user_id = 23 LIMIT 3'
    );
    
    if (projectsResult.rows.length === 0) {
      console.log('No projects found for user 23. Please create some projects first.');
      return;
    }
    
    console.log(`Found ${projectsResult.rows.length} projects\n`);
    
    let totalEntries = 0;
    
    for (const project of projectsResult.rows) {
      console.log(`Project: ${project.name} (ID: ${project.id})`);
      
      // Get tasks for this project
      const tasksResult = await client.query(
        'SELECT id, title FROM tasks WHERE project_id = $1 LIMIT 2',
        [project.id]
      );
      
      if (tasksResult.rows.length === 0) {
        console.log('  No tasks found, skipping...\n');
        continue;
      }
      
      for (const task of tasksResult.rows) {
        // Create 3-5 time entries for each task
        const numEntries = Math.floor(Math.random() * 3) + 3;
        
        for (let i = 0; i < numEntries; i++) {
          const hoursWorked = (Math.random() * 4 + 0.5).toFixed(2); // 0.5 to 4.5 hours
          const durationMinutes = Math.floor(parseFloat(hoursWorked) * 60); // Convert to minutes
          const daysAgo = Math.floor(Math.random() * 14); // Last 2 weeks
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - daysAgo);
          startDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
          
          const endDate = new Date(startDate);
          endDate.setMinutes(startDate.getMinutes() + durationMinutes);
          
          await client.query(`
            INSERT INTO time_entries (
              user_id, project_id, task_id, description,
              start_time, end_time, duration, is_billable
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            23,
            project.id,
            task.id,
            `Work on ${task.title} - Session ${i + 1}`,
            startDate,
            endDate,
            durationMinutes,
            true // is_billable
          ]);
          
          totalEntries++;
        }
        
        console.log(`  ✓ Task: ${task.title} - Added ${numEntries} time entries`);
      }
      
      console.log('');
    }
    
    console.log(`\n✅ Successfully seeded ${totalEntries} time entries for user 23`);
    console.log('\nSummary by project:');
    
    const summary = await client.query(`
      SELECT 
        p.name as project_name,
        t.title as task_name,
        COUNT(te.id) as entry_count,
        SUM(te.duration) as total_hours
      FROM time_entries te
      JOIN projects p ON te.project_id = p.id
      JOIN tasks t ON te.task_id = t.id
      WHERE te.user_id = 23 AND te.is_billable = true
      GROUP BY p.name, t.title
      ORDER BY p.name, t.title
    `);
    
    summary.rows.forEach(row => {
      const hours = (row.total_hours / 60).toFixed(2); // Convert minutes to hours
      console.log(`  ${row.project_name} / ${row.task_name}: ${hours} hours (${row.entry_count} entries)`);
    });
    
  } catch (error) {
    console.error('Error seeding time entries:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedTimeEntries();
