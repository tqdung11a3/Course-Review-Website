/** Lỗi có thể do Render free tier đang sleep / cold start */
export function isRetryableApiError(error) {
  if (!error) return false;
  if (error.code === "ECONNABORTED") return true;
  if (error.message?.toLowerCase().includes("timeout")) return true;
  if (!error.response) return true;
  const status = error.response.status;
  return status === 502 || status === 503 || status === 504;
}

export function getApiErrorMessage(error, fallback = "Không thể kết nối máy chủ") {
  if (isRetryableApiError(error)) {
    return "Máy chủ đang khởi động hoặc mạng chậm. Vui lòng bấm «Thử lại» hoặc đợi vài giây rồi tải lại trang.";
  }
  return error?.response?.data?.message || fallback;
}

/**
 * @param {() => Promise<T>} fn
 * @param {{ maxAttempts?: number, delaysMs?: number[], onRetry?: (attempt: number) => void }} options
 */
export async function withApiRetry(fn, options = {}) {
  const { maxAttempts = 4, delaysMs = [0, 3000, 6000, 10000], onRetry } = options;
  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      onRetry?.(attempt, maxAttempts);
      const delay = delaysMs[attempt] ?? delaysMs[delaysMs.length - 1] ?? 5000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryableApiError(error) || attempt === maxAttempts - 1) {
        throw error;
      }
    }
  }

  throw lastError;
}
