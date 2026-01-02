import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Report() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");

  const fetchReport = useCallback(async () => {
    try {
      const response = await api.get(`/applications/${id}/report`);
      setReportData(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const getRiskBadgeClass = (riskCategory) => {
    if (riskCategory === "LOW RISK") return "bg-success";
    if (riskCategory === "MEDIUM RISK") return "bg-warning text-dark";
    return "bg-danger";
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light py-4">
      <div className="container">
        <PageHeader
          title="Application Report"
          onBack={() => navigate("/users")}
        />

        {/* Summary Card */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Summary</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>Application Number:</strong>{" "}
                  <code>{reportData.applicationNumber}</code>
                </p>
                <p className="mb-2">
                  <strong>Applicant Name:</strong> {reportData.applicantName}
                </p>
                <p className="mb-2">
                  <strong>Created At:</strong>{" "}
                  {new Date(reportData.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="col-md-6 text-md-end">
                <h2 className="display-4 fw-bold text-primary mb-2">
                  {parseFloat(reportData.totalScore).toFixed(2)}
                </h2>
                <h5>
                  <span
                    className={`badge ${getRiskBadgeClass(
                      reportData.riskCategory
                    )} fs-6`}
                  >
                    {reportData.riskCategory}
                  </span>
                </h5>
              </div>
            </div>
          </div>
        </div>

        {/* User Information Card */}
        {reportData.userData && (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Applicant Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted small">
                      Full Name
                    </label>
                    <p className="mb-0">{reportData.userData.nama}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted small">
                      Email
                    </label>
                    <p className="mb-0">{reportData.userData.email}</p>
                  </div>
                  {reportData.userData.jenisKelamin && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted small">
                        Gender
                      </label>
                      <p className="mb-0">
                        {reportData.userData.jenisKelamin === "L"
                          ? "Laki-laki"
                          : "Perempuan"}
                      </p>
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  {reportData.userData.tempatLahir && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted small">
                        Place of Birth
                      </label>
                      <p className="mb-0">{reportData.userData.tempatLahir}</p>
                    </div>
                  )}
                  {reportData.userData.tanggalLahir && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted small">
                        Date of Birth
                      </label>
                      <p className="mb-0">{reportData.userData.tanggalLahir}</p>
                    </div>
                  )}
                  {reportData.userData.kodePos && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted small">
                        Postal Code
                      </label>
                      <p className="mb-0">{reportData.userData.kodePos}</p>
                    </div>
                  )}
                </div>
                {reportData.userData.alamat && (
                  <div className="col-12">
                    <div className="mb-0">
                      <label className="form-label fw-semibold text-muted small">
                        Address
                      </label>
                      <p className="mb-0">{reportData.userData.alamat}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Risk Category Info */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h6 className="fw-bold mb-3">Risk Category Legend:</h6>
            <div className="d-flex gap-3 flex-wrap">
              <div>
                <span className="badge bg-danger me-2">HIGH RISK</span>
                <small className="text-muted">&lt; 55</small>
              </div>
              <div>
                <span className="badge bg-warning text-dark me-2">
                  MEDIUM RISK
                </span>
                <small className="text-muted">55 - 69</small>
              </div>
              <div>
                <span className="badge bg-success me-2">LOW RISK</span>
                <small className="text-muted">≥ 70</small>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Scoring by Category */}
        {reportData.report.map((category) => (
          <div key={category.categoryId} className="card shadow-sm mb-4">
            <div className="card-header bg-info text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{category.categoryName}</h5>
                <div>
                  <span className="badge bg-white text-dark me-2">
                    Weight: {category.categoryWeight}%
                  </span>
                  <span className="badge bg-success">
                    Final Score: {parseFloat(category.finalScore).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Criteria</th>
                      <th scope="col" className="text-center">
                        Weight (D)
                      </th>
                      <th scope="col">Selected Option</th>
                      <th scope="col" className="text-center">
                        Score (F)
                      </th>
                      <th scope="col" className="text-end">
                        F × D / 100
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="fw-semibold">{item.criteriaName}</td>
                        <td className="text-center">
                          <span className="badge bg-secondary">
                            {item.criteriaWeight}%
                          </span>
                        </td>
                        <td>{item.selectedOption}</td>
                        <td className="text-center">
                          <span className="badge bg-primary">{item.score}</span>
                        </td>
                        <td className="text-end fw-bold">
                          {parseFloat(item.weightedScore).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="table-secondary">
                      <td colSpan="4" className="text-end fw-bold">
                        Total Weighted Score (Σ F×D/100):
                      </td>
                      <td className="text-end fw-bold">
                        {parseFloat(category.totalWeightedScore).toFixed(2)}
                      </td>
                    </tr>
                    <tr className="table-info">
                      <td colSpan="4" className="text-end fw-bold">
                        Final Score (Σ F×D/100 × B/100):
                      </td>
                      <td className="text-end fw-bold fs-5 text-success">
                        {parseFloat(category.finalScore).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}

        {/* Total Score Card */}
        <div className="card shadow-sm border-primary">
          <div className="card-body bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">Total Application Score</h5>
                <p className="text-muted mb-0 small">
                  Sum of all category final scores
                </p>
              </div>
              <div className="text-end">
                <h2 className="display-3 fw-bold text-primary mb-0">
                  {parseFloat(reportData.totalScore).toFixed(2)}
                </h2>
                <h5 className="mt-2">
                  <span
                    className={`badge ${getRiskBadgeClass(
                      reportData.riskCategory
                    )} fs-5`}
                  >
                    {reportData.riskCategory}
                  </span>
                </h5>
              </div>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="text-center mt-4 mb-4">
          <button
            onClick={() => window.print()}
            className="btn btn-outline-primary me-2"
          >
            <i className="bi bi-printer"></i> Print Report
          </button>
          <button
            onClick={() => navigate("/users")}
            className="btn btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
