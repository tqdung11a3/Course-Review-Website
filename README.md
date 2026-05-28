# Course Review Website

Monorepo: **API trong `backend/`**, **React trong `frontend/`**.

## Backend (API)

```bash
cd backend
npm install
npm run dev
```

Chi tiết API, biến môi trường, luồng đăng ký / proof / review: xem [`backend/README.md`](backend/README.md).

Tạo file môi trường:

```bash
cd backend
cp .env.example .env
```

## Cấu trúc gợi ý

```
Course-Review-Website/
  README.md           ← file này
  backend/            ← Express + MongoDB API
    .env
    .env.example
    package.json
    src/
  frontend/           ← React (xem REACT_CONVENTIONS.md)
    REACT_CONVENTIONS.md
```

## Frontend (React)

Quy tắc code chung cho nhóm: [`frontend/REACT_CONVENTIONS.md`](frontend/REACT_CONVENTIONS.md)

Hướng dẫn khởi tạo Vite: [`frontend/README.md`](frontend/README.md)
