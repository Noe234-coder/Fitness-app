import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Fíjate en las comillas simples al principio y al final:
const supabaseUrl = 'https://tmsxbbhshymwdfntjkhu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZHpxeW5panpoY3VyemloaHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTY5NTQsImV4cCI6MjA4ODczMjk1NH0.WzLU8krpjJGpKRqroGnb7nxS-A5KQTvddT9ByPz3zuI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});