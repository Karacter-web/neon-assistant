import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const projectUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const publishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

function isValidProjectUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const hostedProject = url.protocol === 'https:' && url.hostname.endsWith('.supabase.co');
    const localProject = url.protocol === 'http:'
      && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
      && url.port === '54321';
    return hostedProject || localProject;
  } catch {
    return false;
  }
}

export const supabaseConfigured = isValidProjectUrl(projectUrl)
  && publishableKey.length > 20
  && !publishableKey.toLowerCase().includes('your-supabase');

/** Browser client: only the public publishable/anon key belongs here. */
export const supabase = supabaseConfigured
  ? createClient<Database>(projectUrl, publishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null;
