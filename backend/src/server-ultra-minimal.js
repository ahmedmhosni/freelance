const express = require('express');
const app = express();
const PORT = process.env.PORT || process.env.WEBSITES_PORT || 8080;

app.get('/', (req, res) => {
  res.json({ 
    message: 'Ultra Minimal Server - Working!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    server: 'ultra-minimal',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Ultra minimal server running on port ${PORT}`);
});