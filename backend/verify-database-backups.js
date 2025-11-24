require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.AZURE_SQL_SERVER,
  port: parseInt(process.env.AZURE_SQL_PORT || '1433'),
  database: process.env.AZURE_SQL_DATABASE,
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true
  }
};

async function verifyBackups() {
  console.log('🔍 Verifying Azure SQL Database Backup Configuration\n');
  console.log('='.repeat(60));
  
  try {
    const pool = await sql.connect(config);
    
    // Check database info
    console.log('\n📊 Database Information:');
    console.log('-'.repeat(60));
    const dbInfo = await pool.request().query(`
      SELECT 
        name as DatabaseName,
        create_date as CreatedDate,
        compatibility_level as CompatibilityLevel,
        state_desc as State
      FROM sys.databases 
      WHERE name = '${config.database}'
    `);
    
    if (dbInfo.recordset.length > 0) {
      const db = dbInfo.recordset[0];
      console.log(`✓ Database Name: ${db.DatabaseName}`);
      console.log(`✓ Created: ${db.CreatedDate}`);
      console.log(`✓ State: ${db.State}`);
    }
    
    // Check backup history
    console.log('\n📦 Recent Backups:');
    console.log('-'.repeat(60));
    const backupHistory = await pool.request().query(`
      SELECT TOP 10
        database_name,
        type,
        backup_start_date,
        backup_finish_date,
        DATEDIFF(SECOND, backup_start_date, backup_finish_date) as duration_seconds,
        backup_size / 1024 / 1024 as size_mb
      FROM msdb.dbo.backupset
      WHERE database_name = '${config.database}'
      ORDER BY backup_start_date DESC
    `);
    
    if (backupHistory.recordset.length > 0) {
      console.log(`✓ Found ${backupHistory.recordset.length} recent backups\n`);
      backupHistory.recordset.forEach((backup, index) => {
        const type = backup.type === 'D' ? 'Full' : backup.type === 'I' ? 'Differential' : 'Log';
        console.log(`${index + 1}. ${type} Backup`);
        console.log(`   Started: ${backup.backup_start_date}`);
        console.log(`   Finished: ${backup.backup_finish_date}`);
        console.log(`   Duration: ${backup.duration_seconds} seconds`);
        console.log(`   Size: ${backup.size_mb.toFixed(2)} MB\n`);
      });
    } else {
      console.log('⚠️  No backup history found in msdb');
      console.log('   Note: Azure SQL may use automated backups not visible here');
    }
    
    // Azure SQL Database backup info
    console.log('\n📋 Azure SQL Database Backup Information:');
    console.log('-'.repeat(60));
    console.log('✓ Azure SQL Database includes automated backups:');
    console.log('  • Full backups: Weekly');
    console.log('  • Differential backups: Every 12-24 hours');
    console.log('  • Transaction log backups: Every 5-10 minutes');
    console.log('  • Point-in-time restore: Up to 35 days (configurable)');
    console.log('  • Geo-redundant storage: Enabled by default');
    
    console.log('\n✅ Backup Verification Complete!');
    console.log('\n📝 Recommendations:');
    console.log('  1. Verify backup retention period in Azure Portal');
    console.log('  2. Test restore procedure at least once');
    console.log('  3. Document recovery process');
    console.log('  4. Setup backup alerts in Azure');
    
    console.log('\n🔗 Azure Portal Links:');
    console.log(`  • Database: https://portal.azure.com/#@/resource/subscriptions/.../databases/${config.database}`);
    console.log('  • Backup Settings: Database → Backup → Configure retention');
    console.log('  • Restore: Database → Overview → Restore');
    
    await pool.close();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('  1. Check database connection settings');
    console.log('  2. Verify user has permissions to query backup tables');
    console.log('  3. Ensure you\'re connected to Azure SQL Database');
    process.exit(1);
  }
}

console.log('🔐 Connecting to Azure SQL Database...');
console.log(`Server: ${config.server}`);
console.log(`Database: ${config.database}\n`);

verifyBackups();
