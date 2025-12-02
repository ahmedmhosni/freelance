/**
 * Backend Migration Script
 * Helps migrate existing code to new modular structure
 */

const fs = require('fs');
const path = require('path');

const modules = [
  'auth',
  'clients',
  'projects',
  'tasks',
  'invoices',
  'quotes',
  'time-tracking',
  'reports',
  'admin',
  'announcements',
  'changelog',
  'feedback',
  'notifications',
  'status'
];

const createModuleStructure = (moduleName) => {
  const basePath = path.join(__dirname, '../backend/src-new/modules', moduleName);
  
  const dirs = [
    'controllers',
    'services',
    'repositories',
    'models',
    'validators'
  ];

  dirs.forEach(dir => {
    const dirPath = path.join(basePath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created ${moduleName}/${dir}`);
    }
  });

  // Create index.js if it doesn't exist
  const indexPath = path.join(basePath, 'index.js');
  if (!fs.existsSync(indexPath)) {
    const template = `/**
 * ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Module
 */

const express = require('express');
const ${moduleName}Controller = require('./controllers/${moduleName}.controller');
const { authenticate } = require('../../shared/middleware/auth');

const router = express.Router();

// Add your routes here
router.use(authenticate);

module.exports = router;
`;
    fs.writeFileSync(indexPath, template);
    console.log(`✅ Created ${moduleName}/index.js`);
  }
};

console.log('🚀 Starting backend migration...\n');

modules.forEach(module => {
  console.log(`\n📦 Processing module: ${module}`);
  createModuleStructure(module);
});

console.log('\n✅ Backend structure created!');
console.log('\n📝 Next steps:');
console.log('1. Move route handlers from backend/src/routes/ to respective module controllers');
console.log('2. Extract business logic to services');
console.log('3. Create repositories for database queries');
console.log('4. Add validators for input validation');
console.log('5. Update app.js to use new modules');
