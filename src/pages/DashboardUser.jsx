import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- IMPORT REACT ROUTER

import { saveSimulation, getUserSimulations } from "../services/apiSimulations.js";

import {
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  Play,
  FileText,
  Award,
  Clock,
  ChevronRight,
  UploadCloud,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { auth } from "../firebase/config.js";
import { signOut } from "firebase/auth";

// IMPORT FUNGSI API
import { fetchQuestionsFromPDF } from "../utils/apiService"; 

export default function DashboardUser() {
  const navigate = useNavigate(); // <-- INISIALISASI NAVIGATE

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const user = auth.currentUser;
  const userName = user?.displayName || "User";

  const initials = userName
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

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

          await saveSimulation({
            uid: user.uid,
            judul: selectedFile.name,
            nilai: "-",
            feedback: "Simulasi dimulai",
            mode: "AI Killer",
          });
          
          // 1. TITIPKAN FILE ASLI KE MEMORI WINDOW
          window.fileSkripsiTitipan = selectedFile; 

          // 2. PINDAH HALAMAN HANYA BAWA DATA PERTANYAAN
          navigate("/dashboard-ujian", {
            state: {
              pertanyaan: data.questions
            }
          });

        } else {
          alert("Gagal mendapatkan pertanyaan dari PDF.");
          setIsUploading(false);
        }
      } catch (error) {
        console.error("Error saat generate pertanyaan:", error);
        alert("Gagal memproses draft skripsi. Pastikan server API lokal berjalan.");
        setIsUploading(false);
      }
    };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin logout?");
    if (!confirmLogout) return;

    try {
      await signOut(auth);
      navigate("/"); // Gunakan navigate juga untuk ke halaman utama
    } catch (error) {
      alert("Gagal logout");
    }
  };

  const [simulations, setSimulations] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;

      if (!user) return;

      const data = await getUserSimulations(user.uid);

      setSimulations(data);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen text-slate-800 flex overflow-hidden relative font-sans" style={{ background: 'linear-gradient(160deg, #eef7ff 0%, #dceeff 25%, #cfe7ff 55%, #edf7ff 100%)' }}>

      <style dangerouslySetInnerHTML={{__html: `
        .dash-sidebar { background: rgba(255,255,255,0.75); backdrop-filter: blur(20px); border-right: 1px solid rgba(147,197,253,0.4); }
        .dash-nav-active { background: rgba(219,234,254,0.8); border: 1px solid rgba(147,197,253,0.5); color: #2563eb; }
        .dash-nav-idle { color: #64748b; }
        .dash-nav-idle:hover { background: rgba(239,246,255,0.7); color: #3b82f6; }
        .dash-card { background: rgba(255,255,255,0.72); backdrop-filter: blur(16px); border: 1px solid rgba(147,197,253,0.4); box-shadow: 0 8px 24px rgba(15,23,42,0.06), 0 2px 8px rgba(59,130,246,0.06); }
        .dash-stat { background: rgba(255,255,255,0.72); backdrop-filter: blur(16px); border: 1px solid rgba(147,197,253,0.35); box-shadow: 0 8px 24px rgba(15,23,42,0.06), 0 2px 8px rgba(59,130,246,0.06); }
        .dash-modal-overlay { background: rgba(219,234,254,0.4); backdrop-filter: blur(12px); }
        .dash-modal { background: rgba(255,255,255,0.92); backdrop-filter: blur(24px); border: 1px solid rgba(147,197,253,0.5); }
      `}} />

      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex: 0}}>
        <div className="absolute top-[-8%] left-[-5%] w-[520px] h-[520px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(147,197,253,0.28) 0%, transparent 70%)' }}></div>
        <div className="absolute top-[25%] right-[-8%] w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(186,230,255,0.22) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-[5%] left-[5%] w-[450px] h-[450px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(224,242,254,0.35) 0%, transparent 70%)' }}></div>
        <div className="absolute top-[60%] left-[40%] w-[350px] h-[350px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(186,230,255,0.18) 0%, transparent 70%)' }}></div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 dash-modal-overlay" onClick={() => !isUploading && setIsModalOpen(false)} />
          <div className="dash-modal relative w-full max-w-lg rounded-3xl p-8 shadow-2xl z-10" style={{ boxShadow: '0 20px 60px rgba(59,130,246,0.15)' }}>
            <button onClick={() => setIsModalOpen(false)} disabled={isUploading} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={20} /></button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 text-slate-800">Upload Draft Skripsi</h2>
              <p className="text-slate-400 text-sm">Upload file PDF untuk memulai simulasi sidang</p>
            </div>
            <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition ${selectedFile ? "border-emerald-400 bg-emerald-50" : "border-blue-300 bg-blue-50/50"}`}>
              <input type="file" accept=".pdf" onChange={handleFileChange} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer" />
              {selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="text-emerald-500" size={28} /></div>
                  <div>
                    <p className="text-emerald-600 font-bold">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center"><UploadCloud className="text-blue-400" size={28} /></div>
                  <div>
                    <p className="font-bold text-blue-500">Klik untuk upload PDF</p>
                    <p className="text-xs text-slate-400 mt-1">Maksimal 10MB</p>
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleStartSimulation} disabled={!selectedFile || isUploading} className="w-full mt-6 font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 text-white" style={{ background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)', boxShadow: '0 4px 15px rgba(59,130,246,0.35)' }}>
              {isUploading ? <><Loader2 size={18} className="animate-spin" /> Memproses...</> : "Mulai Simulasi"}
            </button>
          </div>
        </div>
      )}

      <aside className="dash-sidebar w-64 fixed left-0 top-0 h-screen hidden md:flex flex-col justify-between" style={{ zIndex: 40 }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(147,197,253,0.5)', boxShadow: '0 0 20px rgba(96,165,250,0.25)' }}>
              <div className="w-3.5 h-3.5 bg-gradient-to-tr from-blue-400 via-sky-400 to-cyan-300 rotate-45 rounded-[2px]"></div>
            </div>
            <span className="font-bold text-lg text-slate-800">Skripsivibe AI</span>
          </div>
          <nav className="space-y-2">
            <button onClick={() => setActiveMenu("dashboard")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-semibold text-sm ${activeMenu === "dashboard" ? "dash-nav-active" : "dash-nav-idle"}`}><LayoutDashboard size={18} />Dashboard</button>
            <button onClick={() => setActiveMenu("history")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-semibold text-sm ${activeMenu === "history" ? "dash-nav-active" : "dash-nav-idle"}`}><History size={18} />Riwayat</button>
            <button onClick={() => setActiveMenu("settings")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-semibold text-sm ${activeMenu === "settings" ? "dash-nav-active" : "dash-nav-idle"}`}><Settings size={18} />Pengaturan</button>
          </nav>
        </div>
        <div className="p-6" style={{ borderTop: '1px solid rgba(147,197,253,0.4)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)' }}>{initials}</div>
            <div>
              <p className="font-bold text-slate-800">{userName}</p>
              <p className="text-xs text-slate-400">Mahasiswa</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-200"><LogOut size={16} />Keluar</button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-6 md:p-10 relative overflow-y-auto" style={{ zIndex: 10 }}>
        <div className="relative z-10 max-w-6xl mx-auto space-y-10">
          <header className="flex justify-between items-end">
            <div>
              <p className="text-blue-500 text-sm font-bold uppercase tracking-widest mb-2">Overview</p>
              <h1 className="text-4xl font-black text-slate-800">Halo, {userName} 👋</h1>
              <p className="text-slate-400 mt-2">Siap menghadapi simulasi sidang hari ini?</p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(147,197,253,0.4)' }}>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-500 font-semibold">AI Sistem Active</span>
            </div>
          </header>
          <section className="relative rounded-3xl p-8 overflow-hidden bg-white/75 backdrop-blur-2xl border border-blue-100/80 shadow-[0_12px_32px_rgba(15,23,42,0.08),0_4px_12px_rgba(59,130,246,0.08)]">
            <div className="absolute top-[-40px] right-[-40px] w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(191,219,254,0.18) 0%, transparent 72%)' }}></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sky-600 text-xs font-bold uppercase tracking-widest mb-4" style={{ background: 'rgba(224,242,254,0.8)', border: '1px solid rgba(125,211,252,0.5)' }}>
                  <Play size={10} className="fill-current" />Simulasi Baru
                </div>
                <h2 className="text-3xl font-bold mb-3 text-slate-800">Mulai Simulasi Sidang</h2>
                <p className="text-slate-500 leading-relaxed font-medium">Upload draft skripsi terbaru dan mulai latihan sidang bersama AI.</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)', boxShadow: '0 8px 24px rgba(59,130,246,0.35)' }}>
                Mulai Ujian <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><ChevronRight size={16} /></div>
              </button>
            </div>
          </section>
          
          {/* STATS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="dash-stat rounded-2xl p-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <History className="text-blue-400" size={20} />
              </div>
              <p className="text-slate-400 text-sm">Total Simulasi</p>
              <h3 className="text-3xl font-bold mt-2 text-slate-800">{simulations.length}</h3>
            </div>
            <div className="dash-stat rounded-2xl p-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                <Award className="text-emerald-500" size={20} />
              </div>
              <p className="text-slate-400 text-sm">Nilai Rata-rata</p>
              <h3 className="text-3xl font-bold mt-2 text-slate-800">-</h3>
            </div>
            <div className="dash-stat rounded-2xl p-6">
              <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center mb-4">
                <Clock className="text-sky-400" size={20} />
              </div>
              <p className="text-slate-400 text-sm">Total Latihan</p>
              <h3 className="text-3xl font-bold mt-2 text-slate-800">0 Menit</h3>
            </div>
          </section>

          {/* HISTORY */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Riwayat Simulasi</h3>
              <button className="text-blue-500 text-sm flex items-center gap-1 font-semibold">
                Lihat Semua <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-4">
              {simulations.map((item) => (
                <div key={item.id} className="dash-card rounded-2xl p-6 transition">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,246,255,0.8)', border: '1px solid rgba(147,197,253,0.35)' }}>
                        <FileText className="text-blue-400" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1 text-slate-800">{item.judul}</h4>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                          <span>{item.date}</span>
                          <span>{item.duration}</span>
                          <span>{item.mode}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-3">{item.feedback}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-emerald-400 bg-emerald-50 flex items-center justify-center font-bold text-emerald-600">
                        {item.nilai}
                      </div>
                      <button className="w-10 h-10 rounded-full hover:text-white transition flex items-center justify-center text-slate-400" style={{ background: 'rgba(219,234,254,0.6)', border: '1px solid rgba(147,197,253,0.4)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #0ea5e9)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(219,234,254,0.6)'}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}