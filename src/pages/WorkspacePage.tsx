import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUp, AudioLines, BookOpenText, Check, ChevronDown, Command, FilePlus2, Globe2,
  Menu, MessageSquare, Moon, MoreHorizontal, Pencil, Plus, Search, Settings2, Sparkles,
  Sun, Trash2, X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { createConversation, deleteConversation, listConversations, renameConversation } from '../services/conversations';
import type { Conversation } from '../types/conversation';

function relativeDate(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const difference = Math.round((day.getTime() - target.getTime()) / 86_400_000);
  if (difference <= 0) return 'Today';
  if (difference === 1) return 'Yesterday';
  if (difference < 7) return `${difference} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function WorkspacePage() {
  const { session } = useAuth();
  const user = session?.user;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return localStorage.getItem('karacter-theme') === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const refreshConversations = useCallback(async () => {
    if (!user) return;
    try {
      const records = await listConversations();
      setConversations(records);
      setLoadError('');
    } catch {
      setLoadError('Conversation history is not available yet. Apply the database migration after reviewing it against your Supabase project.');
    }
  }, [user]);

  useEffect(() => {
    void refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('karacter-theme', theme);
    } catch {
      // Theme still works for the current page if browser storage is unavailable.
    }
  }, [theme]);

  const visibleConversations = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase();
    return normalized
      ? conversations.filter((conversation) => conversation.title.toLocaleLowerCase().includes(normalized))
      : conversations;
  }, [conversations, search]);
  const selectedConversation = conversations.find((item) => item.id === selectedId) ?? null;

  async function handleNewConversation() {
    if (!user || busy) return;
    setBusy(true);
    setNotice('');
    try {
      const conversation = await createConversation(user.id);
      setConversations((current) => [conversation, ...current]);
      setSelectedId(conversation.id);
      setSidebarOpen(false);
      setLoadError('');
    } catch {
      setLoadError('Could not create a conversation. Check that the migration is applied and your session is valid.');
    } finally {
      setBusy(false);
    }
  }

  async function handleRename(conversation: Conversation) {
    const nextTitle = window.prompt('Rename conversation', conversation.title);
    if (nextTitle === null || nextTitle.trim() === conversation.title) return;
    try {
      await renameConversation(conversation.id, nextTitle);
      setConversations((current) => current.map((item) => item.id === conversation.id ? { ...item, title: nextTitle.trim() } : item));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not rename this conversation.');
    }
  }

  async function handleDelete(conversation: Conversation) {
    if (!window.confirm(`Delete “${conversation.title}”? This cannot be undone.`)) return;
    try {
      await deleteConversation(conversation.id);
      setConversations((current) => current.filter((item) => item.id !== conversation.id));
      if (selectedId === conversation.id) setSelectedId(null);
      setNotice('Conversation deleted.');
    } catch {
      setNotice('Could not delete this conversation.');
    }
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  const initials = (user?.email?.[0] ?? 'K').toLocaleUpperCase();

  return (
    <div className="workspace-shell">
      <button className={`sidebar-scrim ${sidebarOpen ? 'visible' : ''}`} aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand-row">
          <a className="brand-lockup" href="/" aria-label="Karacter AI workspace">
            <span className="brand-mark"><Sparkles size={17} strokeWidth={2.2} /></span>
            <span>karacter<span className="brand-ai">.ai</span></span>
          </a>
          <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><X size={17} /></button>
        </div>

        <button className="button button-new-chat" onClick={() => void handleNewConversation()} disabled={busy}>
          <Plus size={17} /><span>New conversation</span><span className="shortcut"><Command size={11} /> K</span>
        </button>

        <div className="sidebar-section-label">WORKSPACE</div>
        <button className="nav-item nav-item-active"><MessageSquare size={16} /><span>Conversations</span><span className="nav-count">{conversations.length || ''}</span></button>
        <button className="nav-item nav-item-muted" disabled title="Research history will be available in a later milestone"><BookOpenText size={16} /><span>Research</span><span className="coming-soon">SOON</span></button>

        <div className="history-heading"><span className="sidebar-section-label">RECENT</span><button className="icon-button history-search-toggle" aria-label="Search conversations" onClick={() => document.querySelector<HTMLInputElement>('.conversation-search input')?.focus()}><Search size={15} /></button></div>
        <label className="conversation-search"><Search size={14} /><input aria-label="Search conversations" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations" /></label>
        <div className="conversation-list" aria-label="Conversation history">
          {visibleConversations.length === 0 ? (
            <p className="sidebar-empty">{search ? 'No matching conversations' : 'Your conversations will appear here.'}</p>
          ) : visibleConversations.map((conversation) => (
            <div className={`conversation-row ${selectedId === conversation.id ? 'conversation-selected' : ''}`} key={conversation.id}>
              <button className="conversation-select" onClick={() => { setSelectedId(conversation.id); setSidebarOpen(false); }} title={conversation.title}>
                <MessageSquare size={14} /><span className="conversation-title">{conversation.title}</span>
              </button>
              <div className="conversation-actions">
                <button className="icon-button tiny-icon" aria-label={`Rename ${conversation.title}`} onClick={() => void handleRename(conversation)}><Pencil size={13} /></button>
                <button className="icon-button tiny-icon danger-hover" aria-label={`Delete ${conversation.title}`} onClick={() => void handleDelete(conversation)}><Trash2 size={13} /></button>
              </div>
              <span className="conversation-date">{relativeDate(conversation.updated_at)}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-feature-note"><span className="feature-note-icon"><Sparkles size={15} /></span><span><strong>Your AI workspace</strong><small>Private, personal, and in progress.</small></span></div>
          <button className="nav-item nav-item-muted" disabled title="Settings will be available in a later milestone"><Settings2 size={16} /><span>Settings</span><span className="coming-soon">SOON</span></button>
          <div className="account-row">
            <span className="avatar">{initials}</span>
            <span className="account-copy"><strong>{user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Your account'}</strong><small>{user?.email}</small></span>
            <button className="icon-button account-menu" aria-label="Sign out" title="Sign out" onClick={() => void handleSignOut()}><MoreHorizontal size={17} /></button>
          </div>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button>
          <div className="breadcrumb"><span>Workspace</span><ChevronDown size={14} /><span className="breadcrumb-current">{selectedConversation?.title ?? 'New conversation'}</span></div>
          <div className="topbar-actions">
            <span className="model-status"><span className="status-dot" /> AI engine <span className="status-label">not connected</span></span>
            <button className="icon-button theme-toggle" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button className="button button-quiet topbar-account" onClick={() => void handleSignOut()} title="Sign out">Sign out</button>
          </div>
        </header>

        <section className="workspace-content">
          {(loadError || notice) && <div className={`workspace-alert ${loadError ? 'alert-warning' : ''}`} role="status">{loadError || notice}<button className="icon-button" aria-label="Dismiss message" onClick={() => { setLoadError(''); setNotice(''); }}><X size={15} /></button></div>}
          {selectedConversation ? (
            <div className="conversation-empty-state">
              <span className="hero-orb small-orb"><Sparkles size={21} /></span>
              <span className="eyebrow">CONVERSATION SAVED</span>
              <h1>{selectedConversation.title}</h1>
              <p>This conversation is stored in your account. AI responses will be available when the server-side model connection is configured.</p>
              <button className="button button-secondary" onClick={() => setSelectedId(null)}>Back to workspace</button>
            </div>
          ) : (
            <div className="welcome-content">
              <div className="welcome-overline"><span className="welcome-line" /><span>YOUR SPACE TO THINK</span><span className="welcome-line" /></div>
              <div className="hero-orb"><div className="orb-ring orb-ring-outer" /><div className="orb-ring orb-ring-inner" /><Sparkles size={27} strokeWidth={1.6} /></div>
              <h1>A little more context.<br /><span>A lot more clarity.</span></h1>
              <p className="welcome-copy">A thoughtful space for your questions, ideas, and the work in between.</p>
              <div className="capability-tags"><span><MessageSquare size={14} /> Conversation</span><span><Globe2 size={14} /> Research</span><span><FilePlus2 size={14} /> Documents</span><span><AudioLines size={14} /> Voice</span></div>
              <div className="feature-grid">
                <button className="feature-card" disabled><span className="feature-icon icon-violet"><MessageSquare size={17} /></span><span className="feature-card-copy"><strong>Think it through</strong><small>Explore an idea with context that carries forward.</small></span><span className="feature-lock">SOON</span></button>
                <button className="feature-card" disabled><span className="feature-icon icon-blue"><Globe2 size={17} /></span><span className="feature-card-copy"><strong>Research with sources</strong><small>Bring the wider world into the conversation.</small></span><span className="feature-lock">SOON</span></button>
                <button className="feature-card" disabled><span className="feature-icon icon-amber"><FilePlus2 size={17} /></span><span className="feature-card-copy"><strong>Work with your files</strong><small>Find meaning in documents, images, and notes.</small></span><span className="feature-lock">SOON</span></button>
              </div>
            </div>
          )}

          <div className="composer-wrap">
            <div className="composer-box composer-disabled" aria-describedby="composer-note">
              <textarea aria-label="Message Karacter AI" placeholder="Ask anything, or start with an idea…" disabled rows={1} />
              <div className="composer-toolbar">
                <div className="composer-tools"><button className="composer-tool" disabled><Plus size={16} /><span>Attach</span></button><button className="composer-tool" disabled><Globe2 size={15} /><span>Search</span></button><button className="composer-tool" disabled><AudioLines size={15} /><span>Voice</span></button></div>
                <div className="composer-end"><span className="mode-label"><Sparkles size={13} /> Standard <ChevronDown size={13} /></span><button className="send-button" disabled aria-label="Send message"><ArrowUp size={17} /></button></div>
              </div>
            </div>
            <div className="composer-footnote" id="composer-note"><span className="footnote-status"><Check size={11} /></span> Conversation history is ready <span className="footnote-separator">·</span> AI services are not configured yet</div>
          </div>
        </section>

        <footer className="workspace-footer"><span>Karacter AI <span className="footer-version">FOUNDATION PREVIEW</span></span><span>Thoughtful by design <span className="footer-sparkle">✳</span></span></footer>
      </main>
    </div>
  );
}
