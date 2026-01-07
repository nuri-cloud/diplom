// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/dashboard/Dashboard";
import LogDetails from "./pages/logDetails/LogDetails";
import Settings from "./pages/settings/Settings";
import './styles/Globala.scss'
import './styles/Theme.scss'
import LogsPage from "./components/logsPage/LogsPage";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="logs/:id" element={<LogDetails />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Любой несуществующий маршрут редиректит на дашборд */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}