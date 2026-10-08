import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { createBook, deleteBook, getBook, getBooks, updateBook } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { PageLayout } from '../components/PageLayout';
import type { Book, BookInput } from '../types/auth';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function LoadingState() {
  return <p className="status-message">Loading…</p>;
}

function ErrorState({ message }: { message: string }) {
  return <p className="status-message status-message--error" role="alert">{message}</p>;
}

export function BooksPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    getBooks(token)
      .then(({ books: nextBooks }) => setBooks(nextBooks))
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleDelete = async (book: Book) => {
    if (!token || !window.confirm(`Delete “${book.name}”?`)) return;

    try {
      await deleteBook(token, book._id);
      setBooks((currentBooks) => currentBooks.filter(({ _id }) => _id !== book._id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <PageLayout>
      <section className="page-heading">
        <div>
          <p className="eyebrow">LIBRARY</p>
          <h1>Books</h1>
        </div>
        {isAdmin && <Link className="primary-button" to="/books/new">+ New book</Link>}
      </section>

      {isLoading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!isLoading && !error && books.length === 0 && (
        <p className="empty-state">There are no books yet.</p>
      )}

      {!isLoading && !error && books.length > 0 && !isAdmin && (
        <section className="book-grid" aria-label="Books">
          {books.map((book) => (
            <Link className="book-card" key={book._id} to={`/books/${book._id}`}>
              <div className="book-cover" aria-hidden="true">{book.name.slice(0, 1)}</div>
              <h2>{book.name}</h2>
              <p>{book.author}</p>
            </Link>
          ))}
        </section>
      )}

      {!isLoading && !error && books.length > 0 && isAdmin && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Name</th><th>Author</th><th>Pages</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id}>
                  <td><Link className="table-link" to={`/books/${book._id}`}>{book.name}</Link></td>
                  <td>{book.author}</td>
                  <td>{book.pageCount}</td>
                  <td className="actions-cell">
                    <Link className="secondary-button" to={`/books/${book._id}/edit`}>Edit</Link>
                    <button className="danger-button" type="button" onClick={() => void handleDelete(book)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageLayout>
  );
}

export function BookDetailPage() {
  const { token } = useAuth();
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    getBook(token, id).then(({ book: nextBook }) => setBook(nextBook)).catch((requestError) => setError(getErrorMessage(requestError)));
  }, [id, token]);

  return (
    <PageLayout>
      <Link className="back-link" to="/books">← Back to books</Link>
      {error && <ErrorState message={error} />}
      {!error && !book && <LoadingState />}
      {book && (
        <article className="book-detail">
          <div className="book-cover book-cover--large" aria-hidden="true">{book.name.slice(0, 1)}</div>
          <div>
            <p className="eyebrow">BOOK</p>
            <h1>{book.name}</h1>
            <dl>
              <div><dt>Author</dt><dd>{book.author}</dd></div>
              <div><dt>Pages</dt><dd>{book.pageCount}</dd></div>
            </dl>
          </div>
        </article>
      )}
    </PageLayout>
  );
}

export function BookFormPage() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState<BookInput>({ name: '', author: '', pageCount: 1 });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    getBook(token, id)
      .then(({ book }) => setForm({ name: book.name, author: book.author, pageCount: book.pageCount }))
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setIsLoading(false));
  }, [id, token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setError(null);
    setIsSaving(true);

    try {
      const result = isEditing && id
        ? await updateBook(token, id, form)
        : await createBook(token, form);
      navigate(`/books/${result.book._id}`, { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout>
      <Link className="back-link" to="/books">← Back to books</Link>
      <section className="form-card">
        <div className="form-card__heading"><p className="eyebrow">BOOK</p><h1>{isEditing ? 'Edit book' : 'New book'}</h1></div>
        {isLoading ? <LoadingState /> : (
          <form className="resource-form" onSubmit={handleSubmit}>
            <label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label>Author<input required value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} /></label>
            <label>Page count<input required min="1" step="1" type="number" value={form.pageCount} onChange={(event) => setForm({ ...form, pageCount: Number(event.target.value) })} /></label>
            {error && <ErrorState message={error} />}
            <div className="form-actions"><Link className="secondary-button" to="/books">Cancel</Link><button className="primary-button" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save'}</button></div>
          </form>
        )}
      </section>
    </PageLayout>
  );
}
