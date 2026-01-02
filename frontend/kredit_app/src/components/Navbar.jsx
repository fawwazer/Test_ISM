import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-light bg-white shadow-sm">
      <div className="container-fluid">
        <div>
          <h1 className="h3 mb-1 fw-bold">Credit Scoring System</h1>
          {user && (
            <small className="text-muted">
              Welcome, {user.nama} ({user.role})
            </small>
          )}
        </div>
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </div>
    </nav>
  );
}
