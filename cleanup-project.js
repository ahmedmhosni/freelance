// Cleanup unwanted files from the project
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('   Project Cleanup');
console.log('========================================\n');

const filesToDelete = [
  // Documentation files (temporary/development)
  'ADMIN_GDPR_PANEL_COMPLETE.md',
  'AZURE_ENV_FIX.md',
  'AZURE_ENV_VARIABLES.md',
  'CHANGELOG_EXAMPLE.md',
  'CHANGELOG_EXAMPLE_2.md',
  'CHANGELOG_EXAMPLE_3.md',
  'CHANGELOG_SYSTEM_FINAL.md',
  'DEPLOYMENT_COMPLETE.md',
  'DEPLOYMENT_STEPS.md',
  'DEPLOY_EMAIL_FIX.md',
  'DEPLOY_NOW.md',
  'EMAIL_FIX_COMPLETE.md',
  'FIXES_APPLIED.md',
  'GDPR_FEATURES_COMPLETE.md',
  'GDPR_IMPLEMENTATION_SUMMARY.md',
  'GIT_COMMITS_SYSTEM_COMPLETE.md',
  'LAUNCH_READINESS_REPORT.md',
  'PRE_DEPLOYMENT_CHECKLIST.md',
  'PRE_LAUNCH_CHECKLIST.md',
  'PRODUCTION_MIGRATION_SQL.md',
  'READY_TO_DEPLOY.md',
  'SECURITY_AUDIT_COMPLETE.md',
  'SIMPLE_CHANGELOG_READY.md',
  'VERSIONING_SYSTEM_COMPLETE.md',
  'VERSION_DISPLAY_FIXED.md',
  
  // Backend test/fix scripts
  'backend/fix-auth-complete.js',
  'backend/fix-auth-postgresql.js',
  'backend/test-email-production.js',
  'backend/verify-production-config.js',
  'backend/security-audit-fix.js',
  'backend/compare-databases.js',
  'backend/inspect-databases.js',
  'backend/run-sync-migration.js',
  
  // Backup files
  'backend/src/routes/auth.js.backup',
  
  // Old migration scripts
  'backend/run-changelog-migration-local.js',
  'backend/run-simple-changelog-migration.js',
  'backend/run-version-names-migration.js',
  'backend/run-version-names-system-migration.js',
  
  // Database fix scripts
  'database/fix-invoice-triggers.bat',
  'database/fix-maintenance-azure.bat',
  'database/fix-tasks-azure.bat',
  'database/apply-changelog-migration.bat',
  'database/run-changelog-migration.js',
  'database/run-production-changelog-migrations.js',
  
  // Old component backups
  'frontend/src/components/Loader.jsx.backup',
  'frontend/src/pages/Profile.jsx.backup',
];

const filesToKeep = [
  // Keep important documentation
  'README.md',
  'PRE_LAUNCH_CHECKLIST.md', // Keep for reference
  
  // Keep production migration scripts
  'backend/run-changelog-system-migration.js',
  'backend/run-gdpr-migration.js',
  'backend/run-gdpr-migration-local.js',
  'backend/run-git-commits-migration.js',
  'backend/run-production-changelog-migrations.js',
  'backend/run-version-names-production.js',
  'backend/run-version-names-system-production.js',
  
  // Keep database migrations
  'database/migrations/',
];

let deletedCount = 0;
let notFoundCount = 0;
let errors = [];

console.log('Cleaning up temporary and test files...\n');

filesToDelete.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${file}`);
      deletedCount++;
    } catch (error) {
      console.log(`❌ Error deleting ${file}: ${error.message}`);
      errors.push({ file, error: error.message });
    }
  } else {
    notFoundCount++;
  }
});

// Clean up log files
console.log('\nCleaning up log files...');
const logsDir = path.join(__dirname, 'backend/logs');
if (fs.existsSync(logsDir)) {
  const logFiles = fs.readdirSync(logsDir);
  logFiles.forEach(file => {
    if (file.endsWith('.log')) {
      try {
        fs.unlinkSync(path.join(logsDir, file));
        console.log(`✅ Deleted: backend/logs/${file}`);
        deletedCount++;
      } catch (error) {
        console.log(`❌ Error deleting log: ${error.message}`);
      }
    }
  });
}

console.log('\n========================================');
console.log('   Cleanup Summary');
console.log('========================================\n');
console.log(`✅ Files deleted: ${deletedCount}`);
console.log(`⚠️  Files not found: ${notFoundCount}`);
console.log(`❌ Errors: ${errors.length}\n`);

if (errors.length > 0) {
  console.log('Errors encountered:');
  errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
  console.log('');
}

console.log('Files kept for production:');
console.log('  ✅ README.md');
console.log('  ✅ Production migration scripts');
console.log('  ✅ Database migrations');
console.log('  ✅ .env.example (for reference)');
console.log('  ✅ ecosystem.config.js (PM2 config)');
console.log('  ✅ All source code\n');

console.log('✅ Cleanup complete!\n');
console.log('Next steps:');
console.log('1. Review the changes');
console.log('2. Run: git status');
console.log('3. If satisfied, commit: git add . && git commit -m "chore: Clean up temporary files"');
console.log('4. Push: git push\n');
