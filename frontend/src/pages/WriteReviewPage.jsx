import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createCourseProof } from "../api/courseProofs";
import { getCourseById } from "../api/courses";
import { createReview, createReviewMaterial } from "../api/reviews";
import { uploadFiles } from "../api/uploads";
import { FormField } from "../components/courses/form/FormField";
import { MaterialForm } from "../components/reviews/MaterialForm";
import { ReviewStepper } from "../components/reviews/ReviewStepper";
import { DashboardHeader } from "../components/layout/DashboardHeader";
import { getMaterialTypeLabel } from "../utils/reviewDisplay";
import {
  EMPTY_REVIEW_FORM,
  GRADE_OPTIONS,
  REVIEW_STEPS,
  SEMESTER_REVIEW_OPTIONS,
  createEmptyMaterial,
  expandUsagePurposes,
  parseSemesterValue,
  validateMaterialDraft,
} from "../utils/reviewFormConstants";

function RatingSlider({ label, value, onChange }) {
  return (
    <div className="rating-slider-row">
      <label className="rating-slider-label">{label}</label>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rating-slider"
      />
      <span className="rating-slider-value">{value}/5</span>
    </div>
  );
}

const DETAIL_FIELDS = [
  { key: "courseContent", label: "Nội dung học", placeholder: "Mô tả những nội dung chính được học trong môn, chương nào quan trọng nhất..." },
  { key: "assignmentWorkload", label: "Khối lượng bài tập", placeholder: "Mô tả số lượng và độ khó của bài tập, tần suất giao bài..." },
  { key: "examFormat", label: "Hình thức kiểm tra", placeholder: "Bài kiểm tra giữa kỳ, cuối kỳ, quiz, presentation..." },
  { key: "gradingMethod", label: "Cách chấm điểm", placeholder: "Tỷ lệ phần trăm các thành phần điểm: bài tập, giữa kỳ, cuối kỳ..." },
  { key: "lecturerRequirements", label: "Yêu cầu của giảng viên", placeholder: "Các yêu cầu đặc biệt về format bài tập, deadline, tham gia lớp..." },
  { key: "effectiveStudyTips", label: "Kinh nghiệm học hiệu quả", placeholder: "Lời khuyên về cách học, tài liệu tham khảo, cách chuẩn bị thi..." },
  { key: "commonDifficulties", label: "Khó khăn thường gặp", placeholder: "Những khó khăn mà sinh viên thường gặp và cách vượt qua..." },
];

