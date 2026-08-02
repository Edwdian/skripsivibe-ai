import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import {
  Trophy,
  Brain,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Percent,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from "lucide-react";

import { saveSimulation, getUserSimulations } from "../services/apiSimulations";
import { auth } from "../firebase/config";

export default function DashboardHasil() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sudahDisimpan, setSudahDisimpan] = useState(false);
  
  const sudahSimpanRef = useRef(location.state?.sudahDisimpan === true);

  // ==========================================
  // STATE UNTUK PAGINATION FEEDBACK (PER HALAMAN)
  // ==========================================
  const ITEMS_PER_PAGE = 3;
  const [pageIndex, setPageIndex] = useState({
    unggul: 0,
    lemah: 0,
    strategi: 0
  });

  const handleNextPage = (section, totalPages) => {
    setPageIndex((prev) => ({
      ...prev,
      [section]: Math.min(prev[section] + 1, totalPages - 1)
    }));
  };

  const handlePrevPage = (section) => {
    setPageIndex((prev) => ({
      ...prev,
      [section]: Math.max(prev[section] - 1, 0)
    }));
  };

  // ==========================================
  // 1. TANGKAP DATA DARI HALAMAN UJIAN
  // ==========================================
  const rawHasilAI = location.state?.hasilAI || {};
  const dataHuggingFace = rawHasilAI.evaluasi_ai || {};

  const transkrip = location.state?.transkrip || {
    presentasi_transcript: "Transkrip tidak ditemukan.",
    jawaban_1: "-",
    jawaban_2: "-",
    jawaban_3: "-"
  };

  const hasilQnaData = location.state?.hasilQna?.data || {};
  const qnaList = hasilQnaData.evaluasi_qna || [
    { soal: "Pertanyaan 1 tidak terdeteksi", status: "-", feedback: "Tidak ada data evaluasi." },
    { soal: "Pertanyaan 2 tidak terdeteksi", status: "-", feedback: "Tidak ada data evaluasi." },
    { soal: "Pertanyaan 3 tidak terdeteksi", status: "-", feedback: "Tidak ada data evaluasi." }
  ];
  
  const qnaSummary = hasilQnaData.qna_summary || {
    skor_rata_rata: 0,
    keunggulan: [],
    kelemahan: [],
    strategi: []
  };

  // 🔥 MENGAMBIL Teks FEEDBACK PRESENTASI GEMINI (TANPA SKOR LOGIKA)
  const evaluasiPresentasiGemini = hasilQnaData.evaluasi_presentasi || {};
  const feedbackPresentasiGemini = evaluasiPresentasiGemini.feedback || "";

  const isOutOfTopic = rawHasilAI.status_akhir && rawHasilAI.status_akhir.includes("TIDAK NYAMBUNG");
  
  // Ambil skor dinamis langsung dari backend
  let p_materi = Math.round(dataHuggingFace.skor_pemahaman_persen || 0);
  let status_paham = "Sangat Tidak Paham";

  if (isOutOfTopic) {
    status_paham = "Sangat Tidak Paham";
    p_materi = 15; // Fix skor minimum jika skripsi tidak nyambung
  } else {
    // Tentukan label UI berdasarkan rentang skor dinamis yang asli
    if (p_materi >= 85) {
      status_paham = "Sangat Paham";
    } else if (p_materi >= 70) {
      status_paham = "Paham";
    } else {
      status_paham = "Sangat Tidak Paham";
    }
  }

  // ==========================================
  // 3. PENENTUAN SKOR PERCAYA DIRI (100% COLAB / LSTM)
  // ==========================================
  // Komposisi 3 Level Percaya Diri
  const p_pede = Math.round(dataHuggingFace.skor_percaya_diri_persen || 0);
  let status_pede = "Tidak Percaya Diri";
  
  if (p_pede >= 80) status_pede = "Sangat Percaya Diri";
  else if (p_pede >= 60) status_pede = "Percaya Diri";
  else status_pede = "Tidak Percaya Diri";

  let skorQnaDariAPI = qnaSummary.skor_rata_rata || 0;

  if (skorQnaDariAPI === 0 && qnaList.length > 0) {
    let totalPoin = 0;
    let jumlahSoalValid = 0;

    qnaList.forEach(item => {
      const statusText = (item.status || "").toLowerCase();
      
      if (statusText.includes("benar")) {
        totalPoin += 100;
      } else if (statusText.includes("kurang")) {
        totalPoin += 50;
      } else if (statusText.includes("salah")) {
        totalPoin += 0;
      }

      // Hitung soal asalkan statusnya bukan default "-"
      if (statusText !== "-" && statusText !== "") {
        jumlahSoalValid++;
      }
    });

    if (jumlahSoalValid > 0) {
      skorQnaDariAPI = Math.round(totalPoin / jumlahSoalValid);
    }
  }

  // Batasi persentase agar maksimal 100% dan minimal 0%
  const p_qna = Math.min(100, Math.max(0, skorQnaDariAPI));

  // Kalkulasi Akhir
  const skor_presentasi = Math.round((p_materi * 0.6) + (p_pede * 0.4));
  const skor_akhir = Math.round((skor_presentasi * 0.6) + (p_qna * 0.4));

  // Pewarnaan Grade Berdasarkan Tema Aksen
  let grade_akhir = "E";
  let grade_color = "text-red-500";
  let grade_bg = "border-red-400 bg-red-50/50";

  if (skor_akhir >= 85) { grade_akhir = "A"; grade_color = "text-emerald-500"; grade_bg = "border-emerald-300 bg-emerald-50/50"; }
  else if (skor_akhir >= 80) { grade_akhir = "A-"; grade_color = "text-emerald-500"; grade_bg = "border-emerald-300 bg-emerald-50/50"; }
  else if (skor_akhir >= 75) { grade_akhir = "B+"; grade_color = "text-blue-500"; grade_bg = "border-blue-300 bg-blue-50/50"; }
  else if (skor_akhir >= 70) { grade_akhir = "B"; grade_color = "text-blue-500"; grade_bg = "border-blue-300 bg-blue-50/50"; }
  else if (skor_akhir >= 65) { grade_akhir = "C+"; grade_color = "text-slate-600"; grade_bg = "border-slate-300 bg-slate-50/50"; } 
  else if (skor_akhir >= 60) { grade_akhir = "C"; grade_color = "text-slate-600"; grade_bg = "border-slate-300 bg-slate-50/50"; }
  else { grade_akhir = "D"; grade_color = "text-red-500"; grade_bg = "border-red-400 bg-red-50/50"; }

  const getDynamicFeedback = () => {
    let presUnggul = [];
    let presLemah = [];

    // Mengelompokkan teks feedback Gemini berdasarkan skor materi Colab
    if (feedbackPresentasiGemini) {
      if (p_materi >= 70) {
        presUnggul.push(`[Catatan Presentasi] ${feedbackPresentasiGemini}`);
      } else {
        presLemah.push(`[Catatan Presentasi] ${feedbackPresentasiGemini}`);
      }
    }

    const formatData = (arr, labelSesi) => arr.map(text => ({ source: labelSesi, text }));
    const filterValidQna = (arr) => (arr || []).filter(item => item && !item.includes("Belum ada data"));

    return { 
      unggul: [
        ...formatData(presUnggul, "Presentasi"), 
        ...formatData(filterValidQna(qnaSummary.keunggulan), "QnA")
      ], 
      lemah: [
        ...formatData(presLemah, "Presentasi"), 
        ...formatData(filterValidQna(qnaSummary.kelemahan), "QnA")
      ], 
      strategi: [
        ...formatData(filterValidQna(qnaSummary.strategi), "QnA")
      ] 
    };
  };

  const evaluasiGabungan = getDynamicFeedback();

  const totalPagesUnggul = Math.ceil(evaluasiGabungan.unggul.length / ITEMS_PER_PAGE);
  const totalPagesLemah = Math.ceil(evaluasiGabungan.lemah.length / ITEMS_PER_PAGE);
  const totalPagesStrategi = Math.ceil(evaluasiGabungan.strategi.length / ITEMS_PER_PAGE);

  const displayedUnggul = evaluasiGabungan.unggul.slice(pageIndex.unggul * ITEMS_PER_PAGE, (pageIndex.unggul + 1) * ITEMS_PER_PAGE);
  const displayedLemah = evaluasiGabungan.lemah.slice(pageIndex.lemah * ITEMS_PER_PAGE, (pageIndex.lemah + 1) * ITEMS_PER_PAGE);
  const displayedStrategi = evaluasiGabungan.strategi.slice(pageIndex.strategi * ITEMS_PER_PAGE, (pageIndex.strategi + 1) * ITEMS_PER_PAGE);

  useEffect(() => {
    if (!location.state?.hasilAI) return;
    if (sudahDisimpan) return;

    const simpanHasil = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      sudahSimpanRef.current = true;

      const judulFile = window.fileSkripsiNama || "Simulasi Skripsi";
      const durasiDetik = location.state?.durasiTotal || 0;

      try {
        const dataTersimpan = await getUserSimulations(currentUser.uid);
        const sudahPernahDisimpan = dataTersimpan.some(
          (s) => 
            String(s.nilai) === String(skor_akhir) && 
            s.durasi === durasiDetik &&
            s.p_materi === p_materi
        );

        if (sudahPernahDisimpan) {
          setSudahDisimpan(true);
          return; 
        }

        await saveSimulation({
          uid: currentUser.uid,
          judul: judulFile,
          nilai: String(skor_akhir),
          grade: grade_akhir,
          feedback:
            qnaSummary.keunggulan?.[0] ||
            evaluasiGabungan.unggul?.[0]?.text ||
            "Simulasi selesai.",
          mode: "AI Killer",
          durasi: durasiDetik,

          p_materi: p_materi,
          p_pede: p_pede,
          p_qna: p_qna,
          skor_presentasi: skor_presentasi,
          status_paham: status_paham,
          status_pede: status_pede,
          evaluasi: {
            unggul: evaluasiGabungan.unggul,
            lemah: evaluasiGabungan.lemah,
            strategi: evaluasiGabungan.strategi,
          },
          qnaList: qnaList,
        });
        setSudahDisimpan(true);

        navigate(location.pathname, { 
          state: { ...location.state, sudahDisimpan: true }, 
          replace: true 
        });
        } catch (err) {
        sudahSimpanRef.current = false;
        console.error("Gagal menyimpan hasil:", err);
      }
    };

    simpanHasil();
  }, []); 

  if (!location.state?.hasilAI) {
    return <Navigate to="/dashboard-user" replace />;
  }

  return (
    <div className="min-h-screen text-slate-800 font-sans relative overflow-hidden" 
         style={{ background: 'linear-gradient(160deg, #e0f2ff 0%, #cfe8ff 25%, #b9dcff 55%, #d9efff 100%)' }}>

      {/* BACKGROUND BLOBS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex: 0}}>
        <div className="absolute top-[-8%] left-[-5%] w-[520px] h-[520px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.40) 0%, transparent 70%)' }}></div>
        <div className="absolute top-[25%] right-[-8%] w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(125,211,252,0.32) 0%, transparent 70%)' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-10 space-y-8 pb-20 mt-6">

        {/* HEADER */}
        <div className="relative z-30 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-blue-500 text-sm font-bold uppercase tracking-[4px] mb-2">
              Hasil Simulasi Keseluruhan
            </p>
            <h1 className="relative z-30 text-4xl md:text-5xl font-black text-slate-800 pb-2">
              Evaluasi Sidang AI
            </h1>
          </div>
        </div>

        {/* CARD UTAMA NILAI */}
        <div className="rounded-[2rem] p-8 md:p-10 shadow-lg border border-blue-200/50" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4 text-slate-800">
                Grade Akhir Anda
              </h2>
              <p className="text-slate-500 max-w-2xl leading-relaxed text-sm md:text-base">
                Nilai akhir ini adalah hasil penggabungan proporsional antara skor performa presentasi (60%) dan tingkat akurasi Anda dalam menjawab sesi pertanyaan uji sidang (40%).
              </p>
            </div>

            <div className="relative flex flex-col items-center justify-center shrink-0">
              <div className={`relative w-36 h-36 rounded-full border-[6px] flex items-center justify-center shadow-lg backdrop-blur-sm ${grade_bg}`}>
                <h2 className={`text-6xl font-black ${grade_color}`}>
                  {grade_akhir}
                </h2>
              </div>
              <div className="mt-5 px-6 py-2.5 rounded-full shadow-sm flex items-center gap-2 border border-blue-100" style={{ background: 'rgba(255,255,255,0.9)' }}>
                <span className="text-slate-500 text-sm font-bold tracking-wide">Total Skor:</span>
                <span className={`text-lg font-black ${grade_color}`}>{skor_akhir}</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATISTIK UTAMA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Penguasaan Materi Card (100% Model Colab) */}
          <div className="rounded-3xl p-6 shadow-md border border-blue-200/50 hover:scale-[1.02] transition-transform" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}>
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-inner" style={{ background: 'rgba(219,234,254,0.9)', border: '1px solid rgba(147,197,253,0.3)' }}>
                <Brain className="text-blue-500" size={24} />
              </div>
              <span className={`px-3 py-1 text-[11px] font-bold tracking-wide rounded-full border mt-1 ${
                status_paham === 'Sangat Paham' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                status_paham === 'Paham' ? 'bg-white text-slate-500 border-slate-200' : 
                'bg-red-50 text-red-500 border-red-200'
              }`}>
                {status_paham}
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              Kesesuaian Materi
            </p>
            <h3 className="text-4xl font-black mt-2 text-slate-800">{p_materi}%</h3>
            <div className="mt-4 h-2 rounded-full overflow-hidden bg-blue-100/50">
              <div className="h-full rounded-full" style={{ width: `${p_materi}%`, background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)' }} />
            </div>
          </div>

          {/* Kepercayaan Diri Card (100% Model Colab) */}
          <div className="rounded-3xl p-6 shadow-md border border-blue-200/50 hover:scale-[1.02] transition-transform" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}>
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-inner" style={{ background: 'rgba(219,234,254,0.9)', border: '1px solid rgba(147,197,253,0.3)' }}>
                <Trophy className="text-blue-500" size={24} />
              </div>
              <span className={`px-3 py-1 text-[11px] font-bold tracking-wide rounded-full border mt-1 ${
                status_pede === 'Sangat Percaya Diri' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                status_pede === 'Percaya Diri' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                'bg-red-50 text-red-500 border-red-200'
              }`}>
                {status_pede}
              </span>
            </div>
            <p className="text-slate-500 text-sm">Skor Percaya Diri</p>
            <h3 className="text-4xl font-black mt-2 text-slate-800">{p_pede}%</h3>
            <div className="mt-4 h-2 bg-blue-100/50 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${p_pede}%`, background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)' }} />
            </div>
          </div>

          {/* Akurasi Jawaban QnA Card */}
          <div className="rounded-3xl p-6 shadow-md border border-blue-200/50 hover:scale-[1.02] transition-transform" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-[0_4px_15px_rgba(59,130,246,0.3)]" style={{ background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)' }}>
              <Percent className="text-white" size={24} />
            </div>
            <p className="text-slate-500 text-sm">Akurasi Jawaban QnA</p>
            <h3 className="text-4xl font-black mt-2 text-slate-800">{p_qna}%</h3>
            <div className="mt-4 h-2 bg-blue-100/50 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${p_qna}%`, background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)' }} />
            </div>
          </div>
        </div>

        {/* PAPAN INFORMASI SKEMA PENILAIAN AI */}
        <div className="rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm border border-blue-200/50" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-blue-50 text-blue-500 p-2.5 rounded-xl shrink-0 border border-blue-100">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 mb-1">Skema Regulasi Penilaian Konteks AI:</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="font-bold text-emerald-500">Sangat Paham:</span> 85-100% |  
              <span className="font-bold text-blue-500 ml-2">Paham:</span> 70-84% |  
              <span className="font-bold text-red-500 ml-2">Sangat Tidak Paham:</span> &lt; 70%. <br className="hidden md:block"/>
            </p>
          </div>
        </div>

        {/* BLOK FEEDBACK KESELURUHAN DENGAN PAGINATION (HALAMAN) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          
          {/* Keunggulan */}
          <div className="rounded-3xl p-6 shadow-sm border border-blue-200/50 flex flex-col" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: 'rgba(219,234,254,0.7)', border: '1px solid rgba(147,197,253,0.3)' }}>
                <ShieldCheck className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Keunggulan</p>
                <h3 className="text-lg font-black text-slate-800">Yang Sudah Bagus</h3>
              </div>
            </div>
            
            <div className="space-y-3 flex-1 mb-4">
              {displayedUnggul.map((item, index) => (
                <div key={index} className="flex items-start gap-3 rounded-2xl p-4 border border-blue-100/50 bg-white/60">
                  <ChevronRight className="text-blue-500 mt-0.5 shrink-0" size={16} />
                  <p className="text-slate-500 text-sm leading-relaxed">
                    <span className="font-bold text-blue-500 mr-1.5">[{item.source}]</span>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {totalPagesUnggul > 1 && (
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-blue-100">
                <button 
                  onClick={() => handlePrevPage('unggul')}
                  disabled={pageIndex.unggul === 0}
                  className="p-2 rounded-lg bg-white border border-blue-100 text-blue-500 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronUp size={18} />
                </button>
                <span className="text-[11px] font-bold text-slate-400 tracking-wide">
                  HAL {pageIndex.unggul + 1} / {totalPagesUnggul}
                </span>
                <button 
                  onClick={() => handleNextPage('unggul', totalPagesUnggul)}
                  disabled={pageIndex.unggul === totalPagesUnggul - 1}
                  className="p-2 rounded-lg bg-white border border-blue-100 text-blue-500 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Evaluasi / Kelemahan */}
          <div className="rounded-3xl p-6 shadow-sm border border-blue-200/50 flex flex-col" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: 'rgba(241,245,249,0.7)', border: '1px solid rgba(203,213,225,0.5)' }}>
                <AlertTriangle className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Evaluasi</p>
                <h3 className="text-lg font-black text-slate-800">Perlu Ditingkatkan</h3>
              </div>
            </div>

            <div className="space-y-3 flex-1 mb-4">
              {displayedLemah.map((item, index) => (
                <div key={index} className="flex items-start gap-3 rounded-2xl p-4 border border-slate-100 bg-white/60">
                  <ChevronRight className="text-slate-400 mt-0.5 shrink-0" size={16} />
                  <p className="text-slate-500 text-sm leading-relaxed">
                    <span className={`font-bold mr-1.5 ${item.text.includes('Peringatan Dosen AI') ? 'text-red-500' : 'text-slate-600'}`}>[{item.source}]</span>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {totalPagesLemah > 1 && (
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                <button 
                  onClick={() => handlePrevPage('lemah')}
                  disabled={pageIndex.lemah === 0}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronUp size={18} />
                </button>
                <span className="text-[11px] font-bold text-slate-400 tracking-wide">
                  HAL {pageIndex.lemah + 1} / {totalPagesLemah}
                </span>
                <button 
                  onClick={() => handleNextPage('lemah', totalPagesLemah)}
                  disabled={pageIndex.lemah === totalPagesLemah - 1}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Strategi */}
          <div className="rounded-3xl p-6 shadow-sm border border-blue-200/50 flex flex-col" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: 'rgba(219,234,254,0.7)', border: '1px solid rgba(147,197,253,0.3)' }}>
                <Sparkles className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Strategi</p>
                <h3 className="text-lg font-black text-slate-800">Tingkatkan Nilai</h3>
              </div>
            </div>

            <div className="space-y-3 flex-1 mb-4">
              {displayedStrategi.map((item, index) => (
                <div key={index} className="flex items-start gap-3 rounded-2xl p-4 border border-blue-100/50 bg-white/60">
                  <ChevronRight className="text-blue-500 mt-0.5 shrink-0" size={16} />
                  <p className="text-slate-500 text-sm leading-relaxed">
                    <span className="font-bold text-blue-500 mr-1.5">[{item.source}]</span>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {totalPagesStrategi > 1 && (
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-blue-100">
                <button 
                  onClick={() => handlePrevPage('strategi')}
                  disabled={pageIndex.strategi === 0}
                  className="p-2 rounded-lg bg-white border border-blue-100 text-blue-500 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronUp size={18} />
                </button>
                <span className="text-[11px] font-bold text-slate-400 tracking-wide">
                  HAL {pageIndex.strategi + 1} / {totalPagesStrategi}
                </span>
                <button 
                  onClick={() => handleNextPage('strategi', totalPagesStrategi)}
                  disabled={pageIndex.strategi === totalPagesStrategi - 1}
                  className="p-2 rounded-lg bg-white border border-blue-100 text-blue-500 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* LIST PERTANYAAN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          {qnaList.map((item, index) => {
            const status = item.status?.toLowerCase() || "";
            const isBenar = status.includes("benar");
            const isKurang = status.includes("kurang");
            
            return (
              <div key={index} className="rounded-3xl p-6 shadow-sm border border-blue-200/50 flex flex-col relative transition-all hover:-translate-y-1 hover:shadow-md" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}>
                
                <div className="absolute top-6 right-6">
                  <span className={`px-4 py-1.5 text-[10px] font-bold tracking-wide uppercase rounded-full border shadow-sm ${
                    isBenar ? 'bg-emerald-50 text-emerald-500 border-emerald-200' :
                    isKurang ? 'bg-slate-50 text-slate-500 border-slate-200' :
                    'bg-red-50 text-red-500 border-red-200'
                  }`}>
                    {item.status || "Gagal Menilai"}
                  </span>
                </div>
                
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-4">Pertanyaan {index + 1}</p>
                
                <div className="mb-6 pr-20">
                  <p className="text-slate-800 font-bold text-sm leading-relaxed">
                    "{item.soal}"
                  </p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-blue-100 -mx-6 -mb-6 p-6 rounded-b-3xl" style={{ background: 'rgba(219,234,254,0.3)' }}>
                  <p className="text-blue-500 text-[11px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MessageSquare size={14} /> Feedback Dosen AI
                  </p>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {item.feedback}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      {/* TOMBOL AKSI BAWAH */}
        <div className="flex gap-3 pt-4 justify-end">
          <button
            onClick={() => navigate("/dashboard-user")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-700 hover:bg-white/90 transition hover:scale-105 border border-blue-200/50"
            style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}
          >
            <ChevronRight size={18} />
            Kembali ke Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}