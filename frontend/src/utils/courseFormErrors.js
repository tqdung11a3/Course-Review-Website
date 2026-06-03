export const DUPLICATE_COURSE_CODE_MESSAGE =
  "Mã môn học này đã tồn tại. Vui lòng nhập mã khác.";

/** Map API lỗi trùng mã môn → lỗi trên ô Mã môn học */
export function applyCourseSubmitError(err, setFieldErrors, setError, fallbackMessage) {
  const message = err?.response?.data?.message || "";
  const status = err?.response?.status;

  if (
    status === 409 &&
    (message.includes("Mã môn học") || message === DUPLICATE_COURSE_CODE_MESSAGE)
  ) {
    setFieldErrors({ courseCode: message || DUPLICATE_COURSE_CODE_MESSAGE });
    setError("");
    return true;
  }

  setError(message || fallbackMessage);
  return false;
}
