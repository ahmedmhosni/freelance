const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  const status = exists ? '✓' : '✗';
  const color = exists ? 'green' : 'red';
  log(`${status} ${description}`, color);
  if (exists) {
    const stats = fs.statSync(filePath);
    log(`  Size: ${stats.size} bytes`, 'cyan');
  }
  return exists;
}

function checkFileContent(filePath, searchStrings, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const allFound = searchStrings.every(str => content.includes(str));
    const status = allFound ? '✓' : '✗';
    const color = allFound ? 'green' : 'red';
    log(`${status} ${description}`, color);
    
    searchStrings.forEach(str => {
      const found = content.includes(str);
      log(`  ${found ? '✓' : '✗'} Contains: "${str.substring(0, 50)}..."`, found ? 'cyan' : 'yellow');
    });
    
    return allFound;
  } catch (error) {
    log(`✗ ${description}`, 'red');
    log(`  Error: ${error.message}`, 'red');
    return false;
  }
}

log('\n🔍 Verifying Profile System Setup\n', 'blue');
log('='.repeat(60), 'blue');

let totalChecks = 0;
let passedChecks = 0;

// Frontend Components
log('\n📁 Frontend Components', 'yellow');
log('-'.repeat(60));

const frontendChecks = [
  {
    file: 'frontend/src/features/profile/pages/Profile.jsx',
    desc: 'Profile editing page',
    content: ['AvatarPicker', 'profile_picture', 'job_title', 'bio']
  },
  {
    file: 'frontend/src/features/profile/pages/PublicProfile.jsx',
    desc: 'Public profile view page',
    content: ['useParams', 'username', 'profile_picture', 'social']
  },
  {
    file: 'frontend/src/features/profile/components/AvatarPicker.jsx',
    desc: 'Avatar picker component',
    content: ['AVATAR_STYLES', 'handleFileUpload', 'dicebear']
  }
];

frontendChecks.forEach(check => {
  totalChecks++;
  if (checkFile(check.file, check.desc)) {
    totalChecks++;
    if (checkFileContent(check.file, check.content, `  Content check: ${check.desc}`)) {
      passedChecks += 2;
    } else {
      passedChecks++;
    }
  }
});

// Backend Routes
log('\n📁 Backend Routes', 'yellow');
log('-'.repeat(60));

const backendChecks = [
  {
    file: 'backend/src/routes/profile.js',
    desc: 'Profile API routes',
    content: ['/me', '/:username', 'profile_visibility', 'authenticateToken']
  }
];

backendChecks.forEach(check => {
  totalChecks++;
  if (checkFile(check.file, check.desc)) {
    totalChecks++;
    if (checkFileContent(check.file, check.content, `  Content check: ${check.desc}`)) {
      passedChecks += 2;
    } else {
      passedChecks++;
    }
  }
});

// Frontend Routes Registration
log('\n📁 Frontend Routes', 'yellow');
log('-'.repeat(60));

totalChecks++;
if (checkFile('frontend/src/App.jsx', 'App.jsx (routes)')) {
  totalChecks++;
  if (checkFileContent(
    'frontend/src/App.jsx',
    ['PublicProfile', '/profile/:username', 'Profile', '/profile'],
    '  Routes registered'
  )) {
    passedChecks += 2;
  } else {
    passedChecks++;
  }
}

// Database Migrations
log('\n📁 Database Migrations', 'yellow');
log('-'.repeat(60));

const migrationChecks = [
  {
    file: 'database/migrations/ADD_USER_PROFILE_FIELDS.sql',
    desc: 'Profile fields migration (SQL Server)',
    content: ['username', 'job_title', 'bio', 'profile_picture', 'profile_visibility']
  },
  {
    file: 'database/migrations/ADD_USER_PROFILE_FIELDS_AZURE.sql',
    desc: 'Profile fields migration (Azure)',
    content: ['username', 'job_title', 'bio', 'profile_picture', 'profile_visibility']
  }
];

migrationChecks.forEach(check => {
  totalChecks++;
  if (checkFile(check.file, check.desc)) {
    totalChecks++;
    if (checkFileContent(check.file, check.content, `  Content check: ${check.desc}`)) {
      passedChecks += 2;
    } else {
      passedChecks++;
    }
  }
});

// Backend Server Registration
log('\n📁 Backend Server', 'yellow');
log('-'.repeat(60));

totalChecks++;
if (checkFile('backend/src/server.js', 'Server.js')) {
  totalChecks++;
  if (checkFileContent(
    'backend/src/server.js',
    ['profileRoutes', '/profile'],
    '  Profile routes registered'
  )) {
    passedChecks += 2;
  } else {
    passedChecks++;
  }
}

// Feature Exports
log('\n📁 Feature Exports', 'yellow');
log('-'.repeat(60));

totalChecks++;
if (checkFile('frontend/src/features/profile/index.js', 'Profile feature index')) {
  totalChecks++;
  const content = fs.readFileSync('frontend/src/features/profile/index.js', 'utf8');
  const hasExports = content.includes('Profile') && content.includes('PublicProfile');
  if (hasExports) {
    log('✓   Exports Profile and PublicProfile', 'green');
    passedChecks += 2;
  } else {
    log('✗   Missing exports', 'red');
    passedChecks++;
  }
}

// Summary
log('\n' + '='.repeat(60), 'blue');
log('\n📊 Verification Summary\n', 'blue');
log(`Total Checks: ${totalChecks}`);
log(`✓ Passed: ${passedChecks}`, 'green');
log(`✗ Failed: ${totalChecks - passedChecks}`, totalChecks - passedChecks > 0 ? 'red' : 'green');
log(`Success Rate: ${Math.round((passedChecks / totalChecks) * 100)}%\n`);

log('='.repeat(60), 'blue');

if (passedChecks === totalChecks) {
  log('\n🎉 Profile system is fully set up and ready!\n', 'green');
  log('✅ All components exist', 'green');
  log('✅ All routes are registered', 'green');
  log('✅ Database migrations are in place', 'green');
  log('✅ Avatar picker is configured', 'green');
  log('\n📝 To test the profile system:', 'cyan');
  log('   1. Start the backend: cd backend && npm start', 'cyan');
  log('   2. Start the frontend: cd frontend && npm run dev', 'cyan');
  log('   3. Register a new user', 'cyan');
  log('   4. Go to /app/profile to edit your profile', 'cyan');
  log('   5. Visit /profile/your-username to see public profile\n', 'cyan');
} else {
  log('\n⚠️  Some components are missing or incomplete.\n', 'yellow');
  log('Please review the failed checks above.\n', 'yellow');
}
