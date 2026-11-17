# Library Management System - BIWA2110

A full-stack library management web application for the Web Application Development assignment.

## Technology
- Frontend: React + Vite + React Router
- Backend: Express.js
- Database: MySQL
- Communication: Fetch API
- Styling: CSS

## Project structure
- `frontend/` - React application
- `backend/` - Express REST API
- `database.sql` - MySQL database and tables

## Setup

### 1. Database
Open MySQL Workbench (or MySQL command line) and run all contents of `database.sql`.

### 2. Backend
Open a terminal in `backend`:
```bash
npm install
npm run dev
```
The API runs on `http://localhost:5000`.

Create `backend/.env` from `.env.example` and change the MySQL password if needed.

### 3. Frontend
Open another terminal in `frontend`:
```bash
npm install
npm run dev
```
Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Demo login
- Admin: `ADM001` / `admin123`
- Member: `MEM001` / `member123`

## API
- GET/POST/PUT/DELETE `/api/books`
- GET/POST/PUT/DELETE `/api/users`
- GET/POST `/api/transactions`
- GET `/api/dashboard`
- POST `/api/login`
