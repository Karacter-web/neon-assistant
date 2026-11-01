import { describe, expect, it } from 'vitest';
import { listConversations, renameConversation } from './conversations';

describe('conversation service', () => {
  it('fails closed when Supabase is not configured', async () => {
    await expect(listConversations()).rejects.toThrow('Supabase is not configured');
  });

  it('rejects empty and overlong titles before making a request', async () => {
    await expect(renameConversation('conversation-id', '   ')).rejects.toThrow('1–160 characters');
    await expect(renameConversation('conversation-id', 'x'.repeat(161))).rejects.toThrow('1–160 characters');
  });
});
