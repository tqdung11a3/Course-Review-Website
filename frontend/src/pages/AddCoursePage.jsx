import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createCourse } from "../api/courses";
import { uploadFiles } from "../api/uploads";
import { CheckboxGroup } from "../components/courses/form/CheckboxGroup";
import { FormField } from "../components/courses/form/FormField";
import { FormSection } from "../components/courses/form/FormSection";
import { SyllabusUpload } from "../components/courses/form/SyllabusUpload";
import { TagInput } from "../components/courses/form/TagInput";
import { DashboardHeader } from "../components/layout/DashboardHeader";
import {
  ASSESSMENT_OPTIONS,
  COURSE_TYPE_OPTIONS,
  EMPTY_COURSE_FORM,
  LEARNING_MODE_OPTIONS,
  SEMESTER_OPTIONS,
  TEACHING_LANGUAGE_OPTIONS,
} from "../utils/courseFormConstants";
import { applyCourseSubmitError } from "../utils/courseFormErrors";

function validateForm(form) {
  const errors = {};
  if (!form.courseCode.trim()) errors.courseCode = "Vui lòng nhập mã môn học";
  if (!form.courseName.trim()) errors.courseName = "Vui lòng nhập tên môn học";
  if (!form.credits) errors.credits = "Vui lòng chọn số tín chỉ";
  if (!form.faculty) errors.faculty = "Vui lòng chọn khoa / bộ môn";
  return errors;
}

export default function AddCoursePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_COURSE_FORM);
  const [syllabusFiles, setSyllabusFiles] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setError("");
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

      const courseTypeLabel =
        COURSE_TYPE_OPTIONS.find((o) => o.value === form.courseType)?.label || form.courseType;

      await createCourse({
        courseCode: form.courseCode.trim(),
        courseName: form.courseName.trim(),
        credits: Number(form.credits),
        faculty: form.faculty,
        department: form.faculty,
        tags: form.tags,
        courseType: courseTypeLabel || form.courseType,
        offeredSemesters: form.offeredSemesters,
        teachingLanguage:
          TEACHING_LANGUAGE_OPTIONS.find((o) => o.value === form.teachingLanguage)?.label ||
          form.teachingLanguage,
        learningMode:
          LEARNING_MODE_OPTIONS.find((o) => o.value === form.learningMode)?.label ||
          form.learningMode,
        description: form.description.trim(),
        assessmentMethods: form.assessmentMethods.map(
          (v) => ASSESSMENT_OPTIONS.find((o) => o.value === v)?.label || v
        ),
        syllabusFiles: uploaded,
      });

      navigate("/courses", { replace: true });
    } catch (err) {
      applyCourseSubmitError(err, setFieldErrors, setError, "Không thể thêm môn học");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="dashboard-page">
      <DashboardHeader />
      <div className="dashboard-content dashboard-content--form">
        <div className="add-course-card">
          <div className="add-course-header">
            <h1>Thêm Môn học Mới</h1>
            <p className="muted">
              Vui lòng điền đầy đủ thông tin để thêm môn học vào hệ thống
            </p>
          </div>

          <form className="add-course-form" onSubmit={handleSubmit} noValidate>
            <FormSection title="Nhóm 1: Thông tin cơ bản">
              <FormField label="Mã môn học" required error={fieldErrors.courseCode}>
                <input
                  className="form-control"
                  placeholder="VD: CS101"
                  value={form.courseCode}
                  onChange={(e) => updateField("courseCode", e.target.value.toUpperCase())}
                />
              </FormField>

              <FormField label="Tên môn học" required error={fieldErrors.courseName}>
                <input
                  className="form-control"
                  placeholder="VD: Nhập môn Lập trình"
                  value={form.courseName}
                  onChange={(e) => updateField("courseName", e.target.value)}
                />
              </FormField>

              <div className="form-row">
                <FormField label="Số tín chỉ" required error={fieldErrors.credits}>
                  <input
                    className="form-control"
                    type="number"
                    min={0}
                    step={1}
                    placeholder="VD: 3"
                    value={form.credits}
                    onChange={(e) => updateField("credits", e.target.value)}
                  />
                </FormField>

                <FormField label="Khoa / Bộ môn" required error={fieldErrors.faculty}>
                  <input
                    className="form-control"
                    placeholder="VD: Công nghệ thông tin"
                    value={form.faculty}
                    onChange={(e) => updateField("faculty", e.target.value)}
                  />
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
                  placeholder="Mô tả tóm tắt về nội dung và mục tiêu của môn học..."
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
                <SyllabusUpload files={syllabusFiles} onChange={setSyllabusFiles} />
              </FormField>
            </FormSection>

            {error && <p className="auth-form-error">{error}</p>}

            <div className="add-course-actions">
              <Link to="/courses" className="btn btn-secondary">
                Hủy
              </Link>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Đang thêm..." : "Thêm môn học"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
