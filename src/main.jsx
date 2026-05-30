import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage.jsx';
import DashboardUjian from './pages/DashboardUjian.jsx';
import DashboardUser from './pages/DashboardUser.jsx';
import DashboardHasil from './pages/DashboardHasil.jsx';
import AuthPage from './pages/AuthPage.jsx';

import './index.css';
import '../src/styles/LandingPage.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Login Register */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Dashboard User*/}
        <Route
          path="/dashboard-user"
          element={<DashboardUser />}
        />

        {/* Dashboard Ujian */}
        <Route
          path="/dashboard-ujian"
          element={<DashboardUjian />}
        />

        {/* Dashboard Hasil */}
        <Route
          path="/dashboard-hasil"
          element={<DashboardHasil />}
        />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);