import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ membership_id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      onLogin(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="">L</div>
        <p className="eyebrow">NTINA PHERANE</p>
        <h1>Library Management</h1>
        <p className="login-subtitle">Sign in to manage books, users and transactions.</p>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={submit} className="form-grid single">
          <label>
            Membership ID
            <input
              value={form.membership_id}
              onChange={(e) => setForm({ ...form, membership_id: e.target.value })}
              placeholder="e.g. ADM001"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password"
              required
            />
          </label>

          <button className="primary-btn full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-box">
          <strong>Demo accounts</strong>
          <span>Admin: ADM001 / admin123</span>
          <span>Member: MEM001 / member123</span>
        </div>
      </div>
    </div>
  );
}
