import { Link } from 'react-router-dom';

export function AccessDeniedPage() {
  return (
    <main className="access-denied-page">
      <section className="placeholder-card">
        <p className="eyebrow">403</p>
        <h1>Access denied</h1>
        <p>You do not have permission to open this page.</p>
        <Link className="primary-button" to="/books">Back to books</Link>
      </section>
    </main>
  );
}
