import React, { useState, useEffect } from "react";
import { FileText, ChevronRight, Search, Filter, Clock, Award,
  X, Trophy, Brain, Percent, ShieldCheck, AlertTriangle,
  Sparkles, MessageSquare
 } from "lucide-react";
import { auth } from "../firebase/config.js";
import { getUserSimulations } from "../services/apiSimulations.js";

const Riwayat = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [now, setNow] = useState(Date.now());

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

  const formatWaktuRelatif = (createdAt, now) => {
    if (!createdAt) return "-";
    
    const timestamp = createdAt?._seconds
      ? createdAt._seconds * 1000
      : new Date(createdAt).getTime();

    const selisihMs = now - timestamp;
    const selisihMenit = Math.floor(selisihMs / (1000 * 60));
    const selisihJam = Math.floor(selisihMs / (1000 * 60 * 60));
    const selisihHari = Math.floor(selisihMs / (1000 * 60 * 60 * 24));

    if (selisihMenit < 1) return "Baru saja";
    if (selisihMenit < 60) return `${selisihMenit} menit yang lalu`;
    if (selisihJam < 24) return `${selisihJam} jam yang lalu`;

    // Lebih dari 24 jam → tampilkan jam & tanggal
    const date = new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  useEffect(() => {
    // Update setiap 1 menit agar waktu relatif otomatis berubah
    const interval = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">

      {/* ✅ MODAL DIPANGGIL DI SINI */}
      <ModalDetailRiwayat item={selectedItem} onClose={() => setSelectedItem(null)} />

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
                      <span>🕐 {formatWaktuRelatif(item.createdAt, now)}</span>
                      {/* {item.durasi && (
                        <span>⏱ {Math.round(item.durasi / 60)} menit</span>
                      )} */}
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
                    onClick={() => setSelectedItem(item)}
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

function ModalDetailRiwayat({ item, onClose }) {
  if (!item) return null;

  const gradeColor =
    item.grade?.startsWith("A") ? "text-emerald-500" :
    item.grade?.startsWith("B") ? "text-blue-500" :
    item.grade?.startsWith("C") ? "text-slate-600" :
    "text-red-500";

  const gradeBg =
    item.grade?.startsWith("A") ? "border-emerald-300 bg-emerald-50" :
    item.grade?.startsWith("B") ? "border-blue-300 bg-blue-50" :
    item.grade?.startsWith("C") ? "border-slate-300 bg-slate-50" :
    "border-red-400 bg-red-50";

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
        style={{ background: "linear-gradient(160deg, #f0f8ff 0%, #e1f0fd 30%, #dbeeff 65%, #edf6ff 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-8 py-5 rounded-t-3xl border-b border-blue-100/80"
          style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)" }}
        >
          <div>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[4px]">Detail Hasil Simulasi</p>
            <h2 className="text-base md:text-lg font-black text-slate-800 mt-0.5 line-clamp-1 max-w-sm md:max-w-lg">
              {item.judul}
            </h2>
          </div>
          <button
            onClick={onClose}
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
            style={{ background: "rgba(255,255,255,0.78)", backdropFilter: "blur(16px)" }}
          >
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-1">Grade Akhir</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Nilai akhir dari penggabungan skor presentasi (60%) dan sesi QnA (40%).
              </p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {item.mode && (
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-500 text-xs font-bold border border-blue-100">
                    {item.mode}
                  </span>
                )}
                {item.durasi && (
                  <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-500 text-xs font-bold border border-sky-100 flex items-center gap-1">
                    <Clock size={11} />
                    {Math.floor(item.durasi / 60)}m {item.durasi % 60}s presentasi
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-lg ${gradeBg}`}>
                <span className={`text-5xl font-black ${gradeColor}`}>{item.grade || "-"}</span>
              </div>
              <div
                className="px-5 py-2 rounded-full border border-blue-100 flex items-center gap-2"
                style={{ background: "rgba(255,255,255,0.95)" }}
              >
                <span className="text-slate-400 text-xs font-bold">Total Skor:</span>
                <span className={`text-lg font-black ${gradeColor}`}>{item.nilai ?? "-"}</span>
              </div>
            </div>
          </div>

          {/* STATISTIK 3 KOLOM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl p-5 border border-blue-200/50" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)" }}>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(219,234,254,0.9)" }}>
                  <Brain className="text-blue-500" size={20} />
                </div>
                {item.status_paham && (
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${
                    item.status_paham === "Sangat Paham" ? "bg-blue-50 text-blue-600 border-blue-200" :
                    item.status_paham === "Lumayan Paham" ? "bg-white text-slate-500 border-slate-200" :
                    "bg-red-50 text-red-500 border-red-200"
                  }`}>{item.status_paham}</span>
                )}
              </div>
              <p className="text-slate-400 text-xs">Kesesuaian Materi (TF-IDF)</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">{item.p_materi ?? "-"}%</h3>
              <div className="mt-3 h-1.5 bg-blue-100/50 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${item.p_materi ?? 0}%`, background: "linear-gradient(135deg, #3b82f6, #0ea5e9)" }} />
              </div>
            </div>

            <div className="rounded-2xl p-5 border border-blue-200/50" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)" }}>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(219,234,254,0.9)" }}>
                  <Trophy className="text-blue-500" size={20} />
                </div>
                {item.status_pede && (
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${
                    item.status_pede === "Percaya Diri" ? "bg-blue-50 text-blue-600 border-blue-200" :
                    "bg-red-50 text-red-500 border-red-200"
                  }`}>{item.status_pede}</span>
                )}
              </div>
              <p className="text-slate-400 text-xs">Skor Percaya Diri (LSTM)</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">{item.p_pede ?? "-"}%</h3>
              <div className="mt-3 h-1.5 bg-blue-100/50 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${item.p_pede ?? 0}%`, background: "linear-gradient(135deg, #3b82f6, #0ea5e9)" }} />
              </div>
            </div>

            <div className="rounded-2xl p-5 border border-blue-200/50" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #3b82f6, #0ea5e9)" }}>
                <Percent className="text-white" size={20} />
              </div>
              <p className="text-slate-400 text-xs">Akurasi Jawaban QnA (Gemini)</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">{item.p_qna ?? "-"}%</h3>
              <div className="mt-3 h-1.5 bg-blue-100/50 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${item.p_qna ?? 0}%`, background: "linear-gradient(135deg, #3b82f6, #0ea5e9)" }} />
              </div>
            </div>
          </div>

          {/* FEEDBACK GABUNGAN */}
          {item.evaluasi && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl p-5 border border-blue-200/50" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 border border-blue-100 shrink-0">
                    <ShieldCheck className="text-blue-500" size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Keunggulan</p>
                    <p className="text-sm font-black text-slate-800">Yang Sudah Bagus</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {(item.evaluasi?.unggul || []).map((u, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-white/60 border border-blue-100/50">
                      <ChevronRight className="text-blue-400 mt-0.5 shrink-0" size={13} />
                      <p className="text-slate-500 text-xs leading-relaxed">
                        <span className="font-bold text-blue-500 mr-1">[{u.source}]</span>{u.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5 border border-blue-200/50" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-200 shrink-0">
                    <AlertTriangle className="text-slate-500" size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Evaluasi</p>
                    <p className="text-sm font-black text-slate-800">Perlu Ditingkatkan</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {(item.evaluasi?.lemah || []).map((l, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-white/60 border border-slate-100">
                      <ChevronRight className="text-slate-400 mt-0.5 shrink-0" size={13} />
                      <p className="text-slate-500 text-xs leading-relaxed">
                        <span className="font-bold text-slate-600 mr-1">[{l.source}]</span>{l.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5 border border-blue-200/50" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 border border-blue-100 shrink-0">
                    <Sparkles className="text-blue-500" size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Strategi</p>
                    <p className="text-sm font-black text-slate-800">Tingkatkan Nilai</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {(item.evaluasi?.strategi || []).map((s, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-white/60 border border-blue-100/50">
                      <ChevronRight className="text-blue-400 mt-0.5 shrink-0" size={13} />
                      <p className="text-slate-500 text-xs leading-relaxed">
                        <span className="font-bold text-blue-500 mr-1">[{s.source}]</span>{s.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LIST QNA */}
          {item.qnaList && item.qnaList.length > 0 && (
            <div className="space-y-3">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-1">Evaluasi Per Pertanyaan</p>
              {item.qnaList.map((q, index) => {
                const status = q.status?.toLowerCase() || "";
                const isBenar = status.includes("benar");
                const isKurang = status.includes("kurang");
                return (
                  <div key={index} className="rounded-2xl p-5 border border-blue-200/50 relative" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)" }}>
                    <div className="absolute top-5 right-5">
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${
                        isBenar ? "bg-emerald-50 text-emerald-500 border-emerald-200" :
                        isKurang ? "bg-slate-50 text-slate-500 border-slate-200" :
                        "bg-red-50 text-red-500 border-red-200"
                      }`}>{q.status || "Gagal Menilai"}</span>
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Pertanyaan {index + 1}</p>
                    <p className="text-slate-800 font-bold text-sm leading-relaxed pr-24">"{q.soal}"</p>
                    <div className="mt-4 pt-3 border-t border-blue-100 -mx-5 -mb-5 px-5 pb-5 rounded-b-2xl" style={{ background: "rgba(219,234,254,0.25)" }}>
                      <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <MessageSquare size={12} /> Feedback Dosen AI
                      </p>
                      <p className="text-slate-500 text-xs leading-relaxed">{q.feedback}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Riwayat;