const request = require('supertest');
const { app, _reset } = require('./index');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert');

beforeEach(() => {
  _reset();
});

test('CRUD flow', async (t) => {
  // Create item
  let res = await request(app)
    .post('/items')
    .send({ name: 'Item1', description: 'desc' })
    .expect(201);
  const id = res.body.id;
  assert.ok(id);

  // Get item
  res = await request(app)
    .get(`/items/${id}`)
    .expect(200);
  assert.strictEqual(res.body.name, 'Item1');

  // Update item
  res = await request(app)
    .put(`/items/${id}`)
    .send({ name: 'Updated' })
    .expect(200);
  assert.strictEqual(res.body.name, 'Updated');

  // Delete item
  await request(app)
    .delete(`/items/${id}`)
    .expect(200);

  // Item should no longer exist
  await request(app)
    .get(`/items/${id}`)
    .expect(404);
});
