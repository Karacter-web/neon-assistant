import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Code2, KeyRound, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase, supabaseConfigured } from '../lib/supabase';

type AuthMode = 'sign-in' | 'sign-up' | 'reset';

export function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (session) navigate('/', { replace: true });
  }, [session, navigate]);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError('');
    setNotice('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!supabase) {
      setError('Add your Supabase project URL and public anon key to .env to enable authentication.');
      return;
    }
    if (mode === 'sign-up' && password !== confirmPassword) {
      setError('Those passwords do not match.');
      return;
    }
    if (mode !== 'reset' && password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'reset') {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/update-password`,
        });
        if (authError) throw authError;
        setNotice('If an account exists for that email, a password reset link is on its way.');
      } else if (mode === 'sign-up') {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { display_name: email.split('@')[0] },
          },
        });
        if (authError) throw authError;
        if (!data.session) setNotice('Check your inbox to verify your email and finish creating your account.');
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Authentication could not be completed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function signInWithProvider(provider: 'google' | 'github') {
    setError('');
    if (!supabase) {
      setError('Add your Supabase project URL and public anon key to .env to enable authentication.');
      return;
    }
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (authError) throw authError;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The identity provider could not be reached. Please try again.');
      setBusy(false);
    }
  }

  const title = mode === 'sign-up' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Welcome back';
  const subtitle = mode === 'sign-up'
    ? 'A thoughtful space for everything you want to explore.'
    : mode === 'reset'
      ? 'We’ll send a secure link to your email.'
      : 'Your conversations, research, and ideas—together.';

  return (
    <main className="auth-page">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />
      <header className="auth-brand">
        <Link className="brand-lockup" to="/login" aria-label="Karacter AI home">
          <span className="brand-mark"><Sparkles size={18} strokeWidth={2.2} /></span>
          <span>karacter<span className="brand-ai">.ai</span></span>
        </Link>
        <span className="auth-header-note"><ShieldCheck size={14} /> Private by design</span>
      </header>

      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-card-topline"><span className="eyebrow">YOUR INTELLIGENCE, IN CONTEXT</span><span className="topline-dot" /></div>
        <h1 id="auth-title">{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>

        {mode !== 'reset' && (
          <div className="social-buttons">
            <button type="button" className="button button-secondary social-button" disabled={busy || !supabaseConfigured} onClick={() => void signInWithProvider('google')}>
              <span className="google-g" aria-hidden="true">G</span> Continue with Google
            </button>
            <button type="button" className="button button-secondary social-button" disabled={busy || !supabaseConfigured} onClick={() => void signInWithProvider('github')}>
              <Code2 size={17} /> Continue with GitHub
            </button>
          </div>
        )}

        {mode !== 'reset' && <div className="auth-divider"><span />or continue with email<span /></div>}

        <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
          <label className="field-label" htmlFor="email">Email address</label>
          <div className="input-wrap"><Mail size={17} /><input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>

          {mode !== 'reset' && <>
            <div className="password-label-row">
              <label className="field-label" htmlFor="password">Password</label>
              {mode === 'sign-in' && <button className="text-button" type="button" onClick={() => changeMode('reset')}>Forgot password?</button>}
            </div>
            <div className="input-wrap"><KeyRound size={17} /><input id="password" type="password" autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></div>
          </>}

          {mode === 'sign-up' && <>
            <label className="field-label" htmlFor="confirm-password">Confirm password</label>
            <div className="input-wrap"><KeyRound size={17} /><input id="confirm-password" type="password" autoComplete="new-password" placeholder="Enter your password again" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required /></div>
          </>}

          {error && <p className="form-message form-error" role="alert">{error}</p>}
          {notice && <p className="form-message form-success" role="status">{notice}</p>}

          <button className="button button-primary auth-submit" type="submit" disabled={busy || !supabaseConfigured}>
            {busy ? 'Please wait…' : mode === 'sign-up' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}
            {!busy && <ArrowRight size={17} />}
          </button>
        </form>

        {!supabaseConfigured && <div className="config-note" role="status"><span className="config-note-icon"><ShieldCheck size={16} /></span><span><strong>Connect your Supabase project</strong><br />Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code> to enable sign-in.</span></div>}

        <div className="auth-switch">
          {mode === 'reset' ? <button className="text-button back-button" type="button" onClick={() => changeMode('sign-in')}><ArrowLeft size={14} /> Back to sign in</button> : <>
            <span>{mode === 'sign-up' ? 'Already have an account?' : 'New to Karacter?'}</span>
            <button className="text-button" type="button" onClick={() => changeMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')}>{mode === 'sign-up' ? 'Sign in' : 'Create an account'}</button>
          </>}
        </div>
      </section>

      <footer className="auth-footer"><span>© 2026 Karacter AI</span><span>Built for curiosity, designed for clarity.</span></footer>
    </main>
  );
}
