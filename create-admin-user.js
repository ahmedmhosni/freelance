const bcrypt = require('./backend/node_modules/bcrypt');

const password = 'SosoNono#123456';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('\nBcrypt hash for password:', hash);
  console.log('\nSQL Query to run in Azure Cloud Shell:');
  console.log('=====================================\n');
  console.log(`export PGPASSWORD="AHmed#123456"`);
  console.log(`psql -h roastifydbpost.postgres.database.azure.com -p 5432 -U adminuser -d roastifydb -c "INSERT INTO users (name, email, password, role, email_verified, is_active) VALUES ('Ahmed Hosni', 'ahmedmhosni90@gmail.com', '${hash}', 'admin', true, true);"`);
  console.log('\n=====================================\n');
  console.log('Login credentials:');
  console.log('Email: ahmedmhosni90@gmail.com');
  console.log('Password: SosoNono#123456');
});
