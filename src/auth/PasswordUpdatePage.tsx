import { useState, type FormEvent } from 'react';
import { ArrowRight, KeyRound, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';

export function PasswordUpdatePage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) return <main className="screen-loader" aria-label="Verifying recovery link"><span className="loader-orb" /></main>;
  if (!session) return <Navigate to="/login" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Those passwords do not match.');
      return;
    }
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) setError(updateError.message);
    else setUpdated(true);
  }

  return (
    <main className="auth-page">
      <header className="auth-brand">
        <Link className="brand-lockup" to="/login" aria-label="Karacter AI home">
          <span className="brand-mark"><Sparkles size={18} /></span><span>karacter<span className="brand-ai">.ai</span></span>
        </Link>
        <span className="auth-header-note"><ShieldCheck size={14} /> Secure account recovery</span>
      </header>
      <section className="auth-card" aria-labelledby="password-update-title">
        <div className="auth-card-topline"><span className="eyebrow">ACCOUNT SECURITY</span><span className="topline-dot" /></div>
        <h1 id="password-update-title">{updated ? 'Password updated' : 'Choose a new password'}</h1>
        <p className="auth-subtitle">{updated ? 'Your account is secured with your new password.' : 'Make it at least 8 characters long.'}</p>
        {updated ? (
          <button className="button button-primary auth-submit" onClick={() => navigate('/', { replace: true })}>Continue to Karacter <ArrowRight size={17} /></button>
        ) : (
          <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
            <label className="field-label" htmlFor="new-password">New password</label>
            <div className="input-wrap"><KeyRound size={17} /><input id="new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
            <label className="field-label" htmlFor="confirm-new-password">Confirm new password</label>
            <div className="input-wrap"><KeyRound size={17} /><input id="confirm-new-password" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div>
            {error && <p className="form-message form-error" role="alert">{error}</p>}
            <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'} {!busy && <ArrowRight size={17} />}</button>
          </form>
        )}
      </section>
      <footer className="auth-footer"><span>© 2026 Karacter AI</span><span>Built for curiosity, designed for clarity.</span></footer>
    </main>
  );
}
