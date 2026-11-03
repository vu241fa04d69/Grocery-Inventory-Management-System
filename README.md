# Grocery Inventory Management System (MERN)

An educational single-page application to manage grocery products and stock using React, Node.js, Express, and MongoDB.

## Features
- Dashboard with total products, low-stock products, total units, and inventory value
- Add, view, edit, delete, and search products
- Product categories, price, quantity, and reorder level
- Low-stock warning
- Responsive layout
- MongoDB persistence through Mongoose
- Basic form validation and API error messages

## Requirements
- Node.js LTS and npm
- MongoDB Community Server running locally, or MongoDB Atlas
- Visual Studio Code
- A modern browser

## Run on Windows / VS Code

### 1. Start MongoDB
For local MongoDB, confirm MongoDB is running. The default connection is:
`mongodb://127.0.0.1:27017/groceryInventoryDB`

You do not need to create the database manually. MongoDB creates it when the app first stores a product.

### 2. Start the backend
Open a VS Code terminal in the project folder:
```powershell
cd server
npm install
npm run dev
```
Expected messages: `MongoDB connected successfully` and `Server running on port 5000`.

Test backend: visit `http://localhost:5000/`.

### 3. Start the frontend
Open a second terminal:
```powershell
cd client
npm install
npm run dev
```
Open the URL printed by Vite, usually `http://localhost:5173`.

### If using MongoDB Atlas
Edit `server/.env` and set `MONGO_URI` to your Atlas connection string. Do not share your database password.

## API endpoints
- `GET /api/products` — list products; optional `?search=milk&category=Dairy`
- `GET /api/products/:id` — one product
- `POST /api/products` — create product
- `PUT /api/products/:id` — update product
- `DELETE /api/products/:id` — delete product

## Folder structure
```text
Grocery_Inventory_Management_System/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       └── App.css
└── server/
    ├── models/Product.js
    ├── routes/productRoutes.js
    ├── .env
    ├── .env.example
    ├── package.json
    └── server.js
```

Educational demo only. Do not use it as a production inventory or accounting system without further testing and security controls.
