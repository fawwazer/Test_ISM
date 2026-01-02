import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Login from "./pages/login";
import Register from "./pages/register";
import Users from "./pages/users";
import Form from "./pages/form";
import EditForm from "./pages/editForm";
import Report from "./pages/report";
import SessionTimer from "./components/SessionTimer";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <SessionTimer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["officer", "admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/form"
          element={
            <ProtectedRoute allowedRoles={["officer", "admin"]}>
              <Form />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["officer", "admin"]}>
              <EditForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report/:id"
          element={
            <ProtectedRoute allowedRoles={["officer", "admin"]}>
              <Report />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
