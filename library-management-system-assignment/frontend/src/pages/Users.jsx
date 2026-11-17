import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

const emptyForm = {
  name: '',
  membership_id: '',
  role: 'Member',
  password: ''
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const load = async () => {
    try {
      setUsers(await apiFetch('/users'));
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();

    try {
      const endpoint = editingId ? `/users/${editingId}` : '/users';
      const method = editingId ? 'PUT' : 'POST';

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(form)
      });

      setForm(emptyForm);
      setEditingId(null);
      setMessage({
        type: 'success',
        text: editingId ? 'User updated successfully.' : 'User added successfully.'
      });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const editUser = async (user) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      membership_id: user.membership_id,
      role: user.role,
      password: ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: 'User deleted successfully.' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="two-column">
      <section className="content-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{editingId ? 'EDIT USER' : 'NEW USER'}</p>
            <h2>{editingId ? 'Update User' : 'Add New User'}</h2>
          </div>
        </div>

        {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

        <form onSubmit={submit} className="form-grid">
          <label>
            Full Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>

          <label>
            Membership ID
            <input
              value={form.membership_id}
              onChange={(e) => setForm({ ...form, membership_id: e.target.value })}
              placeholder="e.g. MEM002"
              required
            />
          </label>

          <label>
            Role
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
          </label>

          <label>
            {editingId ? 'New Password (optional)' : 'Password'}
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editingId}
            />
          </label>

          <div className="form-actions">
            <button className="primary-btn">{editingId ? 'Update User' : 'Add User'}</button>
            {editingId && (
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">USERS</p>
            <h2>Registered Users</h2>
          </div>
          <span className="count-badge">{users.length} users</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Membership ID</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.membership_id}</td>
                  <td><span className="status available">{item.role}</span></td>
                  <td>
                    <div className="actions">
                      <button className="small-btn edit" onClick={() => editUser(item)}>Update</button>
                      <button className="small-btn delete" onClick={() => deleteUser(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
