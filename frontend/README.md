# Frontend — Course Review Website

Frontend React da duoc scaffold san de ca nhom code chung, tranh trung file.

## Quy tac code chung

Doc va tuan thu: **[`REACT_CONVENTIONS.md`](./REACT_CONVENTIONS.md)**.

## Chay project

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Mac dinh API backend:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Cac file da tao san

- `package.json`, `vite.config.js`, `index.html`
- `.env.example`, `.gitignore`
- `src/api/*` (client + auth + courses)
- `src/contexts/AuthContext.jsx`
- `src/hooks/useAuth.js`
- `src/routes/*` (router, protected route, role route)
- `src/pages/*` (home, login, courses, course detail, profile, admin proofs, 404)
- `src/components/common/LoadingSpinner.jsx`
- `src/components/layout/MainLayout.jsx`
- `src/styles.css`
