import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { BookDetailPage, BookFormPage, BooksPage } from './pages/BookPages';
import { AccessDeniedPage } from './pages/ProtectedPages';
import { UserFormPage, UsersPage } from './pages/UserPages';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/books/new" element={<BookFormPage />} />
          <Route path="/books/:id/edit" element={<BookFormPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/new" element={<UserFormPage />} />
          <Route path="/users/:id/edit" element={<UserFormPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/books" replace />} />
    </Routes>
  );
}
