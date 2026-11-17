import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [dashboard, allBooks] = await Promise.all([
        apiFetch('/dashboard'),
        apiFetch('/books')
      ]);
      setData(dashboard);
      setBooks(allBooks);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <section className="welcome-panel">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h2>Library at  Ha-Moseneke</h2>
          <p>Monitor your books, stock levels and registered users from one place.</p>
        </div>
        <div className="welcome-icon"></div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total Book Titles</span>
          <strong>{data.total_titles}</strong>
          <small>Different books in the system</small>
        </div>
        <div className="stat-card">
          <span>Total Copies</span>
          <strong>{data.total_copies}</strong>
          <small>Copies currently in stock</small>
        </div>
        <div className="stat-card warning-stat">
          <span>Low Stock</span>
          <strong>{data.low_stock}</strong>
          <small>Books with fewer than 2 copies</small>
        </div>
        <div className="stat-card">
          <span>Registered Users</span>
          <strong>{data.total_users}</strong>
          <small>Library system users</small>
        </div>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">INVENTORY</p>
            <h2>Current Book Availability</h2>
          </div>
          <button className="secondary-btn" onClick={load}>Refresh</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>ISBN</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td><strong>{book.title}</strong></td>
                  <td>{book.author}</td>
                  <td>{book.genre}</td>
                  <td>{book.isbn}</td>
                  <td>{book.quantity}</td>
                  <td>
                    <span className={`status ${book.quantity < 2 ? 'low' : 'available'}`}>
                      {book.quantity < 2 ? 'Low Stock' : 'Available'}
                    </span>
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
