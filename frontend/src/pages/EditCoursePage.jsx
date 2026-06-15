import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCourseById, updateCourse } from "../api/courses";
import { uploadFiles } from "../api/uploads";
import { CheckboxGroup } from "../components/courses/form/CheckboxGroup";
import { FormField } from "../components/courses/form/FormField";
import { FormSection } from "../components/courses/form/FormSection";
import { SyllabusUpload } from "../components/courses/form/SyllabusUpload";
import { TagInput } from "../components/courses/form/TagInput";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { DashboardHeader } from "../components/layout/DashboardHeader";
import {
  ASSESSMENT_OPTIONS,
  COURSE_TYPE_OPTIONS,
  CREDIT_OPTIONS,
  EMPTY_COURSE_FORM,
  FACULTY_OPTIONS,
  LEARNING_MODE_OPTIONS,
  SEMESTER_OPTIONS,
  TEACHING_LANGUAGE_OPTIONS,
} from "../utils/courseFormConstants";
import { applyCourseSubmitError } from "../utils/courseFormErrors";
import { buildCoursePayload, mapCourseToForm } from "../utils/courseFormHelpers";

function validateForm(form) {
  const errors = {};
  if (!form.courseCode.trim()) errors.courseCode = "Vui lòng nhập mã môn học";
  if (!form.courseName.trim()) errors.courseName = "Vui lòng nhập tên môn học";
  if (!form.credits) errors.credits = "Vui lòng chọn số tín chỉ";
  if (!form.faculty) errors.faculty = "Vui lòng chọn khoa / bộ môn";
  return errors;
}

export default function EditCoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_COURSE_FORM);
  const [existingSyllabus, setExistingSyllabus] = useState([]);
  const [syllabusFiles, setSyllabusFiles] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const courseRes = await getCourseById(id);
        const course = courseRes?.data?.course;
        if (!course) {
          setError("Không tìm thấy môn học");
          return;
        }
        const mapped = mapCourseToForm(course);
        if (mapped) setForm(mapped);
        setExistingSyllabus(course.syllabusFiles || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Không thể tải môn học");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setError("");
  }

  function removeExistingSyllabus(index) {
    setExistingSyllabus((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      let uploaded = [];
      if (syllabusFiles.length > 0) {
        const uploadResponse = await uploadFiles(syllabusFiles);
        uploaded = uploadResponse?.data?.files || [];
      }

      await updateCourse(id, buildCoursePayload(form, [...existingSyllabus, ...uploaded]));
      navigate(`/courses/${id}`, { replace: true });
    } catch (err) {
      applyCourseSubmitError(err, setFieldErrors, setError, "Không thể cập nhật môn học");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <DashboardHeader />
        <div className="dashboard-content">
          <LoadingSpinner label="Đang tải môn học..." />
        </div>
      </div>
    );
  }

  if (error && !form.courseCode) {
    return (
      <div className="dashboard-page">
        <DashboardHeader />
        <div className="dashboard-content">
          <p className="error">{error}</p>
          <Link to="/courses" className="btn btn-secondary">
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <DashboardHeader />
      <div className="dashboard-content dashboard-content--form">
        <div className="add-course-card">
          <div className="add-course-header">
            <Link to={`/courses/${id}`} className="back-link">
              ← Quay lại môn học
            </Link>
            <h1>Sửa thông tin môn học</h1>
            <p className="muted">Cập nhật thông tin môn học bạn đã tạo</p>
          </div>

          <form className="add-course-form" onSubmit={handleSubmit} noValidate>
            <FormSection title="Nhóm 1: Thông tin cơ bản">
              <FormField label="Mã môn học" required error={fieldErrors.courseCode}>
                <input
                  className="form-control"
                  value={form.courseCode}
                  onChange={(e) => updateField("courseCode", e.target.value.toUpperCase())}
                />
              </FormField>
              <FormField label="Tên môn học" required error={fieldErrors.courseName}>
                <input
                  className="form-control"
                  value={form.courseName}
                  onChange={(e) => updateField("courseName", e.target.value)}
                />
              </FormField>
              <div className="form-row">
                <FormField label="Số tín chỉ" required error={fieldErrors.credits}>
                  <select
                    className="form-control"
                    value={form.credits}
                    onChange={(e) => updateField("credits", e.target.value)}
                  >
                    <option value="">Chọn số tín chỉ</option>
                    {CREDIT_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Khoa / Bộ môn" required error={fieldErrors.faculty}>
                  <select
                    className="form-control"
                    value={form.faculty}
                    onChange={(e) => updateField("faculty", e.target.value)}
                  >
                    <option value="">Chọn khoa</option>
                    {FACULTY_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
              <FormField label="Thẻ (Tags)">
                <TagInput
                  tags={form.tags}
                  onChange={(tags) => updateField("tags", tags)}
                  placeholder="Nhập tag và nhấn Enter"
                />
              </FormField>
            </FormSection>

            <FormSection title="Nhóm 2: Phân loại">
              <FormField label="Loại môn học">
                <select
                  className="form-control"
                  value={form.courseType}
                  onChange={(e) => updateField("courseType", e.target.value)}
                >
                  <option value="">Chọn loại</option>
                  {COURSE_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Học kỳ thường mở">
                <CheckboxGroup
                  options={SEMESTER_OPTIONS}
                  values={form.offeredSemesters}
                  onChange={(v) => updateField("offeredSemesters", v)}
                />
              </FormField>
              <div className="form-row">
                <FormField label="Ngôn ngữ giảng dạy">
                  <select
                    className="form-control"
                    value={form.teachingLanguage}
                    onChange={(e) => updateField("teachingLanguage", e.target.value)}
                  >
                    <option value="">Chọn ngôn ngữ</option>
                    {TEACHING_LANGUAGE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Hình thức học">
                  <select
                    className="form-control"
                    value={form.learningMode}
                    onChange={(e) => updateField("learningMode", e.target.value)}
                  >
                    <option value="">Chọn hình thức</option>
                    {LEARNING_MODE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Nhóm 3: Nội dung học">
              <FormField label="Mô tả ngắn">
                <textarea
                  className="form-control form-textarea"
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </FormField>
              <FormField label="Hình thức đánh giá">
                <CheckboxGroup
                  options={ASSESSMENT_OPTIONS}
                  values={form.assessmentMethods}
                  onChange={(v) => updateField("assessmentMethods", v)}
                />
              </FormField>
              <FormField label="Tài liệu / Syllabus">
                {existingSyllabus.length > 0 && (
                  <ul className="syllabus-existing-list">
                    {existingSyllabus.map((f, index) => (
                      <li key={f.fileUrl || index} className="syllabus-existing-item">
                        <a href={f.fileUrl} target="_blank" rel="noreferrer">
                          {f.fileName || "Tài liệu"}
                        </a>
                        <button type="button" onClick={() => removeExistingSyllabus(index)}>
                          Xóa
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <SyllabusUpload files={syllabusFiles} onChange={setSyllabusFiles} />
              </FormField>
            </FormSection>

            {error && <p className="auth-form-error">{error}</p>}

            <div className="add-course-actions">
              <Link to={`/courses/${id}`} className="btn btn-secondary">
                Hủy
              </Link>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
