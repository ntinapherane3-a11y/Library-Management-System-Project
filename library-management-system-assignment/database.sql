CREATE DATABASE IF NOT EXISTS library_management;
USE library_management;

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS books;

CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(120) NOT NULL,
    genre VARCHAR(80) NOT NULL,
    isbn VARCHAR(30) NOT NULL UNIQUE,
    quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    membership_id VARCHAR(50) NOT NULL UNIQUE,
    role ENUM('Admin','Member') NOT NULL DEFAULT 'Member',
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    type ENUM('ADD','BORROW') NOT NULL,
    quantity INT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaction_book
        FOREIGN KEY (book_id) REFERENCES books(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_transaction_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

INSERT INTO books (title, author, genre, isbn, quantity) VALUES
('Things Fall Apart', 'Chinua Achebe', 'Fiction', '9780385474542', 5),
('The Alchemist', 'Paulo Coelho', 'Fiction', '9780061122415', 3),
('Clean Code', 'Robert C. Martin', 'Programming', '9780132350884', 1),
('Database System Concepts', 'Abraham Silberschatz', 'Database', '9780073523323', 2);

INSERT INTO users (name, membership_id, role, password) VALUES
('System Administrator', 'ADM001', 'Admin', 'admin123'),
('Library Member', 'MEM001', 'Member', 'member123');

INSERT INTO transactions (book_id, user_id, type, quantity)
SELECT b.id, u.id, 'ADD', 5
FROM books b CROSS JOIN users u
WHERE b.isbn = '9780385474542' AND u.membership_id = 'ADM001';

INSERT INTO transactions (book_id, user_id, type, quantity)
SELECT b.id, u.id, 'ADD', 3
FROM books b CROSS JOIN users u
WHERE b.isbn = '9780061122415' AND u.membership_id = 'ADM001';

INSERT INTO transactions (book_id, user_id, type, quantity)
SELECT b.id, u.id, 'ADD', 1
FROM books b CROSS JOIN users u
WHERE b.isbn = '9780132350884' AND u.membership_id = 'ADM001';

INSERT INTO transactions (book_id, user_id, type, quantity)
SELECT b.id, u.id, 'ADD', 2
FROM books b CROSS JOIN users u
WHERE b.isbn = '9780073523323' AND u.membership_id = 'ADM001';
