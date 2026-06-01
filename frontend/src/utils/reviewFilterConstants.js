export const REVIEW_SORT_OPTIONS = [
  { value: "-helpfulCount", label: "Hữu ích nhất" },
  { value: "-createdAt", label: "Mới nhất" },
  { value: "-overall", label: "Điểm tổng thể cao" },
];

export const OVERALL_FILTER_OPTIONS = [
  { value: "", label: "Tất cả điểm tổng thể" },
  { value: "5", label: "5/5" },
  { value: "4", label: "4/5" },
  { value: "3", label: "3/5" },
  { value: "2", label: "2/5" },
  { value: "1", label: "1/5" },
];

export const DIFFICULTY_FILTER_OPTIONS = [
  { value: "", label: "Tất cả độ khó" },
  { value: "5", label: "5/5 (rất khó)" },
  { value: "4", label: "4/5" },
  { value: "3", label: "3/5" },
  { value: "2", label: "2/5" },
  { value: "1", label: "1/5 (dễ)" },
];

/** @deprecated use OVERALL_FILTER_OPTIONS */
export const RATING_FILTER_OPTIONS = OVERALL_FILTER_OPTIONS;

export const EMPTY_REVIEW_FILTERS = {
  sort: "-helpfulCount",
  overall: "",
  difficulty: "",
  semester: "",
  academicYear: "",
  lecturerName: "",
};
