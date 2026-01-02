import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchScoringStructure,
  setScores,
  setScore,
} from "../store/slices/scoringSlice";
import {
  fetchApplicationById,
  updateApplication,
} from "../store/slices/applicationSlice";
import PageHeader from "../components/PageHeader";
import LoadingSpinner from "../components/LoadingSpinner";

export default function EditForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const {
    categories,
    scores,
    loading: scoringLoading,
  } = useSelector((state) => state.scoring);
  const { currentApplication, loading: appLoading } = useSelector(
    (state) => state.application
  );

  const loading = scoringLoading || appLoading;
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchScoringStructure()).unwrap();
        const appData = await dispatch(fetchApplicationById(id)).unwrap();

        // Pre-fill scores from existing application
        const existingScores = {};
        appData.scores.forEach((score) => {
          existingScores[score.criteriaId] = score.scoreOptionId;
        });
        dispatch(setScores(existingScores));
      } catch (err) {
        window.swal.fire({
          icon: "error",
          title: "Failed to Load",
          text: err || "Failed to load application data",
          confirmButtonColor: "#dc3545",
        });
        setError(err || "Failed to load application data");
      }
    };

    fetchData();
  }, [id, dispatch]);

  const handleScoreChange = useCallback(
    (criteriaId, scoreOptionId) => {
      dispatch(setScore({ criteriaId, scoreOptionId }));
    },
    [dispatch]
  );

  const totalSteps = categories.length;

  const handleNext = () => {
    // Validasi kategori saat ini
    const category = categories[currentStep];
    if (category) {
      const unfilledCriteria = category.criteria.filter(
        (criteria) => !scores[criteria.id]
      );
      if (unfilledCriteria.length > 0) {
        window.swal.fire({
          icon: "warning",
          title: "Incomplete Category",
          html: `Please complete all criteria in <strong>${category.name}</strong>.<br>${unfilledCriteria.length} criteria remaining.`,
          confirmButtonColor: "#ffc107",
        });
        return;
      }
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const criteriaCount = categories.reduce(
      (sum, cat) => sum + cat.criteria.length,
      0
    );

    // Validasi semua kriteria sudah diisi
    if (Object.keys(scores).length !== criteriaCount) {
      const filledCount = Object.keys(scores).length;
      window.swal.fire({
        icon: "warning",
        title: "Incomplete Assessment",
        html: `Please fill all criteria.<br><strong>${filledCount} of ${criteriaCount}</strong> criteria completed.`,
        confirmButtonColor: "#ffc107",
      });
      return;
    }

    // Cek apakah ada kriteria yang belum dipilih per kategori
    for (const category of categories) {
      const categoryName = category.name;
      const criteriaInCategory = category.criteria;
      const unfilledCriteria = criteriaInCategory.filter(
        (criteria) => !scores[criteria.id]
      );

      if (unfilledCriteria.length > 0) {
        window.swal.fire({
          icon: "warning",
          title: "Incomplete Category",
          html: `Please complete all criteria in <strong>${categoryName}</strong>.<br>${unfilledCriteria.length} criteria remaining.`,
          confirmButtonColor: "#ffc107",
        });
        return;
      }
    }

    const scoresArray = Object.entries(scores).map(
      ([criteriaId, scoreOptionId]) => ({
        criteriaId: parseInt(criteriaId),
        scoreOptionId: parseInt(scoreOptionId),
      })
    );

    const payload = {
      scores: scoresArray,
      applicantName: currentApplication.applicantName,
    };

    try {
      await dispatch(updateApplication({ id, payload })).unwrap();
      window.swal
        .fire({
          icon: "success",
          title: "Success!",
          text: "Application updated successfully!",
          confirmButtonColor: "#0d6efd",
        })
        .then(() => {
          navigate(`/report/${id}`);
        });
    } catch (err) {
      window.swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err,
        confirmButtonColor: "#dc3545",
      });
      setError(err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !currentApplication) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const renderStepContent = () => {
    const category = categories[currentStep];
    if (!category) return null;

    return (
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">
            {category.name} (Weight: {category.weight}%)
          </h5>
        </div>
        <div className="card-body">
          {category.criteria.map((criteria) => (
            <div key={criteria.id} className="mb-4 pb-3 border-bottom">
              <label className="form-label fw-semibold">
                {criteria.name} (Weight: {criteria.weight}%)
              </label>
              <div className="mt-2">
                {criteria.scoreOptions.map((option) => {
                  const isSelected = scores[criteria.id] === option.id;
                  return (
                    <div
                      key={option.id}
                      className={`form-check mb-2 p-3 rounded cursor-pointer ${
                        isSelected
                          ? "bg-success bg-opacity-25 border border-success border-2"
                          : "border border-light"
                      }`}
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                      onClick={() => handleScoreChange(criteria.id, option.id)}
                    >
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`criteria-${criteria.id}`}
                        id={`option-${option.id}`}
                        value={option.id}
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ display: "none" }}
                      />
                      <label
                        className="form-check-label w-100"
                        htmlFor={`option-${option.id}`}
                        style={{ cursor: "pointer" }}
                      >
                        <span className="badge bg-secondary me-2">
                          {option.score}
                        </span>
                        {option.description}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-vh-100 bg-light py-4">
      <div className="container">
        <PageHeader
          title={`Edit Application - ${currentApplication?.applicationNumber}`}
          onBack={() => navigate("/users")}
        />

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Applicant Info */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">Applicant Information</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>Name:</strong> {currentApplication?.applicantName}
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>Status:</strong>{" "}
                  <span className="badge bg-secondary">
                    {currentApplication?.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">
                Step {currentStep + 1} of {totalSteps}
              </h6>
              <span className="badge bg-primary">
                {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="progress" style={{ height: "8px" }}>
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{
                  width: `${((currentStep + 1) / totalSteps) * 100}%`,
                }}
              ></div>
            </div>
            <div className="d-flex justify-content-between mt-3 gap-2">
              {categories.map((cat, idx) => {
                const isActive = currentStep === idx;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCurrentStep(idx);
                      window.scrollTo(0, 0);
                    }}
                    className={`btn btn-sm flex-fill ${
                      isActive ? "btn-primary" : "btn-outline-secondary"
                    }`}
                    style={{ fontSize: "0.75rem" }}
                  >
                    {cat.name.replace("INFORMASI ", "Info ")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="btn btn-secondary btn-lg px-5"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Previous
              </button>

              {currentStep === totalSteps - 1 ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn btn-success btn-lg px-5"
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      Update Application
                      <i className="bi bi-check-circle ms-2"></i>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary btn-lg px-5"
                >
                  Next
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
