export function ApiErrorState({ message, onRetry, retryLabel = "Thử lại" }) {
  return (
    <div className="api-error-state">
      <p className="error">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-primary btn-sm" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}
