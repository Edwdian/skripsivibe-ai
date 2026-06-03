import React, { useState, useEffect } from "react";
import { FileText, ChevronRight, Search, Filter, Clock, Award } from "lucide-react";
import { auth } from "../firebase/config.js";
import { getUserSimulations } from "../services/apiSimulations.js";

const Riwayat = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const data = await getUserSimulations(currentUser.uid);
      setSimulations(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = simulations.filter((item) =>
    item.judul?.toLowerCase().includes(search.toLowerCase())
  );

  const safeSimulations = Array.isArray(simulations) ? simulations : [];
  const totalMenit = Math.round(
    safeSimulations.reduce((acc, s) => acc + (s.durasi || 0), 0) / 60
  );
  const nilaiAngka = safeSimulations
    .map((s) => parseInt(s.nilai))
    .filter((n) => !isNaN(n));
  const nilaiRata =
    nilaiAngka.length > 0
      ? Math.round(nilaiAngka.reduce((a, b) => a + b, 0) / nilaiAngka.length)
      : null;

  // Konversi rata-rata angka ke grade
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-blue-500 text-sm font-bold uppercase tracking-widest mb-2">Riwayat</p>
        <h1 className="text-3xl font-black text-slate-800">Riwayat Simulasi</h1>
        <p className="text-slate-400 mt-1">Semua sesi latihan sidang yang pernah kamu lakukan.</p>
      </div>

      {/* Statistik Ringkas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(16px)", border: "1px solid rgba(147,197,253,0.35)" }}>
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
            <FileText className="text-blue-400" size={18} />
          </div>
          <p className="text-slate-400 text-xs">Total Simulasi</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{simulations.length}</h3>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(16px)", border: "1px solid rgba(147,197,253,0.35)" }}>
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
            <Award className="text-emerald-500" size={18} />
          </div>
          <p className="text-slate-400 text-xs">Nilai Rata-rata</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{nilaiRata !== null ? nilaiRata : "-"}</h3>
        </div>
        <div className="rounded-2xl p-5 col-span-2 md:col-span-1" style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(16px)", border: "1px solid rgba(147,197,253,0.35)" }}>
          <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center mb-3">
            <Clock className="text-sky-400" size={18} />
          </div>
          <p className="text-slate-400 text-xs">Total Latihan</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalMenit} Menit</h3>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(16px)", border: "1px solid rgba(147,197,253,0.35)" }}>
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan judul skripsi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
        />
        <Filter size={16} className="text-slate-400" />
      </div>

      {/* List Riwayat */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="text-blue-300" size={28} />
          </div>
          <p className="text-slate-500 font-semibold">
            {search ? "Tidak ada hasil ditemukan." : "Belum ada riwayat simulasi."}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {!search && "Mulai simulasi pertamamu sekarang!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl p-6 transition-all hover:shadow-md"
              style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(16px)", border: "1px solid rgba(147,197,253,0.4)", boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(239,246,255,0.8)", border: "1px solid rgba(147,197,253,0.35)" }}>
                    <FileText className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-800 mb-1">{item.judul}</h4>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                      {item.date && <span>📅 {item.date}</span>}
                      {item.durasi && (
                        <span>⏱ {Math.round(item.durasi / 60)} menit</span>
                      )}
                      {item.mode && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 font-semibold border border-blue-100">
                          {item.mode}
                        </span>
                      )}
                    </div>
                    {item.feedback && (
                      <p className="text-sm text-slate-500 mt-2">{item.feedback}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-sm
                      ${item.grade?.startsWith("A") ? "border-emerald-400 bg-emerald-50 text-emerald-600" :
                        item.grade?.startsWith("B") ? "border-blue-400 bg-blue-50 text-blue-600" :
                        item.grade?.startsWith("C") ? "border-slate-400 bg-slate-50 text-slate-600" :
                        item.grade ? "border-red-400 bg-red-50 text-red-500" :
                        "border-emerald-400 bg-emerald-50 text-emerald-600"}`}>
                      {item.grade || item.nilai || "-"}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{item.nilai || "-"}</span>
                  </div>
                  <button
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 transition"
                    style={{ background: "rgba(219,234,254,0.6)", border: "1px solid rgba(147,197,253,0.4)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, #3b82f6, #0ea5e9)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(219,234,254,0.6)")}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Riwayat;