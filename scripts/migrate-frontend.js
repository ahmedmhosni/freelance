/**
 * Frontend Migration Script
 * Helps migrate existing code to new feature-based structure
 */

const fs = require('fs');
const path = require('path');

const features = [
  'auth',
  'clients',
  'projects',
  'tasks',
  'invoices',
  'quotes',
  'time-tracking',
  'reports',
  'dashboard',
  'admin',
  'announcements',
  'changelog',
  'profile',
  'home'
];

const createFeatureStructure = (featureName) => {
  const basePath = path.join(__dirname, '../frontend/src-new/features', featureName);
  
  const dirs = [
    'components',
    'hooks',
    'services',
    'types',
    'pages'
  ];

  dirs.forEach(dir => {
    const dirPath = path.join(basePath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created ${featureName}/${dir}`);
    }
  });

  // Create index.js if it doesn't exist
  const indexPath = path.join(basePath, 'index.js');
  if (!fs.existsSync(indexPath)) {
    const template = `/**
 * ${featureName.charAt(0).toUpperCase() + featureName.slice(1)} Feature Module
 */

// Export pages
// export { default as ${featureName}Page } from './pages/${featureName}Page';

// Export components
// export { default as ${featureName}List } from './components/${featureName}List';

// Export hooks
// export { use${featureName} } from './hooks/use${featureName}';

// Export services
// export * from './services/${featureName}.service';
`;
    fs.writeFileSync(indexPath, template);
    console.log(`✅ Created ${featureName}/index.js`);
  }
};

console.log('🚀 Starting frontend migration...\n');

features.forEach(feature => {
  console.log(`\n📦 Processing feature: ${feature}`);
  createFeatureStructure(feature);
});

console.log('\n✅ Frontend structure created!');
console.log('\n📝 Next steps:');
console.log('1. Move pages from frontend/src/pages/ to respective feature/pages/');
console.log('2. Move components to feature-specific or shared/components/');
console.log('3. Extract API calls to feature services');
console.log('4. Create feature-specific hooks');
console.log('5. Update imports in App.jsx');
