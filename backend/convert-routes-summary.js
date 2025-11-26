const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

console.log('═══════════════════════════════════════════════════════════');
console.log('ROUTE FILES CONVERSION STATUS');
console.log('═══════════════════════════════════════════════════════════\n');

const converted = [];
const needsConversion = [];
const alreadyPostgres = [];

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasSqlServer = content.includes('require(\'mssql\')') || content.includes('sql.Int') || content.includes('sql.NVarChar');
  const hasPostgres = content.includes('pg-helper') || content.includes('queries-pg');
  
  if (hasPostgres) {
    alreadyPostgres.push(file);
  } else if (hasSqlServer) {
    needsConversion.push(file);
  } else {
    converted.push(file);
  }
});

console.log('✅ Already using PostgreSQL:');
alreadyPostgres.forEach(f => console.log(`   - ${f}`));

console.log('\n✓  No SQL Server code (likely simple routes):');
converted.forEach(f => console.log(`   - ${f}`));

console.log('\n❌ Still needs conversion:');
needsConversion.forEach(f => console.log(`   - ${f}`));

console.log('\n═══════════════════════════════════════════════════════════');
console.log(`Total: ${files.length} files`);
console.log(`PostgreSQL: ${alreadyPostgres.length}`);
console.log(`No SQL: ${converted.length}`);
console.log(`Needs conversion: ${needsConversion.length}`);
console.log('═══════════════════════════════════════════════════════════\n');