export default function WriteReviewPage() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_REVIEW_FORM);
  const [proofFiles, setProofFiles] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [draftMaterial, setDraftMaterial] = useState(createEmptyMaterial);
  const [materialErrors, setMaterialErrors] = useState({});
  const [courseName, setCourseName] = useState("");

  useEffect(() => {
    getCourseById(courseId)
      .then((res) => setCourseName(res?.data?.course?.courseName || ""))
      .catch(() => {});
  }, [courseId]);

  function updateRating(key, value) {
    setForm((prev) => ({
      ...prev,
      ratings: { ...prev.ratings, [key]: value },
    }));
  }

  function updateDetail(key, value) {
    setForm((prev) => ({
      ...prev,
      details: { ...prev.details, [key]: value },
    }));
  }

  function validateStep(current) {
    const errors = {};
    if (current === 1) {
      if (!form.lecturerName.trim()) errors.lecturerName = "Vui lòng nhập giảng viên";
      if (!form.semesterValue) errors.semesterValue = "Vui lòng chọn học kỳ";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleProofSelect(event) {
    const files = Array.from(event.target.files || []);
    const valid = files.filter((f) => f.size <= 5 * 1024 * 1024);
    setProofFiles(valid);
    event.target.value = "";
  }

  async function addMaterial() {
    const errors = validateMaterialDraft(draftMaterial);
    if (Object.keys(errors).length > 0) {
      setMaterialErrors(errors);
      return;
    }

    let attachmentFiles = [...(draftMaterial.attachmentFiles || [])];
    if (draftMaterial.localFiles?.length > 0) {
      try {
        const uploadRes = await uploadFiles(draftMaterial.localFiles);
        attachmentFiles = [...attachmentFiles, ...(uploadRes?.data?.files || [])];
      } catch {
        setError("Không thể tải file tài liệu lên");
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        {
          ...draftMaterial,
          attachmentFiles,
          localFiles: [],
        },
      ],
    }));
    setDraftMaterial(createEmptyMaterial());
    setMaterialErrors({});
    setShowMaterialForm(false);
  }

  function openMaterialForm() {
    setDraftMaterial(createEmptyMaterial());
    setMaterialErrors({});
    setShowMaterialForm(true);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError("");
    try {
      const { semester, academicYear } = parseSemesterValue(form.semesterValue);

      let evidenceFiles = [];
      if (proofFiles.length > 0) {
        const uploadRes = await uploadFiles(proofFiles);
        evidenceFiles = uploadRes?.data?.files || [];
      }

      const proofRes = await createCourseProof({
        courseId,
        semester,
        academicYear,
        lecturerName: form.lecturerName.trim(),
        proofFiles: evidenceFiles,
      });
      const proofId = proofRes?.data?.proof?._id;
      if (!proofId) throw new Error("Không tạo được minh chứng");

      const reviewRes = await createReview({
        courseId,
        enrollmentProofId: proofId,
        semester,
        academicYear,
        lecturerName: form.lecturerName.trim(),
        grade: form.grade,
        hasMandatoryAttendance: form.hasMandatoryAttendance,
        wouldTakeAgain: form.wouldTakeAgain,
        ratings: {
          overall: form.ratings.overall,
          difficulty: form.ratings.difficulty,
          workload: form.ratings.workload,
          usefulness: form.ratings.usefulness,
          gradingFairness: form.ratings.gradingFairness,
          teachingQuality: form.ratings.teachingQuality,
        },
        details: form.details,
        evidenceFiles,
      });

      const reviewId = reviewRes?.data?.review?._id;
      if (reviewId && form.materials.length) {
        await Promise.all(
          form.materials.map((m) =>
            createReviewMaterial(reviewId, {
              title: m.title.trim(),
              materialType: m.materialType,
              source: m.source,
              linkUrl: m.linkUrl || "",
              authorOrPublisher: m.authorOrPublisher || "",
              versionOrYear: m.versionOrYear || "",
              attachmentFiles: m.attachmentFiles || [],
              ratings: m.ratings,
              usagePurposes: expandUsagePurposes(m.usagePurposes),
              suitableFor: m.suitableFor,
              contentSummary: m.contentSummary || "",
              strengths: m.strengths || "",
              limitations: m.limitations || "",
              effectiveUsageGuide: m.effectiveUsageGuide || "",
              recommendationLevel: m.recommendationLevel,
            })
          )
        );
      }

      navigate("/profile", {
        replace: true,
        state: {
          flash:
            "Review đã gửi thành công và đang chờ quản trị phê duyệt. Bạn sẽ nhận thông báo khi có kết quả.",
        },
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Không thể gửi review");
    } finally {
      setIsSubmitting(false);
    }
  }

  function goNext() {
    if (!validateStep(step)) return;
    if (step < 4) setStep((s) => s + 1);
  }

  function goBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  return (
    <div className="dashboard-page">
      <DashboardHeader />
      <div className="dashboard-content dashboard-content--form">
        <div className="write-review-card">
          <Link to={`/courses/${courseId}`} className="back-link">
            ← Quay lại môn học
          </Link>
          <h1>Viết Review Môn học</h1>
          <p className="muted">
            Review của bạn sẽ giúp sinh viên khác đưa ra quyết định tốt hơn
            {courseName ? ` — ${courseName}` : ""}
          </p>

          <ReviewStepper currentStep={step} steps={REVIEW_STEPS} />

          {step === 1 && (
            <div className="review-step-content">
              <div className="review-info-box">
                <strong>ⓘ Xác minh người đã học</strong>
                <p>
                  Để đảm bảo tính chính xác, bạn cần cung cấp thông tin và minh chứng về việc đã
                  học môn này.
                </p>
              </div>

              <FormField label="Giảng viên" required error={fieldErrors.lecturerName}>
                <input
                  className="form-control"
                  placeholder="VD: TS. Nguyễn Văn A"
                  value={form.lecturerName}
                  onChange={(e) => setForm((p) => ({ ...p, lecturerName: e.target.value }))}
                />
              </FormField>

              <div className="form-row">
                <FormField label="Học kỳ" required error={fieldErrors.semesterValue}>
                  <select
                    className="form-control"
                    value={form.semesterValue}
                    onChange={(e) => setForm((p) => ({ ...p, semesterValue: e.target.value }))}
                  >
                    <option value="">Chọn học kỳ</option>
                    {SEMESTER_REVIEW_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.value}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Điểm số (tùy chọn)">
                  <select
                    className="form-control"
                    value={form.grade}
                    onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))}
                  >
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g.value || "none"} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Minh chứng (tùy chọn)">
                <div
                  className="syllabus-dropzone"
                  onClick={() => document.getElementById("proof-upload")?.click()}
                  role="button"
                  tabIndex={0}
                >
                  <p className="syllabus-dropzone-title">Tải lên bảng điểm hoặc xác nhận đã học</p>
                  <p className="syllabus-dropzone-hint">PNG, JPG, PDF (tối đa 5MB)</p>
                  <input
                    id="proof-upload"
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    multiple
                    hidden
                    onChange={handleProofSelect}
                  />
                </div>
                {proofFiles.length > 0 && (
                  <ul className="syllabus-file-list">
                    {proofFiles.map((f) => (
                      <li key={f.name}>{f.name}</li>
                    ))}
                  </ul>
                )}
              </FormField>
            </div>
          )}

          {step === 2 && (
            <div className="review-step-content">
              <h3 className="review-step-heading">Đánh giá chung</h3>
              <RatingSlider
                label="Đánh giá tổng thể"
                value={form.ratings.overall}
                onChange={(v) => updateRating("overall", v)}
              />
              <RatingSlider
                label="Độ khó"
                value={form.ratings.difficulty}
                onChange={(v) => updateRating("difficulty", v)}
              />
              <RatingSlider
                label="Khối lượng công việc"
                value={form.ratings.workload}
                onChange={(v) => updateRating("workload", v)}
              />
              <RatingSlider
                label="Chất lượng giảng dạy"
                value={form.ratings.teachingQuality}
                onChange={(v) => updateRating("teachingQuality", v)}
              />

              <h3 className="review-step-heading">Nội dung chi tiết</h3>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.hasMandatoryAttendance}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, hasMandatoryAttendance: e.target.checked }))
                  }
                />
                <span>Môn này có điểm danh bắt buộc</span>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="review-step-content">
              <h3 className="review-step-heading">Chia sẻ chi tiết</h3>
              {DETAIL_FIELDS.map((field) => (
                <FormField key={field.key} label={field.label}>
                  <textarea
                    className="form-control form-textarea"
                    rows={3}
                    placeholder={field.placeholder}
                    value={form.details[field.key]}
                    onChange={(e) => updateDetail(field.key, e.target.value)}
                  />
                </FormField>
              ))}
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.wouldTakeAgain}
                  onChange={(e) => setForm((p) => ({ ...p, wouldTakeAgain: e.target.checked }))}
                />
                <span>Tôi sẽ học lại môn này nếu có cơ hội</span>
              </label>
            </div>
          )}

          {step === 4 && (
            <div className="review-step-content">
              <h3 className="review-step-heading">Tài liệu học tập (tùy chọn)</h3>
              <p className="muted">
                Chia sẻ các tài liệu hữu ích để giúp sinh viên khác học tập hiệu quả hơn
              </p>

              {form.materials.length > 0 && (
                <div className="material-saved-list">
                  {form.materials.map((m, index) => (
                    <div key={index} className="material-draft-item">
                      <div>
                        <strong>{m.title}</strong>
                        <span className="muted material-saved-meta">
                          {getMaterialTypeLabel(m.materialType)}
                          {m.authorOrPublisher ? ` • ${m.authorOrPublisher}` : ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            materials: p.materials.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showMaterialForm ? (
                <MaterialForm
                  material={draftMaterial}
                  errors={materialErrors}
                  onChange={setDraftMaterial}
                  onSave={addMaterial}
                  onCancel={() => {
                    setShowMaterialForm(false);
                    setMaterialErrors({});
                  }}
                />
              ) : (
                <button type="button" className="add-material-zone" onClick={openMaterialForm}>
                  + Thêm tài liệu
                </button>
              )}
            </div>
          )}

          {error && <p className="auth-form-error">{error}</p>}

          <div className="add-course-actions">
            {step > 1 ? (
              <button type="button" className="btn btn-secondary" onClick={goBack}>
                Quay lại
              </button>
            ) : (
              <Link to={`/courses/${courseId}`} className="btn btn-secondary">
                Hủy
              </Link>
            )}
            {step < 4 ? (
              <button type="button" className="btn btn-primary" onClick={goNext}>
                Tiếp theo
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi Review"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
