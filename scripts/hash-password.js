/**
 * Utility script to generate bcrypt password hashes
 * Run with: node scripts/hash-password.js
 */

const bcrypt = require('bcryptjs');

// The plain text password you want to hash
const plainPassword = 'password123'; // Change this to your desired password

// Generate hash
bcrypt.hash(plainPassword, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  
  console.log('\n=== Password Hash Generated ===');
  console.log('Plain password:', plainPassword);
  console.log('Bcrypt hash:', hash);
  console.log('\nUpdate your database with this SQL:');
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'client.johnson@corp.com';`);
  console.log('\n================================\n');
});
