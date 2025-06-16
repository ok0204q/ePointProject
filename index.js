const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

let pool;
async function connectDB() {
  pool = new Pool({
    user: process.env.PGUSER || 'root',
    host: process.env.PGHOST || '/var/run/postgresql',
    database: process.env.PGDATABASE || 'postgres'
  });
  await pool.query(`CREATE TABLE IF NOT EXISTS demo_user (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);
}

async function disconnectDB() {
  await pool?.end();
}

let items = ["item1", "item2", "item3","item4","item5","item6","item7","item8","item9","item10"];
let currentId = 1;

// Register user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO demo_user (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Login user
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const result = await pool.query(
      'SELECT password FROM demo_user WHERE username = $1',
      [username]
    );
    if (result.rows.length === 0 || result.rows[0].password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create item
app.post('/items', (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const newItem = { id: currentId++, name, description };
  items.push(newItem);
  res.status(201).json(newItem);
});

// Read all items
app.get('/items', (req, res) => {
  res.json(items);
});

app.get('/', (req, res) => {
  res.json({message: "Hello! world"});
});

// Read single item
app.get('/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = items.find(i => i.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

// Update item
app.put('/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, description } = req.body;
  const item = items.find(i => i.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  if (name !== undefined) item.name = name;
  if (description !== undefined) item.description = description;
  res.json(item);
});

// Delete item
app.delete('/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = items.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  const [deleted] = items.splice(index, 1);
  res.json(deleted);
});

// Start the server
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
}

module.exports = {
  app,
  connectDB,
  disconnectDB,
  _reset: async () => {
    items = [];
    currentId = 1;
    if (pool) {
      await pool.query('DELETE FROM demo_user');
    }
  }
};
