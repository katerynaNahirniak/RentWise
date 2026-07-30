import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import PredictionPage from "./pages/PredictionPage";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route
  path="/"
  element={
    <ProtectedRoute>
      <PredictionPage />
    </ProtectedRoute>
  }
/>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;