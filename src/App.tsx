import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { Home } from "./pages/Home";
import { NewSimulation } from "./pages/NewSimulation";
import { RiskDashboard } from "./pages/RiskDashboard";
import { History } from "./pages/History";
import { Method } from "./pages/Method";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="/simulate" element={<NewSimulation />} />
          {/* /dashboard — post-simulation redirect target (reads latest from localStorage) */}
          <Route path="/dashboard" element={<RiskDashboard />} />
          {/* /dashboard/:id — legacy and history deep-link */}
          <Route path="/dashboard/:id" element={<RiskDashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/method" element={<Method />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
