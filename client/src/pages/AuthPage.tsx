import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { login, signup } from '../api/client';
import { useAuth } from '../auth/AuthContext';

type AuthMode = 'login' | 'signup';

type AuthPageProps = {
  mode: AuthMode;
};

type RedirectState = {
  from?: { pathname?: string };
};

export function AuthPage({ mode }: AuthPageProps) {
  const isSignup = mode === 'signup';
  const { user, login: setAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/books" replace />;
  }

  const submitLabel = isSignup ? 'Create account' : 'Log in';
  const switchLabel = isSignup ? 'Log in' : 'Sign up';
  const switchPath = isSignup ? '/login' : '/signup';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const auth = isSignup
        ? await signup({ name, email, password })
        : await login({ email, password });

      setAuth(auth);
      const state = location.state as RedirectState | null;
      navigate(state?.from?.pathname ?? '/books', { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to authenticate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby={`${mode}-title`}>
        <header className="auth-card__header">
          <Link className="brand" to="/login">
            Book Library
          </Link>
          <Link className="auth-switch" to={switchPath}>
            {switchLabel}
          </Link>
        </header>

        <div className="auth-card__content">
          <div className="auth-heading">
            <p className="eyebrow">AUTH</p>
            <h1 id={`${mode}-title`}>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
            <p>{isSignup ? 'Sign up to explore the library.' : 'Log in to continue to the library.'}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {isSignup && (
              <label>
                <span>Name</span>
                <input
                  required
                  minLength={2}
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="name"
                />
              </label>
            )}
            <label>
              <span>Email</span>
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email"
              />
            </label>
            <label>
              <span>Password</span>
              <input
                required
                minLength={8}
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="password"
              />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait…' : submitLabel}
            </button>
          </form>

          {!isSignup && (
            <p className="auth-prompt">
              No account? <Link to="/signup">Sign up</Link>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
