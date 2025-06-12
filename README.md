# ePointProject

This repository contains a simple Node.js Express API providing CRUD operations for managing items.

## Setup

Install dependencies:

```bash
npm install
```

## Running

Start the API server with:

```bash
npm start
```

The server listens on port `3000` by default.

## API Endpoints

- `POST /items` – create a new item. Body requires `name` and optional `description`.
- `GET /items` – list all items.
- `GET /items/:id` – get a single item by `id`.
- `PUT /items/:id` – update an item by `id`.
- `DELETE /items/:id` – remove an item by `id`.
