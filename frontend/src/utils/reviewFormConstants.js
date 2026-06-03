export const REVIEW_STEPS = [
  { id: 1, label: "Xác minh" },
  { id: 2, label: "Đánh giá" },
  { id: 3, label: "Chi tiết" },
  { id: 4, label: "Tài liệu" },
];

export const SEMESTER_REVIEW_OPTIONS = [
  { value: "HK1 2023-2024", semester: "Học kỳ 1", academicYear: "2023-2024" },
  { value: "HK2 2023-2024", semester: "Học kỳ 2", academicYear: "2023-2024" },
  { value: "HKH 2023-2024", semester: "Học kỳ hè", academicYear: "2023-2024" },
  { value: "HK1 2024-2025", semester: "Học kỳ 1", academicYear: "2024-2025" },
  { value: "HK2 2024-2025", semester: "Học kỳ 2", academicYear: "2024-2025" },
];

export const GRADE_OPTIONS = [
  { value: "", label: "Không muốn chia sẻ" },
  { value: "A+", label: "A+" },
  { value: "A", label: "A" },
  { value: "B+", label: "B+" },
  { value: "B", label: "B" },
  { value: "C+", label: "C+" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
];

export const MATERIAL_TYPE_OPTIONS = [
  { value: "textbook", label: "Sách giáo khoa" },
  { value: "reference_book", label: "Sách tham khảo" },
  { value: "lecture_slide", label: "Slide bài giảng" },
  { value: "past_exam", label: "Đề thi cũ" },
  { value: "video", label: "Video" },
  { value: "website", label: "Website" },
  { value: "note", label: "Ghi chú" },
  { value: "lab", label: "Tài liệu lab" },
  { value: "project", label: "Đồ án / Project" },
  { value: "other", label: "Khác" },
];

export const SOURCE_OPTIONS = [
  { value: "lecturer", label: "Giảng viên cung cấp" },
  { value: "library", label: "Thư viện" },
  { value: "internet", label: "Internet" },
  { value: "self_made", label: "Tự làm" },
  { value: "senior", label: "Anh/chị khóa trên" },
  { value: "other", label: "Khác" },
];

export const USAGE_PURPOSE_OPTIONS = [
  { value: "understand_lesson", label: "Học hiểu bài" },
  { value: "midterm", label: "Ôn giữa kỳ" },
  { value: "review_from_scratch", label: "Học lại từ đầu" },
  {
    value: "assignment_bundle",
    label: "Làm bài tập/lab/project",
    expandsTo: ["assignment", "lab", "project"],
  },
  { value: "final_exam", label: "Ôn cuối kỳ" },
];

export const SUITABLE_FOR_OPTIONS = [
  { value: "beginner", label: "Mất gốc" },
  { value: "high_grade", label: "Muốn điểm cao" },
  { value: "limited_time", label: "Ít thời gian" },
  { value: "pass_course", label: "Muốn qua môn" },
  { value: "deep_understanding", label: "Muốn hiểu sâu" },
];

export const RECOMMENDATION_OPTIONS = [
  { value: "highly_recommended", label: "Khuyên dùng", icon: "★" },
  { value: "recommended", label: "Nên dùng", icon: "◆" },
  { value: "situational", label: "Tùy trường hợp", icon: "◇" },
  { value: "not_recommended", label: "Không khuyên", icon: "✕" },
];

export function createEmptyMaterial() {
  return {
    title: "",
    materialType: "",
    source: "",
    authorOrPublisher: "",
    versionOrYear: "",
    linkUrl: "",
    localFiles: [],
    attachmentFiles: [],
    ratings: {
      usefulness: 3,
      readability: 3,
      courseRelevance: 3,
      necessity: 3,
    },
    usagePurposes: [],
    suitableFor: [],
    contentSummary: "",
    strengths: "",
    limitations: "",
    effectiveUsageGuide: "",
    recommendationLevel: "highly_recommended",
  };
}

export function expandUsagePurposes(selected) {
  const result = [];
  for (const v of selected) {
    const opt = USAGE_PURPOSE_OPTIONS.find((o) => o.value === v);
    if (opt?.expandsTo) result.push(...opt.expandsTo);
    else if (v && v !== "assignment_bundle") result.push(v);
  }
  return [...new Set(result)];
}

/** Map DB values back to checkbox values in the form */
export function collapseUsagePurposes(stored) {
  const bundleOpt = USAGE_PURPOSE_OPTIONS.find((o) => o.expandsTo);
  let list = [...(stored || [])];
  if (bundleOpt && bundleOpt.expandsTo.some((v) => list.includes(v))) {
    list = list.filter((v) => !bundleOpt.expandsTo.includes(v));
    if (!list.includes(bundleOpt.value)) list.push(bundleOpt.value);
  }
  const allowed = new Set(USAGE_PURPOSE_OPTIONS.map((o) => o.value));
  return list.filter((v) => allowed.has(v));
}

export function materialToDraft(material) {
  const ratings = material.ratings || {};
  return {
    title: material.title || "",
    materialType: material.materialType || "",
    source: material.source || "",
    authorOrPublisher: material.authorOrPublisher || "",
    versionOrYear: material.versionOrYear || "",
    linkUrl: material.linkUrl || "",
    localFiles: [],
    attachmentFiles: Array.isArray(material.attachmentFiles) ? [...material.attachmentFiles] : [],
    ratings: {
      usefulness: ratings.usefulness ?? 3,
      readability: ratings.readability ?? 3,
      courseRelevance: ratings.courseRelevance ?? 3,
      necessity: ratings.necessity ?? 3,
    },
    usagePurposes: collapseUsagePurposes(material.usagePurposes),
    suitableFor: [...(material.suitableFor || [])],
    contentSummary: material.contentSummary || "",
    strengths: material.strengths || "",
    limitations: material.limitations || "",
    effectiveUsageGuide: material.effectiveUsageGuide || "",
    recommendationLevel: material.recommendationLevel || "recommended",
  };
}

export function buildMaterialPayload(material) {
  return {
    title: material.title.trim(),
    materialType: material.materialType,
    source: material.source,
    linkUrl: material.linkUrl || "",
    authorOrPublisher: material.authorOrPublisher || "",
    versionOrYear: material.versionOrYear || "",
    attachmentFiles: material.attachmentFiles || [],
    ratings: material.ratings,
    usagePurposes: expandUsagePurposes(material.usagePurposes),
    suitableFor: material.suitableFor,
    contentSummary: material.contentSummary || "",
    strengths: material.strengths || "",
    limitations: material.limitations || "",
    effectiveUsageGuide: material.effectiveUsageGuide || "",
    recommendationLevel: material.recommendationLevel,
  };
}

export function validateMaterialDraft(material) {
  const errors = {};
  if (!material.title?.trim()) errors.title = "Vui lòng nhập tên tài liệu";
  if (!material.materialType) errors.materialType = "Vui lòng chọn loại tài liệu";
  if (!material.source) errors.source = "Vui lòng chọn nguồn tài liệu";
  return errors;
}

export function parseSemesterValue(value) {
  const found = SEMESTER_REVIEW_OPTIONS.find((o) => o.value === value);
  if (found) return { semester: found.semester, academicYear: found.academicYear };
  return { semester: value, academicYear: "" };
}

export const EMPTY_REVIEW_FORM = {
  lecturerName: "",
  semester: "",
  academicYear: "",
  grade: "",
  proofFiles: [],
  ratings: {
    overall: 3,
    difficulty: 3,
    workload: 3,
    teachingQuality: 3,
    usefulness: 3,
    gradingFairness: 3,
  },
  hasMandatoryAttendance: false,
  details: {
    courseContent: "",
    assignmentWorkload: "",
    examFormat: "",
    gradingMethod: "",
    lecturerRequirements: "",
    effectiveStudyTips: "",
    commonDifficulties: "",
  },
  wouldTakeAgain: false,
  materials: [],
};
