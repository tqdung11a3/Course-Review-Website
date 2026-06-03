# Course Review Website — Backend API

Code API nằm trong thư mục **`backend/`** của repo. Mọi lệnh `npm install` / `npm run dev` chạy **từ trong `backend/`** (hoặc `cd backend` trước).

Backend cho hệ thống **review môn học** dành sinh viên: xác minh đã học môn, review theo mẫu, tài liệu học tập, vote hữu ích, báo cáo/moderation và thống kê theo môn.

## Stack

- Node.js + Express.js  
- MongoDB + Mongoose  
- JWT (Bearer token)  
- bcrypt (hash mật khẩu)  
- Multer — upload file **local** vào thư mục `UPLOAD_DIR` (mặc định `uploads/`), phục vụ qua `/uploads/...`  
- express-validator  

## Cài đặt & chạy

1. Sao chép biến môi trường:

```bash
cd backend
cp .env.example .env
```

Chỉnh `MONGO_URI`, `JWT_SECRET` trong `.env`.

2. Cài dependency và chạy dev:

```bash
cd backend
npm install
npm run dev
```

Mặc định server: `http://localhost:5000`  
Health check: `GET /health`

## Tạo tài khoản admin / moderator

Đăng ký qua `POST /api/auth/register` (mặc định role `student`). Sau đó trong MongoDB cập nhật:

```js
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
);
```

Giá trị `role` hợp lệ: `student` | `admin` | `moderator`.

## API chính (tóm tắt)

| Nhóm | Base path |
|------|-----------|
| Auth | `/api/auth` |
| Courses | `/api/courses` |
| Minh chứng học môn | `/api/course-proofs` |
| Reviews | `/api/reviews` |
| Tài liệu (theo id) | `/api/materials` |
| Báo cáo | `/api/reports` |
| Upload | `/api/uploads` |

**Auth:** gửi header `Authorization: Bearer <token>`.

**Upload:** `POST /api/uploads` (multipart field `files`, tối đa 20 file, 10MB/file). Định dạng: pdf, doc, docx, ppt, pptx, jpg, jpeg, png. Response trả `fileUrl`, `fileName`, `fileType`, `fileSize` dùng gắn vào `proofFiles` / `evidenceFiles` / `attachmentFiles` / `syllabusFiles`.

**Lưu trữ file:** Nếu cấu hình `CLOUDINARY_*` trong `.env`, file upload lên [Cloudinary](https://cloudinary.com) (`fileUrl` dạng `https://res.cloudinary.com/...`). Không cấu hình → lưu local thư mục `UPLOAD_DIR` (mặc định `uploads/`).

**Luồng điển hình:** đăng ký → đăng nhập → `POST /api/uploads` → `POST /api/course-proofs` (kèm `proofFiles`) → admin duyệt `PUT /api/course-proofs/:id/approve` → `POST /api/reviews` (cần `enrollmentProofId` đã approved, đúng `courseId`, `semester`, `academicYear`) → moderator `PUT /api/reviews/:id/publish` → `POST /api/reviews/:reviewId/materials` (tuỳ chọn).

**Vote:** `POST /api/reviews/:id/vote` body `{ "voteType": "helpful" | "not_helpful" }`; `DELETE /api/reviews/:id/vote`.

**Gợi ý review:** `GET /api/courses/:id/reviews/recommended?selfRatedLevel=beginner&...`

**Thống kê môn:** `GET /api/courses/:id/stats`

## Response JSON

Thành công:

```json
{ "success": true, "message": "...", "data": { } }
```

Lỗi:

```json
{ "success": false, "message": "..." }
```

## Cấu trúc thư mục

```
src/
  config/       db.js, env.js
  models/       User, Course, CourseProof, Review, LearningMaterial, ReviewVote, ReviewReport
  controllers/
  routes/
  middlewares/
  utils/
  app.js
  server.js
```

## Ghi chú

- Bình chọn hữu ích: một user một vote / review; đổi vote cập nhật đếm `helpfulCount` / `notHelpfulCount`. Không cho vote review của chính mình.  
- Review ẩn danh: vẫn lưu `userId`; API ẩn thông tin tác giả với người xem không phải chủ sở hữu.  
- Index MongoDB: xem các `schema.index(...)` trong từng model (email, courseCode, text search course, unique review/user/course/semester/year, v.v.).
