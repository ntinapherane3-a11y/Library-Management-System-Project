import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from './api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Transactions from './pages/Transactions';
import Users from './pages/Users';

function ProtectedLayout({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: '▣' },
    { path: '/books', label: 'Book Management', icon: '▤' },
    { path: '/transactions', label: 'Transactions', icon: '↔' },
    { path: '/users', label: 'User Management', icon: '♙' }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">L</div>
          <div>
            <strong>Library</strong>
            <span>Management</span>
          </div>
        </div>

        <nav className="side-nav">
          {links.map((link) => (
            <button
              key={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => navigate(link.path)}
            >
              <span>{link.icon}</span>
              {link.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="logged-user">
            <div className="avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
            <div>
              <strong>{user?.name}</strong>
              <small>{user?.role}</small>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">LIBRARY MANAGEMENT SYSTEM</p>
            <h1>{links.find((item) => item.path === location.pathname)?.label || 'Dashboard'}</h1>
          </div>
          <div className="top-user">
            <span>Welcome, {user?.name}</span>
          </div>
        </header>

        <div className="page-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/books" element={<Books user={user} />} />
            <Route path="/transactions" element={<Transactions user={user} />} />
            <Route path="/users" element={<Users user={user} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('library_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('library_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('library_user');
    }
  }, [user]);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <ProtectedLayout
      user={user}
      onLogout={() => setUser(null)}
    />
  );
}
