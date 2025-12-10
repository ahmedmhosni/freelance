const { Pool } = require('pg');
const bcrypt = require('./backend/node_modules/bcrypt');
require('dotenv').config({ path: './backend/.env.local' });

async function createLocalAdmin() {
    console.log('👤 CREATING LOCAL ADMIN USER');
    console.log('============================');
    
    const pool = new Pool({
        host: process.env.PG_HOST || 'localhost',
        port: process.env.PG_PORT || 5432,
        database: process.env.PG_DATABASE || 'roastify',
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || 'postgres123',
        ssl: false
    });

    try {
        const client = await pool.connect();
        
        // Check if admin user already exists
        const existingUser = await client.query(
            'SELECT id FROM users WHERE email = $1',
            ['admin@roastify.com']
        );
        
        if (existingUser.rows.length > 0) {
            console.log('✅ Admin user already exists');
            console.log('Email: admin@roastify.com');
            console.log('Password: admin123');
            client.release();
            await pool.end();
            return;
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Create admin user
        const result = await client.query(`
            INSERT INTO users (name, email, password, role, email_verified, is_active)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, email, role
        `, [
            'Admin User',
            'admin@roastify.com',
            hashedPassword,
            'admin',
            true,
            true
        ]);
        
        console.log('✅ Local admin user created successfully!');
        console.log('User details:', result.rows[0]);
        console.log('\n🔑 Login credentials:');
        console.log('Email: admin@roastify.com');
        console.log('Password: admin123');
        
        client.release();
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    }
}

createLocalAdmin().catch(console.error);