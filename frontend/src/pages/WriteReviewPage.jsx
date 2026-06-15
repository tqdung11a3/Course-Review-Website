import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createCourseProof } from "../api/courseProofs";
import { getCourseById } from "../api/courses";
import { deleteLearningMaterial, updateLearningMaterial } from "../api/materials";
import { createReview, createReviewMaterial, getReviewById, updateReview } from "../api/reviews";
import { uploadFiles } from "../api/uploads";
import { FormField } from "../components/courses/form/FormField";
import { ReviewMaterialCard } from "../components/courses/ReviewMaterialCard";
import { MaterialForm } from "../components/reviews/MaterialForm";
import { ReviewStepper } from "../components/reviews/ReviewStepper";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { DashboardHeader } from "../components/layout/DashboardHeader";
import {
  EMPTY_REVIEW_FORM,
  GRADE_OPTIONS,
  REVIEW_STEPS,
  buildMaterialPayload,
  createEmptyMaterial,
  materialToDraft,
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

export default function WriteReviewPage({ isEdit: isEditProp = false }) {
  const { id: courseIdParam, reviewId: reviewIdParam } = useParams();
  const isEdit = isEditProp || Boolean(reviewIdParam);
  const reviewId = reviewIdParam;
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState(courseIdParam || "");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_REVIEW_FORM);
  const [proofFiles, setProofFiles] = useState([]);
  const [existingEvidence, setExistingEvidence] = useState([]);
  const [savedMaterials, setSavedMaterials] = useState([]);
  const [isLoadingReview, setIsLoadingReview] = useState(isEdit);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [editingNewIndex, setEditingNewIndex] = useState(null);
  const [draftMaterial, setDraftMaterial] = useState(createEmptyMaterial);
  const [materialErrors, setMaterialErrors] = useState({});
  const [isSavingMaterial, setIsSavingMaterial] = useState(false);
  const [courseName, setCourseName] = useState("");

  useEffect(() => {
    if (!isEdit && courseIdParam) {
      setCourseId(courseIdParam);
    }
  }, [courseIdParam, isEdit]);

  useEffect(() => {
    if (!courseId) return;
    getCourseById(courseId)
      .then((res) => setCourseName(res?.data?.course?.courseName || ""))
      .catch(() => {});
  }, [courseId]);

  useEffect(() => {
    if (!isEdit || !reviewId) return;
    async function loadReview() {
      setIsLoadingReview(true);
      setError("");
      try {
        const res = await getReviewById(reviewId);
        const review = res?.data?.review;
        if (!review) throw new Error("Không tìm thấy review");

        const cid = review.courseId?._id || review.courseId;
        setCourseId(String(cid));
        setCourseName(review.courseName || review.courseId?.courseName || "");
        setExistingEvidence(review.evidenceFiles || []);
        setSavedMaterials(review.materials || []);
        setForm({
          lecturerName: review.lecturerName || "",
          semester: review.semester || "",
          academicYear: review.academicYear || "",
          grade: review.grade || "",
          proofFiles: [],
          ratings: { ...EMPTY_REVIEW_FORM.ratings, ...review.ratings },
          hasMandatoryAttendance: Boolean(review.hasMandatoryAttendance),
          wouldTakeAgain: Boolean(review.wouldTakeAgain),
          isAnonymous: Boolean(review.isAnonymous),
          details: { ...EMPTY_REVIEW_FORM.details, ...(review.details || {}) },
          materials: [],
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Không thể tải review");
      } finally {
        setIsLoadingReview(false);
      }
    }
    loadReview();
  }, [isEdit, reviewId]);

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
      if (!form.semester.trim()) errors.semester = "Vui lòng nhập học kỳ";
      if (!form.academicYear.trim()) errors.academicYear = "Vui lòng nhập năm học";
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

  function closeMaterialForm() {
    setShowMaterialForm(false);
    setEditingMaterialId(null);
    setEditingNewIndex(null);
    setDraftMaterial(createEmptyMaterial());
    setMaterialErrors({});
  }

  function openMaterialForm() {
    setEditingMaterialId(null);
    setEditingNewIndex(null);
    setDraftMaterial(createEmptyMaterial());
    setMaterialErrors({});
    setShowMaterialForm(true);
  }

  function openEditSavedMaterial(material) {
    setEditingMaterialId(material._id);
    setEditingNewIndex(null);
    setDraftMaterial(materialToDraft(material));
    setMaterialErrors({});
    setShowMaterialForm(true);
  }

  function openEditNewMaterial(index) {
    setEditingMaterialId(null);
    setEditingNewIndex(index);
    setDraftMaterial(materialToDraft(form.materials[index]));
    setMaterialErrors({});
    setShowMaterialForm(true);
  }

  async function uploadDraftAttachments() {
    let attachmentFiles = [...(draftMaterial.attachmentFiles || [])];
    if (draftMaterial.localFiles?.length > 0) {
      const uploadRes = await uploadFiles(draftMaterial.localFiles);
      attachmentFiles = [...attachmentFiles, ...(uploadRes?.data?.files || [])];
    }
    return attachmentFiles;
  }

  async function saveMaterial() {
    const errors = validateMaterialDraft(draftMaterial);
    if (Object.keys(errors).length > 0) {
      setMaterialErrors(errors);
      return;
    }

    setIsSavingMaterial(true);
    setError("");
    try {
      let attachmentFiles;
      try {
        attachmentFiles = await uploadDraftAttachments();
      } catch {
        setError("Không thể tải file tài liệu lên");
        return;
      }
      const draftWithFiles = { ...draftMaterial, attachmentFiles, localFiles: [] };
      const payload = buildMaterialPayload(draftWithFiles);

      if (editingMaterialId) {
        const res = await updateLearningMaterial(editingMaterialId, payload);
        const updated = res?.data?.material;
        if (updated) {
          setSavedMaterials((prev) =>
            prev.map((m) => (m._id === editingMaterialId ? updated : m))
          );
        }
        closeMaterialForm();
        return;
      }

      if (editingNewIndex !== null) {
        setForm((prev) => ({
          ...prev,
          materials: prev.materials.map((m, i) =>
            i === editingNewIndex ? draftWithFiles : m
          ),
        }));
        closeMaterialForm();
        return;
      }

      setForm((prev) => ({
        ...prev,
        materials: [...prev.materials, draftWithFiles],
      }));
      closeMaterialForm();
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể lưu tài liệu");
    } finally {
      setIsSavingMaterial(false);
    }
  }

  async function handleDeleteSavedMaterial(materialId) {
    if (!window.confirm("Xóa tài liệu này? Hành động không thể hoàn tác.")) return;
    setError("");
    try {
      await deleteLearningMaterial(materialId);
      setSavedMaterials((prev) => prev.filter((m) => m._id !== materialId));
      if (editingMaterialId === materialId) closeMaterialForm();
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể xóa tài liệu");
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError("");
    try {
      const semester = form.semester.trim();
      const academicYear = form.academicYear.trim();

      let evidenceFiles = [...existingEvidence];
      if (proofFiles.length > 0) {
        const uploadRes = await uploadFiles(proofFiles);
        evidenceFiles = [...evidenceFiles, ...(uploadRes?.data?.files || [])];
      }

      const ratingsPayload = {
        overall: form.ratings.overall,
        difficulty: form.ratings.difficulty,
        workload: form.ratings.workload,
        usefulness: form.ratings.usefulness,
        gradingFairness: form.ratings.gradingFairness,
        teachingQuality: form.ratings.teachingQuality,
      };

      if (isEdit && reviewId) {
        await updateReview(reviewId, {
          lecturerName: form.lecturerName.trim(),
          semester,
          academicYear,
          grade: form.grade,
          hasMandatoryAttendance: form.hasMandatoryAttendance,
          wouldTakeAgain: form.wouldTakeAgain,
          isAnonymous: form.isAnonymous,
          ratings: ratingsPayload,
          details: form.details,
          evidenceFiles,
        });

        if (form.materials.length) {
          await Promise.all(
            form.materials.map((m) => createReviewMaterial(reviewId, buildMaterialPayload(m)))
          );
        }

        navigate("/profile", {
          replace: true,
          state: {
            flash:
              "Review đã được cập nhật. Nếu trước đó bị từ chối, review sẽ chuyển về trạng thái chờ duyệt.",
          },
        });
        return;
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
        isAnonymous: form.isAnonymous,
        ratings: ratingsPayload,
        details: form.details,
        evidenceFiles,
      });

      const newReviewId = reviewRes?.data?.review?._id;
      if (newReviewId && form.materials.length) {
        await Promise.all(
          form.materials.map((m) => createReviewMaterial(newReviewId, buildMaterialPayload(m)))
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

  if (isLoadingReview) {
    return (
      <div className="dashboard-page">
        <DashboardHeader />
        <div className="dashboard-content">
          <LoadingSpinner label="Đang tải review..." />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <DashboardHeader />
      <div className="dashboard-content dashboard-content--form">
        <div className="write-review-card">
          <Link to={courseId ? `/courses/${courseId}` : "/profile"} className="back-link">
            ← {isEdit ? "Quay lại" : "Quay lại môn học"}
          </Link>
          <h1>{isEdit ? "Sửa Review" : "Viết Review Môn học"}</h1>
          <p className="muted">
            {isEdit
              ? "Cập nhật nội dung review của bạn"
              : "Review của bạn sẽ giúp sinh viên khác đưa ra quyết định tốt hơn"}
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
                <FormField label="Học kỳ" required error={fieldErrors.semester}>
                  <input
                    className="form-control"
                    placeholder="VD: Học kỳ 2 hoặc HK2"
                    value={form.semester}
                    onChange={(e) => setForm((p) => ({ ...p, semester: e.target.value }))}
                  />
                </FormField>

                <FormField label="Năm học" required error={fieldErrors.academicYear}>
                  <input
                    className="form-control"
                    placeholder="VD: 2024-2025"
                    value={form.academicYear}
                    onChange={(e) => setForm((p) => ({ ...p, academicYear: e.target.value }))}
                  />
                </FormField>
              </div>

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

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.isAnonymous}
                  onChange={(e) => setForm((p) => ({ ...p, isAnonymous: e.target.checked }))}
                />
                <span>Đăng review ẩn danh</span>
              </label>

              <FormField label="Minh chứng (tùy chọn)">
                {existingEvidence.length > 0 && (
                  <ul className="syllabus-existing-list">
                    {existingEvidence.map((f, index) => (
                      <li key={f.fileUrl || index} className="syllabus-existing-item">
                        <a href={f.fileUrl} target="_blank" rel="noreferrer">
                          {f.fileName || "Minh chứng"}
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            setExistingEvidence((prev) => prev.filter((_, i) => i !== index))
                          }
                        >
                          Xóa
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div
                  className="syllabus-dropzone"
                  onClick={() => document.getElementById("proof-upload")?.click()}
                  role="button"
                  tabIndex={0}
                >
                  <p className="syllabus-dropzone-title">
                    {isEdit ? "Thêm file minh chứng mới" : "Tải lên bảng điểm hoặc xác nhận đã học"}
                  </p>
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
            </div>
          )}

          {step === 4 && (
            <div className="review-step-content">
              <h3 className="review-step-heading">Tài liệu học tập (tùy chọn)</h3>
              <p className="muted">
                Chia sẻ các tài liệu hữu ích để giúp sinh viên khác học tập hiệu quả hơn
              </p>

              {savedMaterials.length > 0 && (
                <div className="review-materials review-materials--edit">
                  <h4 className="review-subsection-title">
                    Tài liệu đã lưu ({savedMaterials.length})
                  </h4>
                  <p className="muted">
                    Bấm &quot;Sửa&quot; để chỉnh sửa (lưu ngay). Bấm tiêu đề để xem chi tiết.
                  </p>
                  {savedMaterials.map((m) => (
                    <div key={m._id} className="material-draft-wrap">
                      {editingMaterialId === m._id && showMaterialForm ? (
                        <MaterialForm
                          material={draftMaterial}
                          errors={materialErrors}
                          onChange={setDraftMaterial}
                          onSave={saveMaterial}
                          onCancel={closeMaterialForm}
                          formTitle="Sửa tài liệu"
                          saveLabel={isSavingMaterial ? "Đang lưu..." : "Lưu thay đổi tài liệu"}
                          saveDisabled={isSavingMaterial}
                        />
                      ) : (
                        <>
                          <div className="material-draft-toolbar">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEditSavedMaterial(m)}
                              disabled={showMaterialForm}
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDeleteSavedMaterial(m._id)}
                              disabled={showMaterialForm}
                            >
                              Xóa
                            </button>
                          </div>
                          <ReviewMaterialCard material={m} />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {form.materials.length > 0 && (
                <div className="review-materials review-materials--edit">
                  <h4 className="review-subsection-title">
                    Tài liệu mới ({form.materials.length})
                  </h4>
                  <p className="muted">Sẽ được tạo khi bạn bấm &quot;Lưu thay đổi&quot; ở cuối form.</p>
                  {form.materials.map((m, index) => (
                    <div key={index} className="material-draft-wrap">
                      {editingNewIndex === index && showMaterialForm && !editingMaterialId ? (
                        <MaterialForm
                          material={draftMaterial}
                          errors={materialErrors}
                          onChange={setDraftMaterial}
                          onSave={saveMaterial}
                          onCancel={closeMaterialForm}
                          formTitle="Sửa tài liệu mới"
                          saveLabel={isSavingMaterial ? "Đang lưu..." : "Cập nhật"}
                          saveDisabled={isSavingMaterial}
                        />
                      ) : (
                        <>
                          <div className="material-draft-toolbar">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEditNewMaterial(index)}
                              disabled={showMaterialForm}
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() =>
                                setForm((p) => ({
                                  ...p,
                                  materials: p.materials.filter((_, i) => i !== index),
                                }))
                              }
                              disabled={showMaterialForm}
                            >
                              Xóa
                            </button>
                          </div>
                          <ReviewMaterialCard material={m} />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {showMaterialForm && editingMaterialId === null && editingNewIndex === null ? (
                <MaterialForm
                  material={draftMaterial}
                  errors={materialErrors}
                  onChange={setDraftMaterial}
                  onSave={saveMaterial}
                  onCancel={closeMaterialForm}
                  saveLabel={isSavingMaterial ? "Đang lưu..." : "Lưu tài liệu"}
                  saveDisabled={isSavingMaterial}
                />
              ) : (
                !showMaterialForm && (
                  <button type="button" className="add-material-zone" onClick={openMaterialForm}>
                    + Thêm tài liệu
                  </button>
                )
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
              <Link
                to={isEdit ? "/profile" : `/courses/${courseId}`}
                className="btn btn-secondary"
              >
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
                {isSubmitting
                  ? isEdit
                    ? "Đang lưu..."
                    : "Đang gửi..."
                  : isEdit
                    ? "Lưu thay đổi"
                    : "Gửi Review"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
