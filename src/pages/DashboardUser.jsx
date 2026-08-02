import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  saveSimulation,
  getUserSimulations,
} from "../services/apiSimulations.js";

import {
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  Play,
  FileText,
  Award,
  BookOpen,
  Clock,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  X,
  Loader2,
  CheckCircle2,
  Menu,
  LineChart,
} from "lucide-react";

import { auth, db } from "../firebase/config.js";
import { doc, onSnapshot } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { fetchQuestionsFromPDF } from "../utils/apiService";

// Import komponen tab
import Pengaturan from "./Pengaturan";
import Riwayat from "./Riwayat";

export default function DashboardUser() {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [simulations, setSimulations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(!auth.currentUser);
  const [userStatus, setUserStatus] = useState("Mahasiswa");
  const [photoURL, setPhotoURL] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);

  const userName = user?.displayName || "User";

  const initials =
    userName
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  useEffect(() => {
    const link =
      document.querySelector("link[rel~='icon']") ||
      document.createElement("link");
    link.type = "image/png";
    link.rel = "icon";
    link.href =
      "https://res.cloudinary.com/doabehyrn/image/upload/v1780575299/skripsivibeai-logo_gdzxnq.png";
    document.getElementsByTagName("head")[0].appendChild(link);
    document.title = "Dashboard - Skripsivibe AI";
  }, []);

  useEffect(() => {
    let unsubSnapshot = null;

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || !currentUser.emailVerified) {
        navigate("/auth", { replace: true });
        return;
      }
      setUser(currentUser);
      setLoading(false);

      if (unsubSnapshot) unsubSnapshot();

      const userDocRef = doc(db, "users", currentUser.uid);
      unsubSnapshot = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserStatus(data.status || "Mahasiswa");
          setPhotoURL(data.photoURL || currentUser.photoURL || null);
        }
      });
    });

    return () => {
      unsubAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;

      try {
        const data = await getUserSimulations(user.uid);
        setSimulations(data);
      } catch (error) {
        console.error("Gagal mengambil data simulasi:", error);
      }
    };

    fetchData();
  }, [user?.uid]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Mohon unggah file PDF");
    }
  };

  const handleStartSimulation = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const data = await fetchQuestionsFromPDF(selectedFile);
      if (data.questions && data.questions.length > 0) {
        window.fileSkripsiTitipan = selectedFile;
        window.fileSkripsiNama = selectedFile.name;
        navigate("/dashboard-ujian", { state: { pertanyaan: data.questions } });
      } else {
        alert("Gagal mendapatkan pertanyaan dari PDF.");
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Error saat generate pertanyaan:", error);
      alert(
        "Gagal memproses draft skripsi. Pastikan server API lokal berjalan.",
      );
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin logout?");
    if (!confirmLogout) return;
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      alert("Gagal logout");
    }
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    setSidebarOpen(false);
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(160deg, #eef7ff 0%, #dceeff 25%, #cfe7ff 55%, #edf7ff 100%)",
        }}
      >
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    { id: "history", label: "Riwayat", icon: <History size={18} /> },
    { id: "settings", label: "Pengaturan", icon: <Settings size={18} /> },
  ];

  const safeSimulations = Array.isArray(simulations) ? simulations : [];
  const graphData = [...safeSimulations].reverse();
  const totalMenit = Math.round(
    safeSimulations.reduce((acc, s) => acc + (s.durasi || 0), 0) / 60,
  );
  const nilaiAngka = safeSimulations
    .map((s) => parseInt(s.nilai))
    .filter((n) => !isNaN(n));
  const nilaiRata =
    nilaiAngka.length > 0
      ? Math.round(nilaiAngka.reduce((a, b) => a + b, 0) / nilaiAngka.length)
      : null;

  const getGradeFromNilai = (nilai) => {
    if (nilai >= 85) return "A";
    if (nilai >= 80) return "A-";
    if (nilai >= 75) return "B+";
    if (nilai >= 70) return "B";
    if (nilai >= 65) return "C+";
    if (nilai >= 60) return "C";
    return "D";
  };

  const gradeRata = nilaiRata !== null ? getGradeFromNilai(nilaiRata) : null;

  return (
    <div
      className="min-h-screen text-slate-800 flex overflow-hidden relative font-sans"
      style={{
        background:
          "linear-gradient(160deg, #eef7ff 0%, #dceeff 25%, #cfe7ff 55%, #edf7ff 100%)",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .dash-sidebar { background: rgba(255,255,255,0.75); backdrop-filter: blur(20px); border-right: 1px solid rgba(147,197,253,0.4); }
          .dash-nav-active { background: rgba(219,234,254,0.8); border: 1px solid rgba(147,197,253,0.5); color: #2563eb; }
          .dash-nav-idle { color: #64748b; }
          .dash-nav-idle:hover { background: rgba(239,246,255,0.7); color: #3b82f6; }
          .dash-card { background: rgba(255,255,255,0.72); backdrop-filter: blur(16px); border: 1px solid rgba(147,197,253,0.4); box-shadow: 0 8px 24px rgba(15,23,42,0.06), 0 2px 8px rgba(59,130,246,0.06); }
          .dash-stat { background: rgba(255,255,255,0.72); backdrop-filter: blur(16px); border: 1px solid rgba(147,197,253,0.35); box-shadow: 0 8px 24px rgba(15,23,42,0.06), 0 2px 8px rgba(59,130,246,0.06); }
          .dash-modal-overlay { background: rgba(219,234,254,0.4); backdrop-filter: blur(12px); }
          .dash-modal { background: rgba(255,255,255,0.92); backdrop-filter: blur(24px); border: 1px solid rgba(147,197,253,0.5); }
        `,
        }}
      />

      {/* Background blobs */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute top-[-8%] left-[-5%] w-[520px] h-[520px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(147,197,253,0.28) 0%, transparent 70%)",
          }}
        ></div>
        <div
          className="absolute top-[25%] right-[-8%] w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(186,230,255,0.22) 0%, transparent 70%)",
          }}
        ></div>
        <div
          className="absolute bottom-[5%] left-[5%] w-[450px] h-[450px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(224,242,254,0.35) 0%, transparent 70%)",
          }}
        ></div>
      </div>

      {/* ============ MODAL UPLOAD ============ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 dash-modal-overlay"
            onClick={() => !isUploading && setIsModalOpen(false)}
          />
          <div
            className="dash-modal relative w-full max-w-lg rounded-3xl p-8 shadow-2xl z-10"
            style={{ boxShadow: "0 20px 60px rgba(59,130,246,0.15)" }}
          >
            {!isUploading && (
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            )}
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-6 animate-in fade-in zoom-in duration-300">
                <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[6px] border-blue-100 animate-ping opacity-75"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-blue-200 animate-pulse"></div>
                  <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-blue-500 to-sky-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40">
                    <BookOpen size={36} className="text-white animate-bounce" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">
                  Menganalisis Skripsi
                </h3>
                <p className="text-sm text-slate-500 text-center px-4 font-medium animate-pulse leading-relaxed">
                  Membaca isi skripsi dan meracik pertanyaan sidang paling
                  kritis untukmu. Mohon tunggu sebentar...
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2 text-slate-800">
                    Upload Draft Skripsi
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Upload file PDF untuk memulai simulasi sidang
                  </p>
                </div>

                <div
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition ${selectedFile ? "border-emerald-400 bg-emerald-50" : "border-blue-300 bg-blue-50/50"}`}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="text-emerald-500" size={28} />
                      </div>
                      <div>
                        <p className="text-emerald-600 font-bold">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                        <UploadCloud className="text-blue-400" size={28} />
                      </div>
                      <div>
                        <p className="font-bold text-blue-500">
                          Klik untuk upload PDF
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Maksimal 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleStartSimulation}
                  disabled={!selectedFile}
                  className="w-full mt-6 font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 text-white"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
                    boxShadow: "0 4px 15px rgba(59,130,246,0.35)",
                  }}
                >
                  Mulai Simulasi
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============ MODAL HASIL RIWAYAT (DASHBOARD) ============ */}
      {selectedHistory && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{
            background: "rgba(15,23,42,0.55)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setSelectedHistory(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
            style={{
              background:
                "linear-gradient(160deg, #f0f8ff 0%, #e1f0fd 30%, #dbeeff 65%, #edf6ff 100%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-8 py-5 rounded-t-3xl border-b border-blue-100/80"
              style={{
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div>
                <p className="text-blue-500 text-[10px] font-black uppercase tracking-[4px]">
                  Detail Hasil Simulasi
                </p>
                <h2 className="text-base md:text-lg font-black text-slate-800 mt-0.5 line-clamp-1 max-w-sm md:max-w-lg">
                  {selectedHistory.judul}
                </h2>
              </div>
              <button
                onClick={() => setSelectedHistory(null)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all border border-blue-100 shrink-0"
                style={{ background: "rgba(255,255,255,0.9)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-5">
              {/* GRADE & SKOR UTAMA */}
              <div
                className="rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-200/50"
                style={{
                  background: "rgba(255,255,255,0.78)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div>
                  <h3 className="text-xl font-black text-slate-800 mb-1">
                    Grade Akhir
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Nilai akhir dari penggabungan skor presentasi dan sesi QnA.
                  </p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {selectedHistory.mode && (
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-500 text-xs font-bold border border-blue-100">
                        {selectedHistory.mode}
                      </span>
                    )}
                    {selectedHistory.durasi && (
                      <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-500 text-xs font-bold border border-sky-100 flex items-center gap-1">
                        <Clock size={11} />
                        {Math.floor(selectedHistory.durasi / 60)}m{" "}
                        {selectedHistory.durasi % 60}s presentasi
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div
                    className={`w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-lg ${
                      selectedHistory.grade?.startsWith("A")
                        ? "border-emerald-300 bg-emerald-50 text-emerald-500"
                        : selectedHistory.grade?.startsWith("B")
                          ? "border-blue-300 bg-blue-50 text-blue-500"
                          : selectedHistory.grade?.startsWith("C")
                            ? "border-slate-300 bg-slate-50 text-slate-600"
                            : "border-red-400 bg-red-50 text-red-500"
                    }`}
                  >
                    <span className={`text-5xl font-black`}>
                      {selectedHistory.grade || "-"}
                    </span>
                  </div>
                  <div
                    className="px-5 py-2 rounded-full border border-blue-100 flex items-center gap-2"
                    style={{ background: "rgba(255,255,255,0.95)" }}
                  >
                    <span className="text-slate-400 text-xs font-bold">
                      Total Skor:
                    </span>
                    <span className="text-lg font-black text-slate-700">
                      {selectedHistory.nilai ?? "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* STATISTIK RINGKAS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className="rounded-2xl p-5 border border-blue-200/50"
                  style={{ background: "rgba(255,255,255,0.82)" }}
                >
                  <p className="text-slate-400 text-xs">Pemahaman Materi</p>
                  <h3 className="text-3xl font-black text-slate-800 mt-1">
                    {selectedHistory.p_materi ?? "-"}%
                  </h3>
                </div>
                <div
                  className="rounded-2xl p-5 border border-blue-200/50"
                  style={{ background: "rgba(255,255,255,0.82)" }}
                >
                  <p className="text-slate-400 text-xs">Percaya Diri</p>
                  <h3 className="text-3xl font-black text-slate-800 mt-1">
                    {selectedHistory.p_pede ?? "-"}%
                  </h3>
                </div>
                <div
                  className="rounded-2xl p-5 border border-blue-200/50"
                  style={{ background: "rgba(255,255,255,0.82)" }}
                >
                  <p className="text-slate-400 text-xs">Akurasi QnA</p>
                  <h3 className="text-3xl font-black text-slate-800 mt-1">
                    {selectedHistory.p_qna ?? "-"}%
                  </h3>
                </div>
              </div>

              {/* FEEDBACK & TOMBOL DETAIL */}
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <Award size={18} /> Ringkasan Feedback
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed text-justify mb-4">
                  {selectedHistory.feedback ||
                    "Tidak ada feedback ringkas yang tersimpan untuk simulasi ini."}
                </p>
                <button
                  onClick={() => {
                    setSelectedHistory(null);
                    setActiveMenu("history");
                  }}
                  className="w-full py-3 rounded-xl bg-white text-blue-600 font-bold border border-blue-200 hover:bg-blue-50 transition flex items-center justify-center gap-2"
                >
                  Lihat Detail Evaluasi & QnA <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ SIDEBAR MOBILE OVERLAY ============ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[50] md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
        </div>
      )}

      {/* ============ SIDEBAR ============ */}
      <aside
        className={`dash-sidebar fixed left-0 top-0 h-screen flex flex-col justify-between transition-all duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          ${sidebarCollapsed ? "w-16" : "w-64"}`}
        style={{ zIndex: 60 }}
      >
        <div
          className={`p-4 relative ${sidebarCollapsed ? "flex flex-col items-center" : "p-6"}`}
        >
          {/* Tombol Toggle Collapse - hanya tampil di desktop */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex absolute top-5 right-[-12px] w-6 h-6 rounded-full items-center justify-center text-blue-400 hover:text-blue-600 transition"
            style={{
              background: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(147,197,253,0.5)",
              boxShadow: "0 2px 6px rgba(59,130,246,0.15)",
            }}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={12} />
            ) : (
              <ChevronLeft size={12} />
            )}
          </button>

          {/* Logo */}
          <div
            className={`flex items-center gap-3 cursor-pointer group ${sidebarCollapsed ? "mb-8 justify-center" : "mb-12"}`}
          >
            <img
              src="https://res.cloudinary.com/doabehyrn/image/upload/v1780575299/skripsivibeai-logo_gdzxnq.png"
              alt="Logo Skripsivibe AI"
              className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            {!sidebarCollapsed && (
              <span className="font-bold text-lg text-slate-800 whitespace-nowrap">
                Skripsivibe AI
              </span>
            )}
          </div>

          {/* Nav */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition font-semibold text-sm
                  ${sidebarCollapsed ? "justify-center" : ""}
                  ${activeMenu === item.id ? "dash-nav-active" : "dash-nav-idle"}`}
              >
                {item.icon}
                {!sidebarCollapsed && item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User Info + Logout */}
        <div
          className={`p-4 ${sidebarCollapsed ? "flex flex-col items-center" : "p-6"}`}
          style={{ borderTop: "1px solid rgba(147,197,253,0.4)" }}
        >
          <div
            className={`flex items-center gap-3 mb-4 ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            {/* BAGIAN FOTO PROFIL YANG DISESUAIKAN */}
            <div
              className="w-10 h-10 min-w-[40px] rounded-full flex items-center justify-center font-bold text-white overflow-hidden shadow-sm shrink-0"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
              }}
            >
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="Profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            {/* ==================================== */}

            {!sidebarCollapsed && (
              <div>
                <p className="font-bold text-slate-800">{userName}</p>
                <p className="text-xs text-slate-400">{userStatus}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? "Keluar" : undefined}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-200
              ${sidebarCollapsed ? "w-10 h-10 p-0" : "w-full"}`}
          >
            <LogOut size={16} />
            {!sidebarCollapsed && "Keluar"}
          </button>
        </div>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <main
        className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"} p-6 md:p-10 relative overflow-y-auto`}
        style={{ zIndex: 10 }}
      >
        {/* Tombol hamburger untuk mobile */}
        <button
          className="md:hidden mb-4 p-2 rounded-xl text-slate-600"
          style={{
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(147,197,253,0.35)",
          }}
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>

        <div className="relative z-10 max-w-6xl mx-auto space-y-10">
          {/* ===== TAB: DASHBOARD ===== */}
          {activeMenu === "dashboard" && (
            <>
              <header className="flex justify-between items-end">
                <div>
                  <p className="text-blue-500 text-sm font-bold uppercase tracking-widest mb-2">
                    Overview
                  </p>
                  <h1 className="text-4xl font-black text-slate-800">
                    Halo, {userName} 👋
                  </h1>
                  <p className="text-slate-400 mt-2">
                    Siap menghadapi simulasi sidang hari ini?
                  </p>
                </div>
                <div
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.65)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(147,197,253,0.4)",
                  }}
                >
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-500 font-semibold">
                    AI Sistem Active
                  </span>
                </div>
              </header>

              {/* Banner Simulasi */}
              <section className="relative rounded-3xl p-8 overflow-hidden bg-white/75 backdrop-blur-2xl border border-blue-100/80 shadow-[0_12px_32px_rgba(15,23,42,0.08),0_4px_12px_rgba(59,130,246,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-blue-300">
                <div
                  className="absolute top-[-40px] right-[-40px] w-72 h-72 rounded-full pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(191,219,254,0.18) 0%, transparent 72%)",
                  }}
                ></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="max-w-xl">
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sky-600 text-xs font-bold uppercase tracking-widest mb-4"
                      style={{
                        background: "rgba(224,242,254,0.8)",
                        border: "1px solid rgba(125,211,252,0.5)",
                      }}
                    >
                      <Play size={10} className="fill-current" /> Simulasi Baru
                    </div>
                    <h2 className="text-3xl font-bold mb-3 text-slate-800">
                      Mulai Simulasi Sidang
                    </h2>
                    <p className="text-slate-500 leading-relaxed font-medium">
                      Upload draft skripsi terbaru dan mulai latihan sidang
                      bersama AI.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition flex items-center gap-3"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
                      boxShadow: "0 8px 24px rgba(59,130,246,0.35)",
                    }}
                  >
                    Mulai Ujian
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <ChevronRight size={16} />
                    </div>
                  </button>
                </div>
              </section>

              {/* Statistik */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="dash-stat rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-blue-300">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <History className="text-blue-400" size={20} />
                  </div>
                  <p className="text-slate-400 text-sm">Total Simulasi</p>
                  <h3 className="text-3xl font-bold mt-2 text-slate-800">
                    {simulations.length}
                  </h3>
                </div>
                <div
                  className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-blue-300"
                  style={{
                    background: "rgba(255,255,255,0.72)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(147,197,253,0.35)",
                  }}
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                    <Award className="text-emerald-500" size={18} />
                  </div>
                  <p className="text-slate-400 text-xs">
                    Grade & Nilai Rata-rata
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-xl shrink-0
                      ${
                        gradeRata?.startsWith("A")
                          ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                          : gradeRata?.startsWith("B")
                            ? "border-blue-400 bg-blue-50 text-blue-600"
                            : gradeRata?.startsWith("C")
                              ? "border-slate-400 bg-slate-50 text-slate-600"
                              : gradeRata
                                ? "border-red-400 bg-red-50 text-red-500"
                                : "border-slate-200 bg-slate-50 text-slate-400"
                      }`}
                    >
                      {gradeRata ?? "-"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-slate-800">
                        {nilaiRata !== null ? nilaiRata : "-"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="dash-stat rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-blue-300">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center mb-4">
                    <Clock className="text-sky-400" size={20} />
                  </div>
                  <p className="text-slate-400 text-sm">Total Latihan</p>
                  <h3 className="text-3xl font-bold mt-2 text-slate-800">
                    {totalMenit} Menit
                  </h3>
                </div>
              </section>

              {/* Grafik Perkembangan Skor */}
              <div
                className="dash-card rounded-3xl p-6 md:p-8 mb-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-blue-300"
                style={{
                  background: "rgba(255,255,255,0.68)",
                  backdropFilter: "blur(18px)",
                  border: "1px solid rgba(147,197,253,0.28)",
                }}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-sky-500 text-white shadow-sm">
                      <LineChart size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">
                        Grafik Perkembangan Skor
                      </h3>
                      <p className="text-sm text-slate-500">
                        Grafik peningkatan nilai dari riwayat simulasi sidang
                        Anda
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="overflow-hidden rounded-3xl bg-white/80 p-4 md:p-5"
                  style={{ border: "1px solid rgba(147,197,253,0.18)" }}
                >
                  <div className="relative w-full h-[300px] mt-8">
                    <svg
                      viewBox="0 -20 1000 360"
                      preserveAspectRatio="none"
                      className="w-full h-full overflow-visible"
                    >
                      <defs>
                        <linearGradient
                          id="chartStroke"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#0ea5e9" />
                        </linearGradient>
                        <linearGradient
                          id="chartArea"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="rgba(59,130,246,0.22)" />
                          <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>
                      </defs>

                      <line
                        x1="20"
                        y1="0"
                        x2="980"
                        y2="0"
                        stroke="rgba(148,163,184,0.18)"
                        strokeWidth="1"
                        strokeDasharray="5,5"
                      />
                      {[0, 75, 150, 225, 300].map((y) => (
                        <g key={y}>
                          <line
                            x1="20"
                            y1={y}
                            x2="980"
                            y2={y}
                            stroke="rgba(148,163,184,0.18)"
                            strokeWidth="1"
                            strokeDasharray="5,5"
                          />
                          <text
                            x="0"
                            y={y + 4}
                            fill="#94a3b8"
                            fontSize="12"
                            textAnchor="start"
                          >
                            {((300 - y) / 3).toFixed(0)}
                          </text>
                        </g>
                      ))}

                      <line
                        x1="20"
                        y1="300"
                        x2="980"
                        y2="300"
                        stroke="rgba(148,163,184,0.25)"
                        strokeWidth="1"
                      />

                      {(() => {
                        const points = graphData.map((item, index) => {
                          const value = Math.min(
                            Math.max(parseInt(item.nilai) || 0, 0),
                            100,
                          );
                          return {
                            x:
                              graphData.length > 1
                                ? (index / (graphData.length - 1)) * 960 + 20
                                : 500,
                            y: 300 - value * 3,
                            value,
                            label: item.judul || "-",
                            date: item.date,
                            id: item.id || index,
                          };
                        });

                        const createSmoothPath = (pts) => {
                          if (pts.length === 0) return "";
                          if (pts.length === 1)
                            return `M ${pts[0].x} ${pts[0].y}`;

                          const path = [`M ${pts[0].x} ${pts[0].y}`];
                          for (let i = 0; i < pts.length - 1; i++) {
                            const p0 = pts[i - 1] || pts[i];
                            const p1 = pts[i];
                            const p2 = pts[i + 1];
                            const cp1x = p1.x + (p2.x - p0.x) / 6;
                            const cp1y = p1.y + (p2.y - p0.y) / 6;
                            const cp2x =
                              p2.x -
                              (pts[i + 2]
                                ? (pts[i + 2].x - p1.x) / 6
                                : (p2.x - p1.x) / 6);
                            const cp2y =
                              p2.y -
                              (pts[i + 2]
                                ? (pts[i + 2].y - p1.y) / 6
                                : (p2.y - p1.y) / 6);
                            path.push(
                              `C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`,
                            );
                          }
                          return path.join(" ");
                        };

                        const smoothPath = createSmoothPath(points);
                        const areaPath =
                          points.length > 0
                            ? `${smoothPath} L ${points[points.length - 1].x} 300 L ${points[0].x} 300 Z`
                            : "";

                        return (
                          <>
                            {points.length > 0 && (
                              <>
                                <path d={areaPath} fill="url(#chartArea)" />
                                <path
                                  d={smoothPath}
                                  fill="none"
                                  stroke="#3b82f6"
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                {points.map((point, index) => (
                                  <g key={point.id}>
                                    <circle
                                      cx={point.x}
                                      cy={point.y}
                                      r="6"
                                      fill="#fff"
                                      stroke="#3b82f6"
                                      strokeWidth="3"
                                      style={{ cursor: "pointer" }}
                                      onMouseEnter={() =>
                                        setHoveredPoint(point)
                                      }
                                      onMouseLeave={() => setHoveredPoint(null)}
                                    />
                                    <text
                                      x={point.x}
                                      y="330"
                                      fill="#94a3b8"
                                      fontSize="12"
                                      textAnchor="middle"
                                    >
                                      {point.date
                                        ? point.date
                                        : `Sim ${index + 1}`}
                                    </text>
                                  </g>
                                ))}
                              </>
                            )}
                          </>
                        );
                      })()}
                    </svg>
                    {hoveredPoint && (
                      <div
                        className="absolute z-50 pointer-events-none rounded-xl border border-blue-100 bg-white/95 backdrop-blur-md shadow-xl p-4 min-w-[200px]"
                        style={{
                          left: `${(hoveredPoint.x / 1000) * 100}%`,
                          top: `${Math.max(hoveredPoint.y - 110, 10)}px`,
                          transform: `translateX(-${(hoveredPoint.x / 1000) * 100}%)`,
                        }}
                      >
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">
                          Simulasi
                        </p>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1 mb-2">
                          {hoveredPoint.label}
                        </p>
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                            Nilai :
                          </span>
                          <span className="text-sm font-black text-blue-600">
                            {hoveredPoint.value}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 border-t border-slate-200/70 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                    <div className="rounded-3xl bg-slate-50 px-5 py-4 border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
                        Simulasi Terbaru
                      </p>
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {safeSimulations[0]?.judul || "-"}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 px-5 py-4 border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
                        Nilai Terkini
                      </p>
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {safeSimulations[0]?.nilai ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Riwayat Singkat di Dashboard */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">
                    Riwayat Simulasi
                  </h3>
                  <button
                    onClick={() => setActiveMenu("history")}
                    className="text-blue-500 text-sm flex items-center gap-1 font-semibold hover:underline"
                  >
                    Lihat Semua <ChevronRight size={14} />
                  </button>
                </div>
                <div className="space-y-4">
                  {safeSimulations.length === 0 ? (
                    <div className="text-center py-10 dash-card rounded-2xl">
                      <p className="text-slate-400">
                        Belum ada riwayat simulasi.
                      </p>
                    </div>
                  ) : (
                    safeSimulations.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="dash-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-300 cursor-pointer"
                      >
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="flex gap-4">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{
                                background: "rgba(239,246,255,0.8)",
                                border: "1px solid rgba(147,197,253,0.35)",
                              }}
                            >
                              <FileText className="text-blue-400" size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg mb-1 text-slate-800">
                                {item.judul}
                              </h4>
                              <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                                <span>{item.date}</span>
                                <span>{item.duration}</span>
                                <span>{item.mode}</span>
                              </div>
                              <p className="text-sm text-slate-500 mt-3">
                                {item.feedback}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold ${
                                getGradeFromNilai(
                                  parseInt(item.nilai) || 0,
                                ).startsWith("A")
                                  ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                                  : getGradeFromNilai(
                                        parseInt(item.nilai) || 0,
                                      ).startsWith("B")
                                    ? "border-blue-400 bg-blue-50 text-blue-600"
                                    : getGradeFromNilai(
                                          parseInt(item.nilai) || 0,
                                        ).startsWith("C")
                                      ? "border-slate-400 bg-slate-50 text-slate-600"
                                      : "border-red-400 bg-red-50 text-red-600"
                              }`}
                            >
                              {item.nilai}
                            </div>
                            <button
                              onClick={() => setSelectedHistory(item)}
                              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 transition"
                              style={{
                                background: "rgba(219,234,254,0.6)",
                                border: "1px solid rgba(147,197,253,0.4)",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "linear-gradient(135deg, #3b82f6, #0ea5e9)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "rgba(219,234,254,0.6)")
                              }
                            >
                              <ChevronRight size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </>
          )}

          {/* ===== TAB: RIWAYAT ===== */}
          {activeMenu === "history" && <Riwayat />}

          {/* ===== TAB: PENGATURAN ===== */}
          {activeMenu === "settings" && <Pengaturan />}
        </div>
      </main>
    </div>
  );
}