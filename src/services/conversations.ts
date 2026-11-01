import type { Conversation } from '../types/conversation';
import { supabase } from '../lib/supabase';

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured. Add the project URL and public anon key.');
  return supabase;
}

export async function listConversations(): Promise<Conversation[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('conversations')
    .select('id, user_id, title, summary, created_at, updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createConversation(userId: string): Promise<Conversation> {
  const client = requireClient();
  const { data, error } = await client
    .from('conversations')
    .insert({ user_id: userId, title: 'New conversation' })
    .select('id, user_id, title, summary, created_at, updated_at')
    .single();
  if (error) throw error;
  return data;
}

export async function renameConversation(id: string, title: string): Promise<void> {
  const normalizedTitle = title.trim();
  if (!normalizedTitle || normalizedTitle.length > 160) {
    throw new Error('Conversation titles must contain 1–160 characters.');
  }
  const { error } = await requireClient()
    .from('conversations')
    .update({ title: normalizedTitle })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteConversation(id: string): Promise<void> {
  const { error } = await requireClient().from('conversations').delete().eq('id', id);
  if (error) throw error;
}
