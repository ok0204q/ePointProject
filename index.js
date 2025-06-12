const express = require('express');
const app = express();
app.use(express.json());

let items = [];
let currentId = 1;

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
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = {
  app,
  _reset: () => {
    items = [];
    currentId = 1;
  }
};
