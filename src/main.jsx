import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage.jsx';
import DashboardUjian from './pages/DashboardUjian.jsx';
import DashboardUser from './pages/DashboardUser.jsx';
import DashboardHasil from './pages/DashboardHasil.jsx';
import AuthPage from './pages/AuthPage.jsx';

import { auth } from './firebase/config.js';
import { onAuthStateChanged } from 'firebase/auth';

import './index.css';
import '../src/styles/LandingPage.css';

// ── Protected Route ──────────────────────────
function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Masih loading, tampilkan kosong dulu
  if (user === undefined) return null;

  // Belum login → ke halaman auth
  if (!user) return <Navigate to="/auth" replace />;

  // Belum verifikasi email → ke halaman auth
  if (!user.emailVerified) return <Navigate to="/auth" replace />;

  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Login Register */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Dashboard User — dilindungi */}
        <Route path="/dashboard-user" element={
          <ProtectedRoute><DashboardUser /></ProtectedRoute>
        } />

        {/* Dashboard Ujian — dilindungi */}
        <Route path="/dashboard-ujian" element={
          <ProtectedRoute><DashboardUjian /></ProtectedRoute>
        } />

        {/* Dashboard Hasil — dilindungi */}
        <Route path="/dashboard-hasil" element={
          <ProtectedRoute><DashboardHasil /></ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);