import { useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function AuthCallback() {
  const { session, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const providerError = searchParams.get('error_description') ?? searchParams.get('error');

  useEffect(() => {
    document.title = 'Completing sign in · Karacter AI';
  }, []);

  if (loading) {
    return <main className="screen-loader" aria-label="Completing sign in"><span className="loader-orb" /></main>;
  }
  if (session) return <Navigate to="/" replace />;

  return (
    <main className="callback-page">
      <div className="brand-mark"><Sparkles size={18} /></div>
      <h1>We couldn’t complete sign in</h1>
      <p>{providerError ?? 'The sign-in link may have expired, or your email verification is still pending.'}</p>
      <Link className="button button-primary" to="/login">Return to sign in <ArrowRight size={16} /></Link>
    </main>
  );
}
