import { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../store/slices/authSlice";

export default function Login() {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();

      if (result.user.role === "user") {
        navigate("/");
      } else if (
        result.user.role === "officer" ||
        result.user.role === "admin"
      ) {
        navigate("/users");
      }
    } catch (err) {
      window.swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err,
        confirmButtonColor: "#dc3545",
      });
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow" style={{ width: "400px" }}>
        <div className="card-body p-4">
          <h2 className="text-center fw-bold mb-3">Credit Scoring System</h2>
          <p className="text-center text-muted mb-4">Login to your account</p>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100"
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <small className="text-muted">
              Don't have an account?{" "}
              <a href="/register" className="text-decoration-none fw-semibold">
                Register here
              </a>
            </small>
          </div>

          <div className="border-top mt-4 pt-3">
            <p className="text-center fw-semibold mb-2 small">Test Accounts:</p>
            <p className="text-center text-muted mb-1 small">
              Officer: officer1@system.com / Officer123!
            </p>
            <p className="text-center text-muted mb-0 small">
              Admin: admin@system.com / Admin123!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
