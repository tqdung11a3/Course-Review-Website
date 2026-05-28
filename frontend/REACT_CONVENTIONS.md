# Quy tắc code React — Course Review Website

Tài liệu này là **chuẩn chung** cho mọi thành viên làm frontend. Mục tiêu: code dễ đọc, dễ review PR, dễ ghép với API trong `backend/`.

**Stack dự kiến:** React 18+, Vite, React Router, gọi API REST (`http://localhost:5000` khi dev).

---

## 1. Nguyên tắc chung

- **Functional components + Hooks** — không dùng class component.
- **Một file = một trách nhiệm rõ** — component UI tách khỏi logic gọi API khi file > ~200 dòng.
- **Không hard-code URL API** — dùng biến môi trường `VITE_API_BASE_URL`.
- **Không commit** `.env`, `node_modules`, file build (`dist/`).
- **Tiếng Việt** cho UI (label, message lỗi hiển thị user); **tiếng Anh** cho tên biến, hàm, file, commit message.

---

## 2. Cấu trúc thư mục (gợi ý)

Khi khởi tạo project Vite trong `frontend/`:

```
frontend/
  public/
  src/
    api/              # axios/fetch client, hàm gọi từng resource
    assets/           # ảnh, font tĩnh
    components/       # UI tái sử dụng (Button, Modal, RatingStars...)
      common/
      layout/         # Header, Footer, Sidebar
    contexts/         # AuthContext, ThemeContext (nếu cần)
    hooks/            # useAuth, useCourses, useDebounce...
    pages/            # màn hình theo route (Home, CourseDetail...)
    routes/           # định nghĩa React Router
    utils/            # formatDate, validateForm, constants
    App.jsx
    main.jsx
  .env.example
  package.json
```

- **`pages/`**: gắn với route, ghép layout + gọi hook/API.
- **`components/`**: không gọi API trực tiếp nếu có thể — nhận `props` hoặc dùng hook chung.
- **`api/`**: mọi request HTTP tập trung tại đây (không rải `fetch` trong từng component).

---

## 3. Đặt tên

| Loại | Quy ước | Ví dụ |
|------|---------|--------|
| Component file | PascalCase | `CourseCard.jsx`, `ReviewForm.jsx` |
| Hook | camelCase, prefix `use` | `useCourses.js`, `useAuth.js` |
| Hàm tiện ích | camelCase | `formatRating.js` |
| Hằng số | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_FILE_SIZE` |
| CSS module / file style | cùng tên component | `CourseCard.module.css` |
| Route path | kebab-case, tiếng Anh | `/courses`, `/courses/:id/reviews` |

- Props boolean: prefix `is` / `has` — `isLoading`, `hasError`.
- Handler: prefix `on` — `onSubmit`, `onChange`.
- Callback từ con lên cha: `onXxx` — `onReviewCreated`.

---

## 4. Component

```jsx
// ✅ Đúng: named export cho component tái sử dụng
export function CourseCard({ course, onSelect }) {
  if (!course) return null;

  return (
    <article className="course-card" onClick={() => onSelect?.(course._id)}>
      <h3>{course.courseName}</h3>
      <p>{course.courseCode}</p>
    </article>
  );
}
```

- **Default export** chỉ dùng cho `pages/` hoặc `App.jsx` nếu team thống nhất một kiểu; ưu tiên **named export** cho `components/`.
- Không định nghĩa component lồng trong component (tránh re-create mỗi lần render).
- List: **bắt buộc `key` ổn định** (`_id` từ API), không dùng index làm key khi list có thêm/xóa/sắp xếp.

---

## 5. Hooks & state

- **Local state** (`useState`): UI tạm (modal mở/đóng, input form).
- **Server state** (dữ liệu từ API): nên dùng **custom hook** (`useCourses`, `useReviews`) hoặc thư viện như TanStack Query nếu team đồng ý — tránh copy/paste `useEffect` + `fetch` ở nhiều page.
- **`useEffect`**: chỉ dùng khi cần đồng bộ với hệ thống bên ngoài (fetch, subscription). Không dùng effect để tính toán có thể suy ra từ props/state.
- Dependency array **đầy đủ**; không tắt `eslint-plugin-react-hooks` trừ khi có comment giải thích.

---

## 6. Gọi API (backend)

Base URL (`.env`):

```env
VITE_API_BASE_URL=http://localhost:5000
```

- Mọi request cần đăng nhập: header `Authorization: Bearer <token>`.
- Token lưu **`localStorage`** (key thống nhất, ví dụ `course_review_token`) — bọc trong `AuthContext` hoặc module `api/client.js`.
- Xử lý response theo format backend:

```json
{ "success": true, "message": "...", "data": { } }
{ "success": false, "message": "..." }
```

- **401**: xóa token, redirect `/login`.
- **403**: hiển thị thông báo không đủ quyền (student vs admin/moderator).
- Upload file: `POST /api/uploads`, field form **`files`** (multipart), sau đó gửi `fileUrl` trong body JSON (proof, review, material).

Ví dụ tách lớp API:

```js
// src/api/courses.js
import { apiClient } from "./client";

