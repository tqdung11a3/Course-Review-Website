const SEMESTER_SHORT = {
  "Học kỳ 1": "HK1",
  "Học kỳ 2": "HK2",
  "Học kỳ hè": "HKH",
};

const MATERIAL_TYPE_LABELS = {
  textbook: "Sách",
  reference_book: "Sách tham khảo",
  lecture_slide: "Slide",
  website: "Website",
  video: "Video",
  note: "Ghi chú",
  past_exam: "Đề thi cũ",
  other: "Khác",
};

const SOURCE_LABELS = {
  internet: "Internet",
  lecturer: "Giảng viên cung cấp",
  library: "Thư viện",
  self_made: "Tự làm",
  senior: "Anh/chị khóa trên",
  other: "Khác",
};

export function formatReviewSemester(semester, academicYear) {
  const short = SEMESTER_SHORT[semester] || semester;
  return academicYear ? `${short} ${academicYear}` : short;
}

export function formatReviewDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

export function getMaterialTypeLabel(type) {
  return MATERIAL_TYPE_LABELS[type] || type;
}

export function getSourceLabel(source) {
  return SOURCE_LABELS[source] || source;
}

export function isHighlyRecommended(level) {
  return level === "highly_recommended" || level === "recommended";
}

export function getUserInitial(user) {
  const name = user?.fullName || "U";
  return name.charAt(0).toUpperCase();
}

export const REVIEW_DETAIL_SECTIONS = [
  { key: "courseContent", label: "Nội dung học", icon: "📖" },
  { key: "assignmentWorkload", label: "Khối lượng bài tập", icon: "📝" },
  { key: "examFormat", label: "Hình thức kiểm tra", icon: "📋" },
  { key: "gradingMethod", label: "Cách chấm điểm", icon: "📊" },
  { key: "lecturerRequirements", label: "Yêu cầu của giảng viên", icon: "👨‍🏫" },
  { key: "effectiveStudyTips", label: "Kinh nghiệm học hiệu quả", icon: "💡" },
  { key: "commonDifficulties", label: "Khó khăn thường gặp", icon: "⚠️" },
];

const USAGE_PURPOSE_LABELS = {
  understand_lesson: "Học hiểu bài",
  assignment: "Bài tập",
  lab: "Lab",
  project: "Đồ án",
  midterm: "Ôn giữa kỳ",
  final_exam: "Ôn cuối kỳ",
  review_from_scratch: "Học lại từ đầu",
};

const SUITABLE_FOR_LABELS = {
  beginner: "Mất gốc",
  average_student: "Trung bình",
  pass_course: "Muốn qua môn",
  high_grade: "Muốn điểm cao",
  deep_understanding: "Muốn hiểu sâu",
  limited_time: "Ít thời gian",
};

const RECOMMENDATION_LABELS = {
  highly_recommended: "Khuyên dùng",
  recommended: "Nên dùng",
  situational: "Tùy trường hợp",
  not_recommended: "Không khuyên",
};

export function getUsagePurposeLabel(value) {
  return USAGE_PURPOSE_LABELS[value] || value;
}

export function getSuitableForLabel(value) {
  return SUITABLE_FOR_LABELS[value] || value;
}

export function getRecommendationLabel(level) {
  return RECOMMENDATION_LABELS[level] || level;
}

export function formatMaterialRating(value) {
  if (value == null) return null;
  return `${value}/5`;
}
