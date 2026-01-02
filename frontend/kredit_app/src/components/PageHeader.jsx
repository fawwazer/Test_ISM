export default function PageHeader({
  title,
  onBack,
  backLabel = "Back to Dashboard",
}) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h4 className="mb-0">{title}</h4>
        {onBack && (
          <button onClick={onBack} className="btn btn-secondary btn-sm">
            {backLabel}
          </button>
        )}
      </div>
    </div>
  );
}
