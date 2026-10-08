import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';

export function AppNavigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="app-navigation">
      <Link className="brand" to="/books">
        Book Library
      </Link>
      <nav aria-label="Main navigation">
        <NavLink to="/books">Books</NavLink>
        {user?.role === 'admin' && <NavLink to="/users">Users</NavLink>}
        <span className={`role-badge role-badge--${user?.role}`}>{user?.role}</span>
        <button className="text-button" type="button" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
}
