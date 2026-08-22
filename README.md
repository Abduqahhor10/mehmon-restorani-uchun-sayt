# 🍽️ Mehmon Restaurant - Online Menu & Admin Panel System

A complete, responsive, and luxury Online Menu Website and Admin Panel system built for **Mehmon Restaurant**.

Designed with a high-end luxury dark-brown & warm-gold aesthetic, multilingual support (Uzbek, Russian, English), detailed nutritional macros breakdowns (Calories, Protein, Fat, Carbs, Portion weight), and an intuitive admin management portal.

---

## 🏛️ System Architecture

| Component | Tech Stack | Default Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Client** (Server 1) | React 18, Vite, Tailwind CSS, `react-i18next`, Lucide Icons | `5173` | Interactive restaurant menu for diners with instant search, category filters, and nutritional drawers. |
| **Frontend Admin** (Server 2) | React 18, Vite, Tailwind CSS, `react-i18next`, Lucide Icons | `5174` | Dashboard with 20% desktop sidebar, guarded product creation, full CRUD, duplicate actions, and live photo uploads. |
| **Backend API** | Django 4.2+, Django REST Framework, CORS Headers, Pillow | `8000` | REST API with multilingual models, PostgreSQL / SQLite engine, filtering, search, and image storage. |
| **Database** | PostgreSQL / SQLite3 | `5432` | Relational storage for categories, dishes, nutritional facts, and translations. |

---

## 🎨 Design System & Color Palette

- **Primary Background**: `#1F1915` (Deep Dark Brown)
- **Card / Modal Background**: `#2B231D` (Medium Dark Brown)
- **Sidebar Background**: `#16120F` (Darker Brown)
- **Accent / Gold Highlight**: `#D4A359` (Warm Gold / Mustard) & `#B8863B` (Hover Gold)
- **Text & Borders**: `#FFFFFF` / `#F5EBE0` (Cream White), `#A89F91` (Muted Sand), `#3D332B` (Subtle Border)
- **Typography**: `Playfair Display` (Serif headers) & `Outfit` / `Inter` (Sans-serif UI)

---

## ✨ Key Features

### 1. Client Menu Website (`/client`)
- **Header**:
  - Brand Logo: **"Mehmon RESTAURANT"**
  - Integrated Search Bar: Compact and non-intrusive header search across all multilingual titles and descriptions.
  - Language Switcher: 3 languages (**UZ**, **RU**, **EN**) with persistent storage.
- **Main Content**:
  - Horizontal scrollable category tabs (**All**, **Main Courses**, **Kebabs**, **Salads**, etc.).
  - Responsive Product Grid with high-resolution food cards.
  - **Collapsible Nutritional Macros Section**:
    - Portion weight (e.g., `450g`)
    - Energy: Calories (`kcal`)
    - Macros: Protein (Oqsil), Fat (Yog'), Carbohydrates (Uglevod)
- **Footer**:
  - Strictly minimalist footer containing: `Created by @Sunnataliyev and @AnakinSkaywalker`.

### 2. Admin Panel Portal (`/admin`)
- **Header**:
  - Logo on the left, **"Hush kelibsiz admin"** in the middle, and 3-language selector on the right.
- **Layout**:
  - Desktop: Left sidebar taking **20% of the screen width** with tabs:
    1. **Products (Taomlar)**
    2. **Categories (Kategoriyalar)**
  - Mobile / Tablet: Responsive bottom navigation bar.
- **Business Logic & Guards**:
  - **Product Creation Guard Clause**: When clicking *"Add Product"* (Taom qo'shish), if no categories exist in the DB, a warning prompt (*"Oldin kategoriya yarating"*) appears and redirects the user directly to the Category Creation modal.
  - **Product Form**:
    - Category dropdown
    - Multilingual names & descriptions (UZ, RU, EN)
    - Price & Portion weight (g)
    - Nutritional values: Calories, Protein, Fat, Carbohydrates
    - Image file upload with thumbnail preview + URL fallback.
  - **Product Actions**:
    - **Edit** (Tahrirlash)
    - **Duplicate / Copy** (Nusxa) — clones the product instantly
    - **Delete** (O'chirish) — with confirmation safeguard.

---

## 🚀 Quick Start Guide

### Option 1: One-Click Startup (Windows)
Double-click `start.bat` in the project root directory. It will automatically run migrations, seed authentic initial data, and launch the backend (port 8000), client (port 5173), and admin (port 5174).

---

### Option 2: Docker Compose (PostgreSQL + All Apps)
Ensure Docker is running and run:
```bash
docker-compose up --build
```

---

### Option 3: Manual Step-by-Step Setup

#### 1. Backend Setup (Terminal 1)
```bash
cd backend
pip install -r requirements.txt

# Run migrations and seed data
python manage.py migrate
python manage.py seed_data

# Start backend server
python manage.py runserver 0.0.0.0:8000
```
API will be accessible at: `http://localhost:8000/api/`

#### 2. Client Menu Website (Terminal 2)
```bash
cd client
npm install
npm run dev
```
Client menu will open at: `http://localhost:5173`

#### 3. Admin Panel (Terminal 3)
```bash
cd admin
npm install
npm run dev
```
Admin dashboard will open at: `http://localhost:5174`

---

## 🗄️ PostgreSQL Database Configuration

To connect Django to your PostgreSQL instance, set the following environment variables (or in your `.env` file):

```ini
DB_NAME=mehmon_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```
*Note: If PostgreSQL variables are omitted, Django will automatically use SQLite (`db.sqlite3`) for instant zero-config development.*

---

## 📡 REST API Endpoints

- `GET /api/categories/` — List all categories (filterable by `?is_active=true`)
- `POST /api/categories/` — Create new category
- `GET /api/categories/{id}/` — Retrieve category details
- `PUT/PATCH /api/categories/{id}/` — Update category
- `DELETE /api/categories/{id}/` — Delete category

- `GET /api/products/` — List all products (supports `?category_id=`, `?search=`, `?is_active=true`)
- `POST /api/products/` — Create new product with multipart image upload
- `GET /api/products/{id}/` — Retrieve product details
- `PUT/PATCH /api/products/{id}/` — Update product details / image
- `DELETE /api/products/{id}/` — Delete product
- `POST /api/products/{id}/duplicate/` — Duplicate product into a new copy

---

## 👨‍💻 Authors & Credits
Created by **@Sunnataliyev** and **@AnakinSkaywalker**.
