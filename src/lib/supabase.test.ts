import { describe, expect, it } from 'vitest';
import { supabase, supabaseConfigured } from './supabase';

describe('Supabase browser configuration', () => {
  it('does not create a browser client when project credentials are absent', () => {
    expect(supabaseConfigured).toBe(false);
    expect(supabase).toBeNull();
  });
});
