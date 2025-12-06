const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function debugStructure() {
  try {
    console.log('Debugging project and task data structure...\n');
    
    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@test.com',
      password: 'TestPassword123!'
    });
    
    const token = loginResponse.data.token;
    console.log('✓ Logged in\n');
    
    // Get clients
    const clientsResponse = await axios.get(`${API_URL}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const clients = clientsResponse.data.data || clientsResponse.data;
    console.log('CLIENTS:');
    console.log('Sample client:', clients[0]);
    console.log('');
    
    // Get projects
    const projectsResponse = await axios.get(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const projects = projectsResponse.data.data || projectsResponse.data;
    console.log('PROJECTS:');
    console.log('Total projects:', projects.length);
    console.log('Sample project:', projects[0]);
    console.log('Project keys:', Object.keys(projects[0] || {}));
    console.log('');
    
    // Check if projects have client_id
    const projectsWithClientId = projects.filter(p => p.client_id);
    const projectsWithClientIdCamel = projects.filter(p => p.clientId);
    console.log(`Projects with client_id: ${projectsWithClientId.length}`);
    console.log(`Projects with clientId: ${projectsWithClientIdCamel.length}`);
    console.log('');
    
    // Get tasks
    const tasksResponse = await axios.get(`${API_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const tasks = tasksResponse.data.data || tasksResponse.data;
    console.log('TASKS:');
    console.log('Total tasks:', tasks.length);
    console.log('Sample task:', tasks[0]);
    console.log('Task keys:', Object.keys(tasks[0] || {}));
    console.log('');
    
    // Check if tasks have project_id
    const tasksWithProjectId = tasks.filter(t => t.project_id);
    const tasksWithProjectIdCamel = tasks.filter(t => t.projectId);
    console.log(`Tasks with project_id: ${tasksWithProjectId.length}`);
    console.log(`Tasks with projectId: ${tasksWithProjectIdCamel.length}`);
    console.log('');
    
    // Test filtering
    if (clients.length > 0 && projects.length > 0) {
      const testClientId = clients[0].id;
      console.log(`Testing filter for client ID ${testClientId}:`);
      
      const filteredBySnake = projects.filter(p => p.client_id === testClientId);
      const filteredByCamel = projects.filter(p => p.clientId === testClientId);
      
      console.log(`  Using client_id: ${filteredBySnake.length} projects`);
      console.log(`  Using clientId: ${filteredByCamel.length} projects`);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

debugStructure();
