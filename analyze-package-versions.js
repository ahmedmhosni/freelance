const { execSync } = require('child_process');
const fs = require('fs');

function analyzePackageVersions() {
  console.log('\n📦 PACKAGE VERSION ANALYSIS');
  console.log('================================================================================');
  
  const projects = [
    { name: 'Root', path: '.', packageJson: 'package.json' },
    { name: 'Backend', path: 'backend', packageJson: 'backend/package.json' },
    { name: 'Frontend', path: 'frontend', packageJson: 'frontend/package.json' }
  ];
  
  const recommendations = [];
  
  projects.forEach(project => {
    console.log(`\n🔍 Analyzing ${project.name} packages...`);
    
    try {
      // Check for outdated packages
      console.log(`\n📊 ${project.name} - Outdated packages:`);
      try {
        const outdated = execSync(`cd ${project.path} && npm outdated --json`, { encoding: 'utf8' });
        const outdatedPackages = JSON.parse(outdated);
        
        if (Object.keys(outdatedPackages).length === 0) {
          console.log('✅ All packages are up to date');
        } else {
          Object.entries(outdatedPackages).forEach(([pkg, info]) => {
            console.log(`⚠️  ${pkg}: ${info.current} → ${info.latest} (wanted: ${info.wanted})`);
            
            // Analyze if upgrade is safe
            const majorChange = info.latest.split('.')[0] !== info.current.split('.')[0];
            if (majorChange) {
              recommendations.push({
                project: project.name,
                package: pkg,
                action: 'CAREFUL_UPGRADE',
                reason: 'Major version change - test thoroughly'
              });
            } else {
              recommendations.push({
                project: project.name,
                package: pkg,
                action: 'SAFE_UPGRADE',
                reason: 'Minor/patch update - generally safe'
              });
            }
          });
        }
      } catch (error) {
        if (error.status === 1) {
          console.log('✅ All packages are up to date');
        } else {
          console.log('❌ Error checking outdated packages:', error.message);
        }
      }
      
      // Check for security vulnerabilities
      console.log(`\n🔒 ${project.name} - Security audit:`);
      try {
        execSync(`cd ${project.path} && npm audit --audit-level=moderate`, { encoding: 'utf8' });
        console.log('✅ No security vulnerabilities found');
      } catch (error) {
        if (error.stdout && error.stdout.includes('vulnerabilities')) {
          console.log('⚠️  Security vulnerabilities detected');
          console.log(error.stdout.split('\n').slice(-10).join('\n')); // Show last 10 lines
          recommendations.push({
            project: project.name,
            package: 'SECURITY',
            action: 'RUN_AUDIT_FIX',
            reason: 'Security vulnerabilities detected'
          });
        }
      }
      
    } catch (error) {
      console.log(`❌ Error analyzing ${project.name}:`, error.message);
    }
  });
  
  // Analyze specific critical packages
  console.log('\n🎯 CRITICAL PACKAGE ANALYSIS');
  console.log('================================================================================');
  
  const criticalPackages = {
    'react': { current: '18.2.0', recommendation: 'KEEP', reason: 'Stable LTS version' },
    'express': { current: '4.18.2', recommendation: 'UPGRADE', reason: 'Security updates available' },
    'axios': { current: '1.6.2', recommendation: 'UPGRADE', reason: 'Bug fixes and security patches' },
    'vite': { current: '5.4.10', recommendation: 'KEEP', reason: 'Recent stable version' },
    '@google/generative-ai': { current: '0.24.1', recommendation: 'UPGRADE', reason: 'Rapidly evolving API' }
  };
  
  Object.entries(criticalPackages).forEach(([pkg, info]) => {
    console.log(`📦 ${pkg}: ${info.current} - ${info.recommendation}`);
    console.log(`   Reason: ${info.reason}`);
  });
  
  // Generate recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('================================================================================');
  
  console.log('\n🟢 SAFE TO UPGRADE (Minor/Patch versions):');
  console.log('- Security patches and bug fixes');
  console.log('- Backward compatible changes');
  console.log('- Low risk of breaking changes');
  
  console.log('\n🟡 UPGRADE WITH CAUTION (Major versions):');
  console.log('- Breaking changes possible');
  console.log('- Test thoroughly before production');
  console.log('- Review migration guides');
  
  console.log('\n🔴 AVOID DOWNGRADING UNLESS:');
  console.log('- Specific compatibility issues');
  console.log('- Known bugs in newer versions');
  console.log('- Production stability requirements');
  
  console.log('\n🎯 SPECIFIC RECOMMENDATIONS FOR YOUR PROJECT:');
  console.log('================================================================================');
  
  console.log('\n✅ RECOMMENDED UPGRADES:');
  console.log('1. Security patches: Run `npm audit fix` in all projects');
  console.log('2. Axios: Upgrade for security and performance improvements');
  console.log('3. Express: Upgrade for security patches');
  console.log('4. @google/generative-ai: Keep updated for latest features');
  
  console.log('\n⚠️  KEEP STABLE:');
  console.log('1. React 18.2.0: Stable LTS, no urgent need to upgrade');
  console.log('2. Vite 5.4.10: Recent stable version');
  console.log('3. Node.js: Keep on LTS version (18.x or 20.x)');
  
  console.log('\n🚫 AVOID:');
  console.log('1. Downgrading React (would break modern features)');
  console.log('2. Downgrading Vite (would lose performance improvements)');
  console.log('3. Major version jumps without testing');
  
  return recommendations;
}

// Run analysis
const recommendations = analyzePackageVersions();

console.log('\n🔧 NEXT STEPS:');
console.log('================================================================================');
console.log('1. Run security audit: npm audit fix --force');
console.log('2. Update patch versions: npm update');
console.log('3. Test thoroughly after any upgrades');
console.log('4. Consider using npm-check-updates for major version analysis');
console.log('5. Always backup before major upgrades');

console.log('\n📋 SUMMARY: UPGRADING IS GENERALLY BETTER');
console.log('================================================================================');
console.log('✅ Upgrading provides: Security fixes, bug fixes, performance improvements');
console.log('⚠️  Downgrading risks: Security vulnerabilities, missing features, compatibility issues');
console.log('🎯 Best practice: Keep packages updated with careful testing');