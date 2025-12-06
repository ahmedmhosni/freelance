const fs = require('fs').promises;
const path = require('path');

/**
 * Fix Module Structure Inconsistencies
 * Adds missing directories and standardizes structure
 */

const MODULES_PATH = path.join(__dirname, '../src/modules');

// Modules that need repositories (perform CRUD on their own entities)
const MODULES_NEEDING_REPOSITORIES = ['admin', 'notifications'];

// Modules that need DTOs (have complex data transfer objects)
const MODULES_NEEDING_DTOS = ['admin', 'auth', 'notifications', 'reports'];

// Modules that need validators (have input validation)
const MODULES_NEEDING_VALIDATORS = ['admin', 'auth', 'notifications', 'reports'];

async function createDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create directory ${dirPath}:`, error.message);
    return false;
  }
}

async function createGitkeep(dirPath) {
  try {
    const gitkeepPath = path.join(dirPath, '.gitkeep');
    await fs.writeFile(gitkeepPath, '');
    console.log(`✅ Created .gitkeep in: ${dirPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create .gitkeep in ${dirPath}:`, error.message);
    return false;
  }
}

async function fixModuleStructure() {
  console.log('=== Fixing Module Structure Inconsistencies ===\n');
  
  const results = {
    directoriesCreated: 0,
    gitkeepsCreated: 0,
    errors: []
  };

  // Fix admin module
  console.log('\n--- Fixing admin module ---');
  const adminPath = path.join(MODULES_PATH, 'admin');
  
  if (MODULES_NEEDING_REPOSITORIES.includes('admin')) {
    const repoPath = path.join(adminPath, 'repositories');
    if (await createDirectory(repoPath)) {
      results.directoriesCreated++;
      if (await createGitkeep(repoPath)) {
        results.gitkeepsCreated++;
      }
    }
  }
  
  if (MODULES_NEEDING_DTOS.includes('admin')) {
    const dtoPath = path.join(adminPath, 'dto');
    if (await createDirectory(dtoPath)) {
      results.directoriesCreated++;
      if (await createGitkeep(dtoPath)) {
        results.gitkeepsCreated++;
      }
    }
  }
  
  if (MODULES_NEEDING_VALIDATORS.includes('admin')) {
    const validatorsPath = path.join(adminPath, 'validators');
    if (await createDirectory(validatorsPath)) {
      results.directoriesCreated++;
      if (await createGitkeep(validatorsPath)) {
        results.gitkeepsCreated++;
      }
    }
  }

  // Fix auth module
  console.log('\n--- Fixing auth module ---');
  const authPath = path.join(MODULES_PATH, 'auth');
  
  if (MODULES_NEEDING_REPOSITORIES.includes('auth')) {
    const repoPath = path.join(authPath, 'repositories');
    if (await createDirectory(repoPath)) {
      results.directoriesCreated++;
      if (await createGitkeep(repoPath)) {
        results.gitkeepsCreated++;
      }
    }
  }
  
  if (MODULES_NEEDING_DTOS.includes('auth')) {
    const dtoPath = path.join(authPath, 'dto');
    if (await createDirectory(dtoPath)) {
      results.directoriesCreated++;
      if (await createGitkeep(dtoPath)) {
        results.gitkeepsCreated++;
      }
    }
  }
  
  if (MODULES_NEEDING_VALIDATORS.includes('auth')) {
    const validatorsPath = path.join(authPath, 'validators');
    if (await createDirectory(validatorsPath)) {
      results.directoriesCreated++;
      if (await createGitkeep(validatorsPath)) {
        results.gitkeepsCreated++;
      }
    }
  }

  // Fix notifications module
  console.log('\n--- Fixing notifications module ---');
  const notificationsPath = path.join(MODULES_PATH, 'notifications');
  
  if (MODULES_NEEDING_DTOS.includes('notifications')) {
    const dtoPath = path.join(notificationsPath, 'dto');
    if (await createDirectory(dtoPath)) {
      results.directoriesCreated++;
      if (await createGitkeep(dtoPath)) {
        results.gitkeepsCreated++;
      }
    }
  }
  
  if (MODULES_NEEDING_VALIDATORS.includes('notifications')) {
    const validatorsPath = path.join(notificationsPath, 'validators');
    if (await createDirectory(validatorsPath)) {
      results.directoriesCreated++;
      if (await createGitkeep(validatorsPath)) {
        results.gitkeepsCreated++;
      }
    }
  }

  // Fix reports module
  console.log('\n--- Fixing reports module ---');
  const reportsPath = path.join(MODULES_PATH, 'reports');
  
  if (MODULES_NEEDING_REPOSITORIES.includes('reports')) {
    const repoPath = path.join(reportsPath, 'repositories');
    if (await createDirectory(repoPath)) {
      results.directoriesCreated++;
      if (await createGitkeep(repoPath)) {
        results.gitkeepsCreated++;
      }
    }
  }
  
  if (MODULES_NEEDING_DTOS.includes('reports')) {
    const dtoPath = path.join(reportsPath, 'dto');
    if (await createDirectory(dtoPath)) {
      results.directoriesCreated++;
      if (await createGitkeep(dtoPath)) {
        results.gitkeepsCreated++;
      }
    }
  }
  
  if (MODULES_NEEDING_VALIDATORS.includes('reports')) {
    const validatorsPath = path.join(reportsPath, 'validators');
    if (await createDirectory(validatorsPath)) {
      results.directoriesCreated++;
      if (await createGitkeep(validatorsPath)) {
        results.gitkeepsCreated++;
      }
    }
  }

  console.log('\n\n=== Summary ===');
  console.log(`Directories created: ${results.directoriesCreated}`);
  console.log(`Gitkeep files created: ${results.gitkeepsCreated}`);
  
  if (results.errors.length > 0) {
    console.log(`\nErrors encountered: ${results.errors.length}`);
    results.errors.forEach(err => console.log(`  - ${err}`));
  } else {
    console.log('\n✅ All module structure inconsistencies fixed successfully!');
  }

  return results;
}

// Run the fix
fixModuleStructure()
  .then(() => {
    console.log('\n✅ Module structure fix complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error fixing module structure:', error);
    process.exit(1);
  });
