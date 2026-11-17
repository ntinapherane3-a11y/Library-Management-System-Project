import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ message: 'Server and database are connected.' });
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed.', error: error.message });
  }
});

// ---------- BOOKS ----------
app.get('/api/books', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;

    if (!title || !author || !genre || !isbn || quantity === undefined) {
      return res.status(400).json({ message: 'All book fields are required.' });
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 0) {
      return res.status(400).json({ message: 'Quantity must be a whole number of 0 or more.' });
    }

    const [result] = await pool.query(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), qty]
    );

    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'That ISBN already exists.' });
    }
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/books/:id', async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    const qty = Number(quantity);

    if (!title || !author || !genre || !isbn || !Number.isInteger(qty) || qty < 0) {
      return res.status(400).json({ message: 'Please provide valid book details.' });
    }

    const [result] = await pool.query(
      'UPDATE books SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ? WHERE id = ?',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), qty, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'That ISBN already exists.' });
    }
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    res.json({ message: 'Book deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- USERS ----------
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, membership_id, role, created_at FROM users ORDER BY id DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, membership_id, role, password } = req.body;

    if (!name || !membership_id || !role || !password) {
      return res.status(400).json({ message: 'Name, membership ID, role and password are required.' });
    }

    if (!['Admin', 'Member'].includes(role)) {
      return res.status(400).json({ message: 'Role must be Admin or Member.' });
    }

    const [result] = await pool.query(
      'INSERT INTO users (name, membership_id, role, password) VALUES (?, ?, ?, ?)',
      [name.trim(), membership_id.trim(), role, password]
    );

    const [rows] = await pool.query(
      'SELECT id, name, membership_id, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'That membership ID already exists.' });
    }
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, membership_id, role, password } = req.body;

    if (!name || !membership_id || !role) {
      return res.status(400).json({ message: 'Name, membership ID and role are required.' });
    }

    let result;
    if (password) {
      [result] = await pool.query(
        'UPDATE users SET name = ?, membership_id = ?, role = ?, password = ? WHERE id = ?',
        [name.trim(), membership_id.trim(), role, password, req.params.id]
      );
    } else {
      [result] = await pool.query(
        'UPDATE users SET name = ?, membership_id = ?, role = ? WHERE id = ?',
        [name.trim(), membership_id.trim(), role, req.params.id]
      );
    }

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, membership_id, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'That membership ID already exists.' });
    }
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { membership_id, password } = req.body;

    if (!membership_id || !password) {
      return res.status(400).json({ message: 'Membership ID and password are required.' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, membership_id, role FROM users WHERE membership_id = ? AND password = ?',
      [membership_id.trim(), password]
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid membership ID or password.' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- TRANSACTIONS ----------
app.get('/api/transactions', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        t.id,
        t.type,
        t.quantity,
        t.transaction_date,
        b.title AS book_title,
        u.name AS user_name,
        u.membership_id
      FROM transactions t
      INNER JOIN books b ON t.book_id = b.id
      INNER JOIN users u ON t.user_id = u.id
      ORDER BY t.transaction_date DESC, t.id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { book_id, user_id, type, quantity } = req.body;
    const qty = Number(quantity);

    if (!book_id || !user_id || !['ADD', 'BORROW'].includes(type) || !Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Book, user, transaction type and a positive quantity are required.' });
    }

    await connection.beginTransaction();

    const [bookRows] = await connection.query(
      'SELECT id, quantity FROM books WHERE id = ? FOR UPDATE',
      [book_id]
    );

    if (!bookRows.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Book not found.' });
    }

    const currentQuantity = bookRows[0].quantity;

    if (type === 'BORROW' && currentQuantity < qty) {
      await connection.rollback();
      return res.status(400).json({ message: `Not enough stock. Only ${currentQuantity} copy/copies available.` });
    }

    const newQuantity = type === 'ADD'
      ? currentQuantity + qty
      : currentQuantity - qty;

    await connection.query(
      'UPDATE books SET quantity = ? WHERE id = ?',
      [newQuantity, book_id]
    );

    const [result] = await connection.query(
      'INSERT INTO transactions (book_id, user_id, type, quantity) VALUES (?, ?, ?, ?)',
      [book_id, user_id, type, qty]
    );

    await connection.commit();

    const [rows] = await pool.query(`
      SELECT
        t.id,
        t.type,
        t.quantity,
        t.transaction_date,
        b.title AS book_title,
        u.name AS user_name,
        u.membership_id
      FROM transactions t
      INNER JOIN books b ON t.book_id = b.id
      INNER JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [result.insertId]);

    res.status(201).json(rows[0]);
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

// ---------- DASHBOARD ----------
app.get('/api/dashboard', async (req, res) => {
  try {
    const [[bookStats]] = await pool.query(`
      SELECT
        COUNT(*) AS total_titles,
        COALESCE(SUM(quantity), 0) AS total_copies,
        COALESCE(SUM(CASE WHEN quantity < 2 THEN 1 ELSE 0 END), 0) AS low_stock
      FROM books
    `);

    const [[userStats]] = await pool.query(`
      SELECT COUNT(*) AS total_users FROM users
    `);

    const [lowStockBooks] = await pool.query(
      'SELECT * FROM books WHERE quantity < 2 ORDER BY quantity ASC, title ASC'
    );

    res.json({
      total_titles: Number(bookStats.total_titles),
      total_copies: Number(bookStats.total_copies),
      low_stock: Number(bookStats.low_stock),
      total_users: Number(userStats.total_users),
      low_stock_books: lowStockBooks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
