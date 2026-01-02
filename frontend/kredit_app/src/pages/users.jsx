import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  fetchApplications,
  deleteApplication,
} from "../store/slices/applicationSlice";
import { useState } from "react";
import Navbar from "../components/Navbar";
import DataTable from "../components/DataTable";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Users() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { users, applications, loading } = useSelector(
    (state) => state.application
  );
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (activeTab === "users") {
      dispatch(fetchUsers());
    } else {
      dispatch(fetchApplications());
    }
  }, [activeTab, dispatch]);

  const handleCreateApplication = (userId = null) => {
    if (userId) {
      navigate(`/form?userId=${userId}`);
    } else {
      navigate("/form");
    }
  };

  const handleViewReport = (applicationId) => {
    navigate(`/report/${applicationId}`);
  };

  const handleEditApplication = (applicationId) => {
    navigate(`/edit/${applicationId}`);
  };

  const handleDeleteApplication = async (id) => {
    const result = await window.swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await dispatch(deleteApplication(id)).unwrap();
      window.swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Application has been deleted successfully.",
        confirmButtonColor: "#0d6efd",
      });
    } catch (error) {
      window.swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error,
        confirmButtonColor: "#dc3545",
      });
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      {/* Tabs */}
      <div className="container-fluid py-4">
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`nav-link ${
                    activeTab === "users" ? "active" : ""
                  }`}
                >
                  Users
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={() => setActiveTab("applications")}
                  className={`nav-link ${
                    activeTab === "applications" ? "active" : ""
                  }`}
                >
                  Applications
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner fullScreen={false} />
        ) : (
          <>
            {activeTab === "users" && (
              <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Registered Users</h5>
                  <button
                    onClick={() => handleCreateApplication(null)}
                    className="btn btn-success"
                  >
                    <i className="bi bi-plus-lg"></i> Create Manual Application
                  </button>
                </div>
                <div className="card-body p-0">
                  <DataTable
                    columns={[
                      { header: "ID", field: "id" },
                      {
                        header: "Nama",
                        field: "nama",
                        cellClassName: "fw-semibold",
                      },
                      { header: "Email", field: "email" },
                      { header: "Tempat Lahir", field: "tempatLahir" },
                      { header: "Tanggal Lahir", field: "tanggalLahir" },
                      {
                        header: "Action",
                        render: (user) => (
                          <button
                            onClick={() => handleCreateApplication(user.id)}
                            className="btn btn-primary btn-sm"
                          >
                            Create Application
                          </button>
                        ),
                      },
                    ]}
                    data={users}
                    emptyMessage="No users found"
                  />
                </div>
              </div>
            )}

            {activeTab === "applications" && (
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">All Applications</h5>
                </div>
                <div className="card-body p-0">
                  <DataTable
                    columns={[
                      {
                        header: "App Number",
                        render: (app) => (
                          <code className="text-muted">
                            {app.applicationNumber}
                          </code>
                        ),
                      },
                      {
                        header: "Applicant",
                        field: "applicantName",
                        cellClassName: "fw-semibold",
                      },
                      {
                        header: "Status",
                        render: (app) => (
                          <span className="badge bg-info text-dark">
                            {app.status}
                          </span>
                        ),
                      },
                      {
                        header: "Total Score",
                        field: "totalScore",
                        cellClassName: "fw-bold",
                      },
                      {
                        header: "Risk Category",
                        render: (app) => (
                          <span
                            className={`badge ${
                              app.riskCategory === "LOW RISK"
                                ? "bg-success"
                                : app.riskCategory === "MEDIUM RISK"
                                ? "bg-warning text-dark"
                                : "bg-danger"
                            }`}
                          >
                            {app.riskCategory}
                          </span>
                        ),
                      },
                      {
                        header: "Created",
                        render: (app) =>
                          new Date(app.createdAt).toLocaleDateString(),
                      },
                      {
                        header: "Actions",
                        render: (app) => (
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              onClick={() => handleViewReport(app.id)}
                              className="btn btn-success"
                            >
                              View Report
                            </button>
                            <button
                              onClick={() => handleEditApplication(app.id)}
                              className="btn btn-warning"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteApplication(app.id)}
                              className="btn btn-danger"
                            >
                              Delete
                            </button>
                          </div>
                        ),
                      },
                    ]}
                    data={applications}
                    emptyMessage="No applications found"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
