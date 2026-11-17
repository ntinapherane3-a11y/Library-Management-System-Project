import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

export default function Transactions({ user }) {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    book_id: '',
    user_id: user?.id || '',
    type: 'BORROW',
    quantity: 1
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const load = async () => {
    try {
      const [bookData, userData, transactionData] = await Promise.all([
        apiFetch('/books'),
        apiFetch('/users'),
        apiFetch('/transactions')
      ]);
      setBooks(bookData);
      setUsers(userData);
      setTransactions(transactionData);
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
      await apiFetch('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          book_id: Number(form.book_id),
          user_id: Number(form.user_id),
          quantity: Number(form.quantity)
        })
      });

      setMessage({
        type: 'success',
        text: form.type === 'ADD'
          ? 'Stock added successfully.'
          : 'Book borrowed and stock deducted successfully.'
      });

      setForm({ ...form, quantity: 1 });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div>
      <section className="content-card transaction-form-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">STOCK CONTROL</p>
            <h2>Record Transaction</h2>
          </div>
        </div>

        {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

        <form onSubmit={submit} className="form-grid">
          <label>
            Transaction Type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="BORROW">Borrow / Deduct Stock</option>
              <option value="ADD">Add Stock</option>
            </select>
          </label>

          <label>
            Select Book
            <select
              value={form.book_id}
              onChange={(e) => setForm({ ...form, book_id: e.target.value })}
              required
            >
              <option value="">Choose a book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} — {book.quantity} available
                </option>
              ))}
            </select>
          </label>

          <label>
            User / Student
            <select
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              required
            >
              <option value="">Choose a user</option>
              {users.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.membership_id})
                </option>
              ))}
            </select>
          </label>

          <label>
            Quantity
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
          </label>

          <div className="form-actions">
            <button className="primary-btn">Save Transaction</button>
          </div>
        </form>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">HISTORY</p>
            <h2>Transaction History</h2>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Book</th>
                <th>User</th>
                <th>Type</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.transaction_date).toLocaleString()}</td>
                  <td><strong>{item.book_title}</strong></td>
                  <td>{item.user_name}<small className="table-sub">{item.membership_id}</small></td>
                  <td>
                    <span className={`status ${item.type === 'ADD' ? 'available' : 'borrowed'}`}>
                      {item.type === 'ADD' ? 'Stock Added' : 'Borrowed'}
                    </span>
                  </td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
