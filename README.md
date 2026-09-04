# 🍽️ Mehmon Restaurant — Online Menu & Admin Panel

Mehmon restorani uchun qurilgan to'liq onlayn menyu tizimi: mijozlar uchun ko'p tilli menyu sayti, restoran xodimlari uchun himoyalangan boshqaruv paneli va Django REST API.

---

## 🏛️ Arxitektura

| Komponent | Texnologiya | Port | Tavsif |
| :--- | :--- | :--- | :--- |
| **Client** (`/client`) | React 18, Vite, Tailwind, react-i18next | `5173` | Mijozlar uchun menyu: qidiruv, kategoriya filtri, ozuqaviy qiymat |
| **Admin** (`/admin`) | React 18, Vite, Tailwind, react-i18next | `5174` | Login bilan himoyalangan CRUD paneli |
| **Backend** (`/backend`) | Django 5, DRF, Token Auth | `8000` | REST API, ko'p tilli modellar, avtomatik tarjima |
| **Database** | PostgreSQL (prod) / SQLite (lokal) | `5432` | Kategoriyalar, taomlar, ozuqaviy qiymatlar |

---

## 🔐 Xavfsizlik modeli

- **O'qish ochiq**: `GET /api/categories/`, `GET /api/products/` — hammaga, tokensiz.
- **Yozish yopiq**: `POST` / `PUT` / `PATCH` / `DELETE` — faqat amal qiluvchi token bilan.
- **Ommaviy o'chirish yanada qat'iy**: `delete-all` va `delete-selected` — faqat `is_staff` hisob.
- Admin panel token'ni `localStorage`da saqlaydi; server token'ni rad etsa panel avtomatik login ekraniga qaytadi.
- Ishlab chiqarishda `DJANGO_SECRET_KEY` va `DATABASE_URL` majburiy — ularsiz server ishga tushmaydi.

---

## 🚀 Ishga tushirish

### 1-variant: bitta buyruq (lokal)

```bash
./start.sh          # macOS / Linux
start.bat           # Windows
```

Skript virtualenv yaratadi, kutubxonalarni o'rnatadi, migratsiya va seed qiladi,
`admin` hisobini yaratib parolini chop etadi, so'ng uchala servisni ishga tushiradi.

### 2-variant: Docker Compose

```bash
cp .env.example .env      # DJANGO_SECRET_KEY va DB_PASSWORD ni to'ldiring
docker compose up --build
```

Backend gunicorn bilan, frontendlar esa nginx orqali production build sifatida ishlaydi.

### 3-variant: qo'lda

```bash
# Backend
cd backend
python3 -m venv venv && ./venv/bin/pip install -r requirements.txt
cp .env.example .env         # DEBUG=True qo'ying (lokalda SQLite ishlatiladi)
./venv/bin/python manage.py migrate
./venv/bin/python manage.py seed_data
./venv/bin/python manage.py create_admin      # admin hisobi + token
./venv/bin/python manage.py runserver 0.0.0.0:8000

# Client (yangi terminal)
cd client && npm install && npm run dev

# Admin (yangi terminal)
cd admin && npm install && npm run dev
```

---

## 👤 Admin hisobi

```bash
cd backend
./venv/bin/python manage.py create_admin
```

Parolni o'zingiz belgilash uchun:

```bash
ADMIN_USERNAME=mehmon ADMIN_PASSWORD='kuchli-parol' ./venv/bin/python manage.py create_admin
# yoki mavjud hisob parolini almashtirish:
./venv/bin/python manage.py create_admin --username mehmon --password 'yangi-parol' --reset-password
```

---

## ⚙️ Muhit o'zgaruvchilari (backend)

To'liq ro'yxat va izohlar: [`backend/.env.example`](backend/.env.example).

| O'zgaruvchi | Majburiy | Tavsif |
| :--- | :--- | :--- |
| `DJANGO_SECRET_KEY` | prod'da ha | Django maxfiy kaliti |
| `DATABASE_URL` | prod'da ha | PostgreSQL ulanish satri |
| `DEBUG` | yo'q | `True` — lokal rejim (SQLite, ochiq CORS). Standart: `False` |
| `ALLOWED_HOSTS` | prod'da tavsiya | Vergul bilan ajratilgan domenlar |
| `CORS_ALLOWED_ORIGINS` | prod'da tavsiya | Frontend domenlari |
| `MEDIA_ROOT` | yo'q | Yuklangan rasmlar uchun doimiy disk yo'li |
| `AUTO_TRANSLATE` | yo'q | `False` — tashqi tarjima so'rovlarini o'chiradi |

