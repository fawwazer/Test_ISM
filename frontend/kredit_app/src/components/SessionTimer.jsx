import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { logout } from "../store/slices/authSlice";

export default function SessionTimer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  const [timeLeft, setTimeLeft] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  // Session duration: 2 hours (same as backend)
  const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate("/login");
    window.swal.fire({
      icon: "warning",
      title: "Session Expired",
      text: "Your session has expired. Please login again.",
      confirmButtonColor: "#0d6efd",
    });
  }, [dispatch, navigate]);

  const extendSession = useCallback(() => {
    localStorage.setItem("sessionStart", Date.now().toString());
    setShowWarning(false);
    window.swal.fire({
      icon: "success",
      title: "Session Extended",
      text: "Your session has been extended for another 2 hours.",
      timer: 2000,
      showConfirmButton: false,
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    // Set session start time if not exists
    let sessionStart = localStorage.getItem("sessionStart");
    if (!sessionStart) {
      sessionStart = Date.now().toString();
      localStorage.setItem("sessionStart", sessionStart);
    }

    const timer = setInterval(() => {
      const elapsed = Date.now() - parseInt(sessionStart);
      const remaining = SESSION_DURATION - elapsed;

      if (remaining <= 0) {
        // Session expired
        clearInterval(timer);
        handleLogout();
      } else {
        setTimeLeft(remaining);

        // Show warning 5 minutes before expiry
        if (remaining <= WARNING_TIME && !showWarning) {
          setShowWarning(true);
          window.swal
            .fire({
              icon: "warning",
              title: "Session Expiring Soon",
              html: `Your session will expire in <strong>5 minutes</strong>.<br>Do you want to extend your session?`,
              showCancelButton: true,
              confirmButtonColor: "#0d6efd",
              cancelButtonColor: "#dc3545",
              confirmButtonText: "Extend Session",
              cancelButtonText: "Logout Now",
            })
            .then((result) => {
              if (result.isConfirmed) {
                extendSession();
              } else if (result.dismiss === window.Swal.DismissReason.cancel) {
                handleLogout();
              }
            });
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(timer);
  }, [
    isAuthenticated,
    token,
    showWarning,
    handleLogout,
    extendSession,
    SESSION_DURATION,
    WARNING_TIME,
  ]);

  // Format time left for display
  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Only show timer badge if authenticated
  if (!isAuthenticated || timeLeft === null) {
    return null;
  }

  return (
    <div className="position-fixed bottom-0 end-0 m-3" style={{ zIndex: 1050 }}>
      <div
        className={`badge ${
          timeLeft <= WARNING_TIME ? "bg-danger" : "bg-secondary"
        } bg-opacity-75 p-2`}
        style={{ fontSize: "0.75rem" }}
      >
        <i className="bi bi-clock me-1"></i>
        Session: {formatTime(timeLeft)}
      </div>
    </div>
  );
}
