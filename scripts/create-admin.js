/**
 * Script to create an admin user in Supabase Auth
 * Run this with: node scripts/create-admin.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminInAuth() {
  const email = 'themelodium@gmail.com';
  const password = 'Krittin99';

  console.log('Creating admin user in Supabase Auth...');
  
  // Sign up the user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Admin User',
      },
    },
  });

  if (error) {
    console.error('Error creating admin:', error.message);
    
    // If user already exists, try to get their ID
    if (error.message.includes('already registered')) {
      console.log('\nUser already exists in Supabase Auth.');
      console.log('You need to update your users table with the auth_user_id.');
      console.log('\nSteps:');
      console.log('1. Sign in with this account once');
      console.log('2. Check the auth.users table in Supabase for the user ID');
      console.log('3. Update your users table to link the auth_user_id');
    }
    return;
  }

  if (data.user) {
    console.log('\n✅ Admin user created successfully!');
    console.log('Auth User ID:', data.user.id);
    console.log('\nNow update your users table:');
    console.log(`UPDATE users SET auth_user_id = '${data.user.id}' WHERE email = '${email}';`);
  }
}

createAdminInAuth().catch(console.error);
