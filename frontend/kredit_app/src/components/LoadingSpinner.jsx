export default function LoadingSpinner({
  fullScreen = true,
  message = "Loading...",
}) {
  if (fullScreen) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{message}</span>
          </div>
          {message !== "Loading..." && (
            <p className="mt-3 text-muted">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{message}</span>
      </div>
    </div>
  );
}
