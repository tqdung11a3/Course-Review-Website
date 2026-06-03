import {
  ASSESSMENT_OPTIONS,
  COURSE_TYPE_OPTIONS,
  LEARNING_MODE_OPTIONS,
  TEACHING_LANGUAGE_OPTIONS,
} from "./courseFormConstants";

function labelToOptionValue(options, stored) {
  if (!stored) return "";
  const found = options.find((o) => o.label === stored || o.value === stored);
  return found?.value || stored;
}

function labelsToValues(options, storedLabels = []) {
  return storedLabels.map((label) => {
    const found = options.find((o) => o.label === label || o.value === label);
    return found?.value || label;
  });
}

export function mapCourseToForm(course) {
  if (!course) return null;
  return {
    courseCode: course.courseCode || "",
    courseName: course.courseName || "",
    credits: course.credits != null ? String(course.credits) : "",
    faculty: course.faculty || "",
    tags: course.tags || [],
    courseType: labelToOptionValue(COURSE_TYPE_OPTIONS, course.courseType),
    offeredSemesters: course.offeredSemesters || [],
    teachingLanguage: labelToOptionValue(TEACHING_LANGUAGE_OPTIONS, course.teachingLanguage),
    learningMode: labelToOptionValue(LEARNING_MODE_OPTIONS, course.learningMode),
    description: course.description || "",
    prerequisiteCourseIds: (course.prerequisiteCourseIds || []).map((p) =>
      typeof p === "object" ? String(p._id) : String(p)
    ),
    assessmentMethods: labelsToValues(ASSESSMENT_OPTIONS, course.assessmentMethods),
  };
}

export function buildCoursePayload(form, syllabusFiles = []) {
  const courseTypeLabel =
    COURSE_TYPE_OPTIONS.find((o) => o.value === form.courseType)?.label || form.courseType;

  return {
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
      LEARNING_MODE_OPTIONS.find((o) => o.value === form.learningMode)?.label || form.learningMode,
    description: form.description.trim(),
    prerequisiteCourseIds: form.prerequisiteCourseIds,
    assessmentMethods: form.assessmentMethods.map(
      (v) => ASSESSMENT_OPTIONS.find((o) => o.value === v)?.label || v
    ),
    syllabusFiles,
  };
}