export async function getCourses(params) {
  const { data } = await apiClient.get("/api/courses", { params });
  return data;
}
```

---

## 7. Routing & phân quyền

- Dùng **React Router v6+**.
- Route công khai: trang chủ, danh sách môn, chi tiết môn (review published).
- Route cần đăng nhập: tạo review, proof, profile — bọc bằng component `ProtectedRoute`.
- Route admin/moderator: duyệt proof, publish review — bọc `RoleRoute` (đọc `role` từ `/api/auth/me`).

Không check quyền chỉ bằng ẩn nút UI — backend vẫn là nguồn tin cậy; frontend chỉ cải thiện UX.

---

## 8. Form & validation

- Form phức tạp (review, proof, material): validate trước khi gửi; hiển thị lỗi theo field.
- Rating review: 6 tiêu chí 1–5 khớp schema backend (`overall`, `difficulty`, `workload`, `usefulness`, `gradingFairness`, `teachingQuality`).
- File upload: giới hạn loại file (pdf, doc, docx, ppt, pptx, jpg, jpeg, png) và ~10MB/file — khớp backend.

---

## 9. Styling

Team chọn **một** hướng và giữ xuyên suốt:

- **CSS Modules** (`*.module.css`), hoặc
- **Tailwind CSS**, hoặc
- **MUI / Ant Design** (component library)

Không trộn quá nhiều hệ thống (ví dụ Tailwind + Bootstrap + inline style lung tung). Màu/spacing nên có file `theme` hoặc CSS variables chung.

---

## 10. Git & làm việc nhóm

- Branch: `feature/ten-tinh-nang`, `fix/ten-loi`.
- Commit message (tiếng Anh, ngắn): `feat: add course list page`, `fix: handle 401 on login`.
- Mỗi PR: một mục tiêu rõ; không gộp refactor lớn + feature mới.
- Review PR: chạy `npm run lint` / `npm run build` trước khi merge (khi đã cấu hình).

---

## 11. Chất lượng code

- Bật **ESLint** + **Prettier** (cấu hình chung trong repo, không chỉnh riêng từng máy).
- Tránh `console.log` trên branch merge — dùng tạm khi debug rồi xóa.
- PropTypes hoặc **TypeScript** (khuyến nghị nếu team quen) — thống nhất một lần khi khởi tạo project.

---

## 12. Accessibility & UX tối thiểu

- Nút/icon có `aria-label` khi không có chữ.
- Form có `<label>` gắn `htmlFor` với `id` input.
- Trạng thái loading / empty / error trên mọi màn có fetch dữ liệu.
- Review ẩn danh: UI không hiển thị tên tác giả; không cố lấy `userId` từ API public.

---

## 13. Map nhanh với API backend

| Tính năng UI | API chính |
|--------------|-----------|
| Đăng ký / đăng nhập | `POST /api/auth/register`, `login`, `GET /me` |
| Danh sách / chi tiết môn | `GET /api/courses`, `GET /api/courses/:id` |
| Minh chứng đã học | `POST /api/course-proofs`, `GET /me`, admin: `pending`, `approve`, `reject` |
| Review | `POST /api/reviews`, `GET /api/courses/:id/reviews`, moderation: `publish`, `hide` |
| Tài liệu | `GET /api/courses/:id/materials`, `POST /api/reviews/:reviewId/materials` |
| Vote / báo cáo | `POST /api/reviews/:id/vote`, `POST /api/reviews/:id/report` |
| Upload | `POST /api/uploads` (multipart `files`) |
| Thống kê / gợi ý | `GET /api/courses/:id/stats`, `.../reviews/recommended` |

Chi tiết đầy đủ: xem [`backend/README.md`](../backend/README.md).

---

## 14. Khi thêm quy tắc mới

- Thảo luận ngắn trên nhóm → cập nhật file này → thông báo trong chat nhóm.
- Không thêm quy tắc “cấm tuyệt đối” nếu không có lý do kỹ thuật rõ.

---

*Phiên bản: 1.0 — áp dụng khi khởi tạo project React trong `frontend/`.*
