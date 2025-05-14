// This file is for testing purposes only
// Use environment variables or fallback to test values
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.TEST_SUPABASE_URL || 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.TEST_SERVICE_ROLE_KEY || 'test-service-role-key';

// Use mock Redis for testing
process.env.USE_MOCK_REDIS = 'true';

// Import dotenv to load any other test environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

console.log('Test configuration loaded with mock Redis');
