# Hướng dẫn deploy — Vercel (frontend) + Render (backend)

Kiến trúc:

```
[Trình duyệt] → Vercel (React) → Render (Express API) → MongoDB Atlas
                                      ↓
                              Cloudinary (file PDF/ảnh, khuyến nghị)
```

**File upload:** Cấu hình **Cloudinary** trên Render (xem mục dưới). URL file dạng `https://res.cloudinary.com/...` — **không mất** khi redeploy.

### Cloudinary (bắt buộc trên Render production)

1. Đăng ký [cloudinary.com](https://cloudinary.com) (free).
2. **Dashboard** → **API Keys** → copy **Cloud name**, **API Key**, **API Secret**.
3. Trên **Render** → service backend → **Environment** → thêm:

| Key | Value |
|-----|--------|
| `CLOUDINARY_CLOUD_NAME` | Cloud name |
| `CLOUDINARY_API_KEY` | API Key |
| `CLOUDINARY_API_SECRET` | API Secret |

4. **Save** → đợi redeploy **Live**.
5. **Upload lại** Syllabus / bảng điểm cho môn cũ (link `onrender.com/uploads/...` cũ không còn file).

Máy dev: thêm 3 biến vào `backend/.env` (xem `backend/.env.example`). Không có Cloudinary → vẫn lưu local `uploads/` (chỉ phù hợp chạy local).

### Link cũ `onrender.com/uploads/...` báo lỗi

- File upload **trước khi** bật Cloudinary nằm trên ổ Render (đã mất).
- Cần **upload lại** tài liệu; link mới sẽ là `res.cloudinary.com`.

---

## Bước 0 — Chuẩn bị

### 0.1. Đẩy code lên GitHub

```bash
git add .
git commit -m "Prepare for deploy"
git push origin main
```

(Nhánh `main` hoặc `master` đều được; Vercel/Render đọc nhánh bạn chọn.)

### 0.2. MongoDB Atlas (database)

1. Vào [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → đăng ký / đăng nhập.
2. **Create** cluster (free **M0**).
3. **Database Access** → Add user (username + password) → quyền read/write.
4. **Network Access** → **Add IP Address** → `0.0.0.0/0` (cho phép Render kết nối; production có thể siết IP sau).
5. **Database** → **Connect** → **Drivers** → copy connection string, ví dụ:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/course-review?retryWrites=true&w=majority
   ```

   Thay `USER`, `PASSWORD`, và đặt tên DB `course-review` (hoặc tên khác, giữ nhất quán).

---

## Bước 1 — Deploy backend trên Render

### 1.1. Tạo Web Service

1. [dashboard.render.com](https://dashboard.render.com) → đăng nhập (GitHub).
2. **New +** → **Web Service**.
3. Connect repository **Course-Review-Website**.
4. Cấu hình:

   | Mục | Giá trị |
   |-----|---------|
   | **Name** | `course-review-api` (tùy ý) |
   | **Region** | Singapore hoặc gần VN nhất |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free |

### 1.2. Biến môi trường (Environment)

Trong tab **Environment** của service, thêm:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Chuỗi Atlas ở bước 0.2 |
| `JWT_SECRET` | Chuỗi ngẫu nhiên dài (≥ 32 ký tự), ví dụ tạo bằng PowerShell: `[Convert]::ToBase64String((1..48\|%{Get-Random -Max 256}))` |
| `JWT_EXPIRES_IN` | `7d` |
| `UPLOAD_DIR` | `uploads` |
| `CLOUDINARY_CLOUD_NAME` | Từ Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Từ Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Từ Cloudinary Dashboard |

**Không** commit file `.env` lên Git.

### 1.3. Deploy

- Bấm **Create Web Service** → đợi build xong (trạng thái **Live**).
- URL API dạng: `https://course-review-api.onrender.com`

### 1.4. Kiểm tra API

Mở trình duyệt hoặc terminal:

```bash
curl https://course-review-api.onrender.com/health
```

Kỳ vọng: `{"success":true,"message":"OK",...}`

Nếu lỗi MongoDB: kiểm tra `MONGO_URI`, user/password, Network Access `0.0.0.0/0`.

### 1.5. (Tuỳ chọn) Deploy bằng Blueprint

Repo có file `render.yaml`. Trên Render: **New +** → **Blueprint** → chọn repo → điền `MONGO_URI` khi được hỏi.

---

## Bước 2 — Deploy frontend trên Vercel

### 2.1. Import project

1. [vercel.com](https://vercel.com) → đăng nhập GitHub.
2. **Add New…** → **Project** → import repo **Course-Review-Website**.

### 2.2. Cấu hình build

| Mục | Giá trị |
|-----|---------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` (bấm Edit → chọn thư mục `frontend`) |
| **Build Command** | `npm run build` (mặc định Vite) |
| **Output Directory** | `dist` |

### 2.3. Environment Variables

Thêm **trước khi** deploy lần đầu (hoặc Settings → Environment Variables → redeploy):

| Name | Value |
|------|--------|
| `VITE_API_BASE_URL` | URL Render **không** có `/` cuối, ví dụ `https://course-review-api.onrender.com` |

Vite nhúng biến này lúc **build** — đổi URL API sau này cần **Redeploy** frontend.

### 2.4. Deploy

- **Deploy** → đợi xong → URL dạng `https://course-review-website.vercel.app`

File `frontend/vercel.json` đã cấu hình rewrite SPA (F5 trên `/courses`, `/login`, … không bị 404).

---

## Bước 3 — Kiểm tra end-to-end

1. Mở URL Vercel → **Đăng ký** (email `@sis.hust.edu.vn` theo quy tắc app).
2. **Đăng nhập** → danh sách môn → xem chi tiết môn.
3. **Viết review** + upload bảng điểm → mở lại review → link file mở được.
4. Tạo tài khoản **Quản trị** (role `admin` trong MongoDB, xem `backend/README.md`).

### Tạo admin trên Atlas

Atlas → **Browse Collections** → database → collection `users` → tìm user → sửa field `role` thành `admin` (hoặc dùng mongosh):

```js
db.users.updateOne(
  { email: "ban@sis.hust.edu.vn", role: "admin" },
  { $set: { role: "admin" } }
);
```

(Email phải khớp đúng bản ghi đã đăng ký role `admin` nếu app tách theo email+role.)

---

## Bước 4 — Render free: sleep & cold start

- Free tier **ngủ** sau ~15 phút không có request → request đầu có thể **chậm 30–60 giây**.
- Frontend vẫn nhanh; chỉ API lần đầu sau khi ngủ bị trễ — bình thường với demo.

---

## Railway (thay Render) — tóm tắt

Nếu muốn dùng [Railway](https://railway.app):

1. **New Project** → Deploy from GitHub → chọn repo.
2. Service: **Root** = `backend`, start `npm start`.
3. Variables: giống bảng env Render ở trên.
4. **Settings → Networking → Generate Domain** → copy URL làm `VITE_API_BASE_URL`.
5. (Khuyến nghị lưu file) **Volume** mount ví dụ `/data` → set `UPLOAD_DIR=/data/uploads`.

---

## Checklist nhanh

- [ ] Code trên GitHub
- [ ] MongoDB Atlas + `MONGO_URI`
- [ ] Render: root `backend`, `npm start`, env đủ
- [ ] `GET .../health` OK
- [ ] Vercel: root `frontend`, `VITE_API_BASE_URL` = URL Render
- [ ] Đăng ký / đăng nhập / upload file thử
- [ ] `JWT_SECRET` mạnh, không dùng mặc định

---

## Xử lý lỗi thường gặp

| Triệu chứng | Nguyên nhân / cách sửa |
|-------------|-------------------------|
| Frontend gọi API lỗi CORS/network | Sai `VITE_API_BASE_URL` hoặc chưa redeploy frontend sau khi đổi env |
| `401` / không giữ đăng nhập | Token hết hạn; kiểm tra API cùng domain đã cấu hình |
| Upload OK nhưng link file `http://` hoặc hỏng | Backend đã bật `trust proxy` trong production; redeploy backend |
| File biến mất sau deploy | Render free — chấp nhận hoặc disk/volume/Cloudinary |
| Atlas connection refused | IP whitelist, sai password trong URI (encode ký tự đặc biệt) |
| Vercel 404 khi F5 trang con | Thiếu `frontend/vercel.json` — đã có trong repo |

---

## Cập nhật sau này

```bash
git add .
git commit -m "Your change"
git push
```

- **Render** và **Vercel** tự build lại khi push (nếu bật auto-deploy).
- Đổi `VITE_API_BASE_URL` → Vercel → **Deployments** → **Redeploy**.
- Đổi biến backend → Render → **Environment** → **Save** (service restart).

---

## Tài liệu liên quan

- Biến môi trường backend: `backend/.env.example`
- Biến frontend: `frontend/.env.example`
- API chi tiết: `backend/README.md`
