import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

const emptyForm = { title: '', author: '', genre: '', isbn: '', quantity: 0 };

export default function Books() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadBooks = async () => {
    try {
      setBooks(await apiFetch('/books'));
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const endpoint = editingId ? `/books/${editingId}` : '/books';
      const method = editingId ? 'PUT' : 'POST';

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify({ ...form, quantity: Number(form.quantity) })
      });

      setForm(emptyForm);
      setEditingId(null);
      setMessage({
        type: 'success',
        text: editingId ? 'Book updated successfully.' : 'Book added successfully.'
      });
      loadBooks();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const editBook = (book) => {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      isbn: book.isbn,
      quantity: book.quantity
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      await apiFetch(`/books/${id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: 'Book deleted successfully.' });
      loadBooks();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="two-column">
      <section className="content-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{editingId ? 'EDIT BOOK' : 'NEW BOOK'}</p>
            <h2>{editingId ? 'Update Book' : 'Add New Book'}</h2>
          </div>
        </div>

        {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

        <form onSubmit={submit} className="form-grid">
          <label>
            Title
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>

          <label>
            Author
            <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
          </label>

          <label>
            Genre
            <input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} required />
          </label>

          <label>
            ISBN
            <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} required />
          </label>

          <label>
            Initial Quantity
            <input
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
          </label>

          <div className="form-actions">
            <button className="primary-btn">{editingId ? 'Update Book' : 'Add Book'}</button>
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
            <p className="eyebrow">INVENTORY</p>
            <h2>Books</h2>
          </div>
          <span className="count-badge">{books.length} titles</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>Qty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td><strong>{book.title}</strong><small className="table-sub">{book.isbn}</small></td>
                  <td>{book.author}</td>
                  <td>{book.genre}</td>
                  <td>
                    <span className={`quantity ${book.quantity < 2 ? 'danger' : ''}`}>
                      {book.quantity}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="small-btn edit" onClick={() => editBook(book)}>Update</button>
                      <button className="small-btn delete" onClick={() => deleteBook(book.id)}>Delete</button>
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
