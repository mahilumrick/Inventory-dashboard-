# Inventory Dashboard

Dashboard application with full CRUD. Backend: Express.js. Database: SQLite (better-sqlite3). Frontend: HTML/CSS/JS.

## Run
```
npm install
npm start
```
Open http://localhost:3000

## API
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/items?search= | List / search items |
| GET | /api/stats | Dashboard stats |
| POST | /api/items | Create item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |
