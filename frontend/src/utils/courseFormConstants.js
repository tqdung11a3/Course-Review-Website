export const CREDIT_OPTIONS = [1, 2, 3, 4, 5];

export const FACULTY_OPTIONS = [
  "Công nghệ thông tin",
  "Điện tử viễn thông",
  "Cơ khí",
  "Cơ điện tử",
  "Vật lý kỹ thuật",
  "Hóa học",
  "Toán ứng dụng",
];

export const COURSE_TYPE_OPTIONS = [
  { value: "required", label: "Bắt buộc" },
  { value: "elective", label: "Tự chọn" },
  { value: "basic", label: "Cơ bản" },
  { value: "advanced", label: "Nâng cao" },
];

export const SEMESTER_OPTIONS = [
  { value: "Học kỳ 1", label: "Học kỳ 1" },
  { value: "Học kỳ 2", label: "Học kỳ 2" },
  { value: "Học kỳ hè", label: "Học kỳ hè" },
];

export const TEACHING_LANGUAGE_OPTIONS = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "Tiếng Anh" },
  { value: "bilingual", label: "Song ngữ" },
];

export const LEARNING_MODE_OPTIONS = [
  { value: "in_person", label: "Trực tiếp" },
  { value: "online", label: "Trực tuyến" },
  { value: "hybrid", label: "Kết hợp" },
];

export const ASSESSMENT_OPTIONS = [
  { value: "assignments", label: "Bài tập" },
  { value: "midterm", label: "Bài kiểm tra giữa kỳ" },
  { value: "final_exam", label: "Thi cuối kỳ" },
  { value: "project", label: "Đồ án" },
  { value: "presentation", label: "Thuyết trình" },
  { value: "attendance", label: "Điểm danh" },
];

export const EMPTY_COURSE_FORM = {
  courseCode: "",
  courseName: "",
  credits: "",
  faculty: "",
  tags: [],
  courseType: "",
  offeredSemesters: [],
  teachingLanguage: "",
  learningMode: "",
  description: "",
  prerequisiteCourseIds: [],
  assessmentMethods: [],
};
