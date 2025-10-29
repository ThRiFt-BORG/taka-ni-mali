// /test-db.js

// Manually load environment variables from .env.local
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

// Import the same library Drizzle uses
import mysql from 'mysql2/promise';

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;

  console.log('Attempting to connect to database...');
  console.log(`Connection String: ${connectionString}`); // This will show us the exact URL it's using

  if (!connectionString) {
    console.error('❌ ERROR: DATABASE_URL is not defined in .env.local!');
    return;
  }

  try {
    // Try to create a connection
    const connection = await mysql.createConnection(connectionString);
    
    // If we get here, it worked!
    console.log('✅✅✅ SUCCESS: Database connection successful!');
    
    // Close the connection
    await connection.end();

  } catch (error) {
    // If it fails, print the error
    console.error('❌❌❌ FAILED: Could not connect to the database.');
    console.error(error);
  }
}

testConnection();