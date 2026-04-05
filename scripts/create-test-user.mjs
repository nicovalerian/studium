#!/usr/bin/env node

/**
 * Creates a test user for E2E testing
 * Usage: node scripts/create-test-user.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_EMAIL = 'test-e2e@studium.test';
const TEST_PASSWORD = 'test-e2e-password-' + Math.random().toString(36).substring(7);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTestUser() {
  console.log('🔧 Creating test user for E2E tests...\n');

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find((u) => u.email === TEST_EMAIL);

  if (existingUser) {
    console.log('✓ Test user already exists:', TEST_EMAIL);
    console.log('  User ID:', existingUser.id);
    console.log('  Email confirmed:', !!existingUser.email_confirmed_at);

    // Check if user has a class
    const { data: classData } = await supabase
      .from('classes')
      .select('id')
      .eq('user_id', existingUser.id)
      .single();

    if (classData) {
      console.log('  Class ID:', classData.id);
    } else {
      console.log('  No class found - will be created on first login');
    }

    console.log('\n⚠️  Using existing password from environment or regenerating');
    return { email: TEST_EMAIL, exists: true };
  }

  // Create new user with email verification
  const { data, error } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true, // Auto-confirm email for testing
  });

  if (error) {
    console.error('❌ Failed to create user:', error.message);
    process.exit(1);
  }

  console.log('✓ Test user created:', TEST_EMAIL);
  console.log('  User ID:', data.user.id);
  console.log('  Email confirmed: true');
  console.log('  Password:', TEST_PASSWORD);

  console.log('\n📝 Add these to your .env.local:\n');
  console.log('E2E_TESTING=true');
  console.log(`TEST_USER_EMAIL=${TEST_EMAIL}`);
  console.log(`TEST_USER_PASSWORD=${TEST_PASSWORD}`);
  console.log();

  return { email: TEST_EMAIL, password: TEST_PASSWORD, userId: data.user.id };
}

createTestUser()
  .then(() => {
    console.log('✅ Test user setup complete!\n');
  })
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