**Muhim:** production'da `DATABASE_URL` bo'lmasa server ataylab ishga tushmaydi.
Bu SQLite'ga tushib qolib, konteyner qayta ishga tushganda butun menyu yo'qolishining oldini oladi.

---

## 🖼️ Rasmlar haqida

Render kabi platformalarda konteyner diski vaqtinchalik: har deploy'da yuklangan
fayllar o'chadi. Ikkita yo'l bor:

1. Doimiy disk ulab, `MEDIA_ROOT` ni o'sha yo'lga qarating (`render.yaml` da tayyor).
2. Yoki taom uchun tashqi **rasm havolasi (URL)** maydonidan foydalaning.

---

## 📡 REST API

**Autentifikatsiya**

- `POST /api/auth/login/` — `{username, password}` → `{token, user}` (daqiqasiga 10 urinish)
- `POST /api/auth/logout/` — token'ni bekor qiladi
- `GET  /api/auth/me/` — token amal qilishini tekshiradi

So'rovlarda: `Authorization: Token <token>`

**Kategoriyalar**

- `GET    /api/categories/` — ro'yxat (`?is_active=true`, `?search=`) · ochiq
- `POST   /api/categories/` · `PATCH /api/categories/{id}/` · `DELETE /api/categories/{id}/` — token
- `POST   /api/categories/delete-all/` · `POST /api/categories/delete-selected/` — staff

**Taomlar**

- `GET    /api/products/` — ro'yxat (`?category=`, `?is_active=`, `?is_recommended=`, `?search=`) · ochiq
- `POST   /api/products/` — multipart rasm yuklash bilan · token
- `PATCH  /api/products/{id}/` · `DELETE /api/products/{id}/` — token
- `POST   /api/products/{id}/duplicate/` — nusxa ko'chirish · token
- `POST   /api/products/delete-all/` · `POST /api/products/delete-selected/` — staff

---

## ✨ Imkoniyatlar

### Mijoz sayti (`/client`)
- 3 tilli interfeys (UZ / RU / EN), tanlov saqlanadi
- Kunduzgi / kechqurungi rejim
- Barcha tillar bo'yicha bir vaqtda qidiruv
- Kategoriya filtri (restoran belgilagan `sort_order` tartibida)
- Taom kartochkasi: rasm, narx, tavsif va ochiladigan **ozuqaviy qiymat** bo'limi
  (porsiya, kaloriya, oqsil, yog', uglevod)
- Tavsiya etilgan taomlar doim yuqorida
- Aloqa uzilsa oxirgi menyu ekranda qoladi va ogohlantirish chiqadi

### Admin panel (`/admin`)
- Login ekrani; sessiya tugasa avtomatik qaytariladi
- Taomlar va kategoriyalar uchun to'liq CRUD
- Bitta maydonga nom yozilsa — avtomatik 3 tilga tarjima; kerak bo'lsa **qo'lda tarjima** kiritish mumkin
- Ozuqaviy qiymat maydonlari (porsiya, kaloriya, BJU)
- Rasm yuklash (JPEG/PNG/WEBP/GIF, 10 MB gacha) yoki tashqi URL
- Nusxa ko'chirish, ko'p tanlab o'chirish, tasdiqlash oynalari
- Kategoriya bo'lmasa taom qo'shishga yo'l qo'ymaydigan guard
- Xatolar aniq matn bilan ko'rsatiladi (DRF validatsiya xabarlari ham)

---

## 🧪 Testlar

```bash
cd backend
DEBUG=True ./venv/bin/python manage.py test menu
```

30 ta test: ruxsatlar, autentifikatsiya, ommaviy o'chirish, validatsiya,
tarjima chaqiruvlari va matn formatlash qamrab olingan. Testlar tarmoqqa chiqmaydi.

---

## 👨‍💻 Mualliflar
Created by **@Sunnatal1yev** and **@AnakinSkaywalker**.
