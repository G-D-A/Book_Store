import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { createUser, deleteUser, getUser, getUsers, updateUser } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { PageLayout } from '../components/PageLayout';
import type { AuthUser, UserInput, UserRole } from '../types/auth';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function UsersPage() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getUsers(token)
      .then(({ users: nextUsers }) => setUsers(nextUsers))
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleDelete = async (user: AuthUser) => {
    if (!token || !window.confirm(`Delete “${user.name}”?`)) return;

    try {
      await deleteUser(token, user.id);
      setUsers((currentUsers) => currentUsers.filter(({ id }) => id !== user.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <PageLayout>
      <section className="page-heading">
        <div><p className="eyebrow">ADMIN</p><h1>Users</h1></div>
        <Link className="primary-button" to="/users/new">+ New user</Link>
      </section>
      {isLoading && <p className="status-message">Loading…</p>}
      {error && <p className="status-message status-message--error" role="alert">{error}</p>}
      {!isLoading && !error && (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td><td>{user.email}</td><td><span className={`role-badge role-badge--${user.role}`}>{user.role}</span></td>
                  <td className="actions-cell">
                    <Link className="secondary-button" to={`/users/${user.id}/edit`}>Edit</Link>
                    <button className="danger-button" type="button" disabled={currentUser?.id === user.id} onClick={() => void handleDelete(user)}>Delete</button>
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

const emptyForm: UserInput = { name: '', email: '', password: '', role: 'user' };

export function UserFormPage() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState<UserInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    getUser(token, id)
      .then(({ user }) => setForm({ name: user.name, email: user.email, password: '', role: user.role }))
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setIsLoading(false));
  }, [id, token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setError(null);
    setIsSaving(true);

    try {
      if (isEditing && id) {
        await updateUser(token, id, form);
      } else {
        await createUser(token, form);
      }
      navigate('/users', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout>
      <Link className="back-link" to="/users">← Back to users</Link>
      <section className="form-card">
        <div className="form-card__heading"><p className="eyebrow">ADMIN</p><h1>{isEditing ? 'Edit user' : 'New user'}</h1></div>
        {isLoading ? <p className="status-message">Loading…</p> : (
          <form className="resource-form resource-form--two-columns" onSubmit={handleSubmit}>
            <label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label>Password<input required={!isEditing} minLength={8} type="password" placeholder={isEditing ? 'Leave empty to keep current password' : ''} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
            <label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}><option value="user">user</option><option value="admin">admin</option></select></label>
            {error && <p className="status-message status-message--error" role="alert">{error}</p>}
            <div className="form-actions"><Link className="secondary-button" to="/users">Cancel</Link><button className="primary-button" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save'}</button></div>
          </form>
        )}
      </section>
    </PageLayout>
  );
}
