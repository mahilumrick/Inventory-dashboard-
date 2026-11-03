const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const db = new Database(path.join(__dirname, 'inventory.db'));

db.exec(`CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  price REAL NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const valid = (b) =>
  b && b.name && b.category && Number.isInteger(+b.quantity) && +b.quantity >= 0 && !isNaN(+b.price) && +b.price >= 0;

// READ all (with optional search)
app.get('/api/items', (req, res) => {
  const q = `%${req.query.search || ''}%`;
  res.json(db.prepare('SELECT * FROM items WHERE name LIKE ? OR category LIKE ? ORDER BY id DESC').all(q, q));
});

// Dashboard stats
app.get('/api/stats', (req, res) => {
  res.json(db.prepare(`SELECT
    COUNT(*) AS totalItems,
    COALESCE(SUM(quantity),0) AS totalQuantity,
    COALESCE(SUM(quantity*price),0) AS totalValue,
    COALESCE(SUM(CASE WHEN quantity <= 5 THEN 1 ELSE 0 END),0) AS lowStock
    FROM items`).get());
});

// CREATE
app.post('/api/items', (req, res) => {
  if (!valid(req.body)) return res.status(400).json({ error: 'Invalid input' });
  const { name, category, quantity, price } = req.body;
  const r = db.prepare('INSERT INTO items (name, category, quantity, price) VALUES (?,?,?,?)')
    .run(name.trim(), category.trim(), +quantity, +price);
  res.status(201).json(db.prepare('SELECT * FROM items WHERE id = ?').get(r.lastInsertRowid));
});

// UPDATE
app.put('/api/items/:id', (req, res) => {
  if (!valid(req.body)) return res.status(400).json({ error: 'Invalid input' });
  const { name, category, quantity, price } = req.body;
  const r = db.prepare('UPDATE items SET name=?, category=?, quantity=?, price=? WHERE id=?')
    .run(name.trim(), category.trim(), +quantity, +price, req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Not found' });
  res.json(db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id));
});

// DELETE
app.delete('/api/items/:id', (req, res) => {
  const r = db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
