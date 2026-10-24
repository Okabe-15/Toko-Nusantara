# Toko Nusantara

Marketplace produk lokal dengan backend Express REST API dan frontend React/Vite yang dipisahkan dalam folder `server/` dan `client/`.

## Fitur dan arsitektur

- `GET /api/home`, `/api/products`, dan `/api/categories` tersedia publik. Endpoint home menyediakan statistik, kategori beserta jumlah produk, dan pilihan produk terjangkau.
- Auth berbasis session: register, login, logout, dan `GET /api/auth/me`.
- Role `buyer` dan `seller` divalidasi di backend.
- Seller dapat mengelola produk dan upload gambar (JPG/PNG/WEBP, maksimal 2 MB).
- Buyer dapat mengelola cart, subtotal, total, dan status budget.
- Backend hanya melayani REST API dan file gambar produk.
- Frontend React dapat dideploy ke hosting statis terpisah dari backend.

## Instalasi lokal

Prasyarat: Node.js 18+, PostgreSQL, dan npm.

Backend (`server/`):

```sh
npm install --prefix server
cp .env.example server/.env
# isi DATABASE_URL, SESSION_SECRET, dan FRONTEND_URL
npm run db:setup
npm run server:start
```

Jika terminal sedang berada di dalam folder `server/`, gunakan perintah tanpa prefix:

```sh
cd server
npm install
npm start
```

`npm start` di dalam `server/` memakai konfigurasi development PostgreSQL lokal dari `server/config/config.json`. Untuk production dari folder `server/`, gunakan:

```sh
npm run start:prod
```

Perintah production membutuhkan `DATABASE_URL` di `server/.env`.

Frontend development (jalankan backend pada terminal lain):

```sh
npm run client:dev
```

Jika backend tidak berada di `http://localhost:3002`, buat `client/.env.local`:

```env
VITE_API_URL=http://localhost:3002
```

Build frontend production:

```sh
npm run client:build
```

Validasi model, asosiasi, getter, dan REST API router:

```sh
npm test
```

## Environment variable

- `NODE_ENV`: `development` atau `production`.
- `PORT`: port server, default `3002`.
- `SESSION_SECRET`: secret cookie session; wajib diganti pada production.
- `DATABASE_URL`: connection string PostgreSQL/Neon/Supabase untuk production.
- `FRONTEND_URL`: satu atau beberapa origin frontend, dipisahkan koma, yang diizinkan CORS.
- `SESSION_COOKIE_SECURE`: `false` untuk HTTP langsung; `true` jika backend diakses melalui HTTPS.

`server/config/config.json` tetap digunakan Sequelize CLI. Jalankan migrasi dan seed dengan `npm run db:migrate` dan `npm run db:seed`. Jangan menjalankan `db:reset` terhadap production.

## Endpoint utama

| Method | Endpoint | Akses |
| --- | --- | --- |
| POST | `/api/auth/register` | Publik |
| POST | `/api/auth/login` | Publik |
| POST | `/api/auth/logout` | Login |
| GET | `/api/auth/me` | Publik/session |
| GET | `/api/categories` | Publik |
| GET | `/api/home` | Publik, data homepage dan statistik katalog |
| GET | `/api/products`, `/api/products/:id` | Publik |
| POST/PATCH/DELETE | `/api/products...` | Seller |
| GET/PATCH | `/api/profile...` | Login |
| GET/POST/PATCH/DELETE | `/api/cart...` | Buyer |

Semua response sukses memakai `{ message, data }` bila ada data dan error memakai `{ error: { message } }`.

## Deployment terpisah

Deploy backend dan frontend sebagai dua service berbeda:

### Backend di AWS EC2

```sh
npm ci --prefix server
npm --prefix server run db:migrate
pm2 start ecosystem.config.cjs
pm2 save
```

Set environment backend di `server/.env`:

```env
NODE_ENV=production
PORT=3002
SESSION_SECRET=<random-secret>
SESSION_COOKIE_SECURE=false
FRONTEND_URL=https://frontend.example.com
DATABASE_URL=postgres://<user>:<password>@<host>:5432/<database>?sslmode=require
```

Buka TCP `3002` pada Security Group EC2 dan gunakan URL backend, misalnya `http://<EC2_PUBLIC_IP>:3002`.

### Frontend React

Build frontend dari folder repository:

```sh
npm ci --prefix client
npm run client:build
```

Deploy isi `client/dist` ke static hosting pilihan Anda. Set variable build:

```env
VITE_API_URL=http://<EC2_PUBLIC_IP>:3002
```

Untuk domain HTTPS, gunakan `VITE_API_URL=https://api.example.com`, `FRONTEND_URL=https://frontend.example.com`, dan set `SESSION_COOKIE_SECURE=true`.

Local filesystem uploads pada `assets/uploads` hanya cocok untuk development. Backend tetap menyajikan gambar melalui `/assets`; gunakan persistent storage atau object storage jika instance EC2 dapat diganti.
