import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ItineraryPage from "./pages/ItineraryPage";
import LandingPage from "./pages/LandingPage";

// three.js is heavy; keep it out of the landing page bundle.
const DashboardPage = lazy(() => import("./pages/DashboardPage"));

export default function App() {
  return (
    <Suspense fallback={<div className="page-loading">Loading…</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/trips/:tripId" element={<ItineraryPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
