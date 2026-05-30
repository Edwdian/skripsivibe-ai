import React from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import {
  Trophy,
  Brain,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Download,
} from "lucide-react";

export default function DashboardHasil() {
  const location = useLocation();
  const navigate = useNavigate();

  // Tangkap data hasil AI dari halaman ujian, berikan nilai default jika kosong
  const hasilAI = location.state?.hasilAI || {
    kesesuaian_skripsi_persen: 0,
    skor_percaya_diri_persen: 0,
    status_psikologis: "Gugup / Panik",
    status_pemahaman: "Gak Paham"
  };

  // Tangkap data transkrip teks mentah untuk fitur cek/download transkrip
  const transkrip = location.state?.transkrip || {
    presentasi_transcript: "Transkrip tidak ditemukan.",
    jawaban_1: "-",
    jawaban_2: "-",
    jawaban_3: "-"
  };

  // ==========================================
  // 🎓 LOGIKA KONVERSI NILAI AKADEMIS
  // ==========================================
  const raw_materi = hasilAI.kesesuaian_skripsi_persen;
  const status_paham = hasilAI.status_pemahaman;
  const status_pede = hasilAI.status_psikologis;
  const p_pede = Math.round(hasilAI.skor_percaya_diri_persen);

  let p_materi = 0;

  // Pemetaan metrik agar sesuai dengan standar psikologi penilaian akademis manusia
  if (status_paham.includes("TIDAK NYAMBUNG")) {
    p_materi = Math.min(Math.round(raw_materi), 20); 
  } else if (status_paham === "Sangat Paham") {
    p_materi = 85 + Math.min(Math.round(raw_materi), 15); 
  } else if (status_paham === "Lumayan Paham") {
    p_materi = 70 + Math.min(Math.round(raw_materi), 14); 
  } else {
    p_materi = 40 + Math.min(Math.round(raw_materi), 29); 
  }

  // ==========================================
  // 💾 FUNGSI DOWNLOAD TRANSKRIP (.TXT)
  // ==========================================
  const handleDownloadTranscript = () => {
    const textContent = `=== TRANSKRIP SIMULASI SIDANG AI ===\n\n` +
      `[PRESENTASI MAHASISWA]\n${transkrip.presentasi_transcript}\n\n` +
      `[JAWABAN QNA 1]\n${transkrip.jawaban_1}\n\n` +
      `[JAWABAN QNA 2]\n${transkrip.jawaban_2}\n\n` +
      `[JAWABAN QNA 3]\n${transkrip.jawaban_3}\n`;

    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = "Transkrip_Sidang_Skripsivibe.txt";
    document.body.appendChild(link);
    link.click(); 
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // LOGIKA GRADING & FEEDBACK OTOMATIS
  // ==========================================
  const getDynamicFeedback = () => {
    let grade = "C";
    let unggul = [];
    let lemah = [];
    let strategi = [];

    if (status_paham.includes("TIDAK NYAMBUNG")) {
      grade = "E";
      unggul = ["Keberanian untuk mencoba presentasi dan menghadapi simulasi."];
      lemah = [
        "Materi presentasi melenceng jauh dari isi dokumen skripsi yang diunggah.",
        "Pemahaman konteks penelitian secara keseluruhan sangat kurang."
      ];
      strategi = [
        "Baca ulang dan pahami inti sari dari Bab 1 hingga Bab 3 draft skripsi Anda.",
        "Gunakan kata kunci utama penelitian secara konsisten saat memaparkan materi."
      ];
      return { grade, unggul, lemah, strategi };
    }

    if (status_paham === "Sangat Paham") {
      if (status_pede === "Percaya Diri") {
        grade = "A";
        unggul = [
          "Penyampaian materi sangat jelas, runtut, dan terstruktur dengan baik.",
          "Tingkat kepercayaan diri sangat tinggi, menunjukkan penguasaan materi yang matang.",
          "Kosakata dan istilah ilmiah yang digunakan sangat relevan dengan isi penelitian."
        ];
        lemah = ["Secara keseluruhan performa sudah sangat baik, tinggal menjaga konsistensi artikulasi."];
        strategi = ["Perbanyak simulasi tanya jawab spontan untuk mempertahankan nilai saat sidang asli."];
      } else {
        grade = "B+";
        unggul = [
          "Penguasaan materi dan landasan teori di dalam skripsi sudah sangat baik.",
          "Penjelasan yang diberikan berbobot, ilmiah, dan berdasar pada data."
        ];
        lemah = [
          "Terdeteksi gestur, keraguan, atau nada bicara yang gugup di beberapa bagian penting.",
          "Kecemasan berisiko mengurangi keyakinan dewan penguji terhadap paparan Anda."
        ];
        strategi = [
          "Latihan berbicara mandiri atau merekam presentasi untuk mengevaluasi intonasi.",
          "Atur ritme napas sebelum mulai berbicara untuk menstabilkan fokus dan ketenangan."
        ];
      }
    } 
    else if (status_paham === "Lumayan Paham") {
      if (status_pede === "Percaya Diri") {
        grade = "B";
        unggul = [
          "Pembawaan tenang, meyakinkan, serta memiliki artikulasi presentasi yang baik.",
          "Materi inti berhasil tersampaikan meskipun terdapat beberapa celah pada detail teori."
        ];
        lemah = [
          "Kedalaman pemahaman metodologi penelitian masih terasa berada di permukaan.",
          "Pemaparan terlalu meluas dan kurang fokus pada poin hasil penelitian utama."
        ];
        strategi = [
          "Pertahankan rasa percaya diri Anda, lalu tingkatkan pemahaman pada poin-poin kunci skripsi.",
          "Fokuskan perhatian pada penguatan argumentasi di Bab Metode dan Hasil Penelitian."
        ];
      } else {
        grade = "C+";
        unggul = ["Poin dasar materi penelitian berhasil disampaikan meskipun dalam kondisi tertekan."];
        lemah = [
          "Tingkat kepercayaan diri rendah yang memicu terjadinya pengulangan kata.",
          "Penguasaan materi masih terbatas pada hafalan naskah dasar presentasi."
        ];
        strategi = [
          "Gunakan catatan kecil berisi poin-poin matriks penting sebagai panduan agar tidak kehilangan arah bicaranya.",
          "Sering melakukan simulasi presentasi mandiri guna membangun kelancaran berbicara."
        ];
      }
    } 
    else {
      if (status_pede === "Percaya Diri") {
        grade = "C-";
        unggul = ["Pembawaan santai, berani, dan tidak menunjukkan rasa takut di hadapan sistem penguji."];
        lemah = [
          "Penyampaian materi cenderung mengandalkan improvisasi tanpa dasar naskah skripsi yang valid.",
          "Gagal menjelaskan esensi serta urgensi utama dari topik penelitian yang diangkat."
        ];
        strategi = [
          "Hindari melakukan spekulasi atau mengarang argumen secara bebas saat sidang skripsi.",
          "Bedah kembali korelasi antara latar belakang masalah dengan kesimpulan penelitian Anda."
        ];
      } else {
        grade = "D";
        unggul = ["Mampu menyelesaikan seluruh rangkaian tahapan simulasi presentasi hingga akhir."];
        lemah = [
          "Tingkat kecemasan yang tinggi merusak konsentrasi dan alur logika berpikir.",
          "Tidak menunjukkan penguasaan atau pemahaman yang memadai terhadap materi skripsi sendiri."
        ];
        strategi = [
          "Sangat disarankan untuk mempelajari ulang draf penelitian secara komprehensif.",
          "Lakukan persiapan mental yang matang sebelum mencoba kembali tahapan simulasi ini."
        ];
      }
    }

    return { grade, unggul, lemah, strategi };
  };

  const evaluasi = getDynamicFeedback();

  return (
    <div className="min-h-screen bg-[#f4f8ff] text-[#0f172a] relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #eef7ff 0%, #dceeff 25%, #cfe7ff 55%, #edf7ff 100%)' }}>

      {/* BACKGROUND DEKORASI */}
      <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-blue-400/20 blur-[120px]" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-cyan-300/20 blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-10 space-y-8">

        {/* HEADER */}
        <div className="relative z-30 mb-8">
          <p className="text-blue-500 text-sm font-bold uppercase tracking-[4px] mb-2">
            Hasil Simulasi
          </p>
          <h1 className="relative z-30 text-4xl md:text-5xl font-black bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent pb-2">
            Evaluasi Sidang AI
          </h1>
        </div>

        {/* CARD UTAMA NILAI */}
        <div className="bg-white/80 border border-blue-100 rounded-[32px] p-8 backdrop-blur-2xl shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-slate-900">
                Hasil Simulasi Anda
              </h2>
              <p className="text-slate-500 max-w-2xl leading-relaxed text-sm">
                Berikut hasil evaluasi AI berdasarkan performa presentasi,
                komunikasi, penguasaan materi, dan alur menjawab pertanyaan
                selama simulasi sidang berlangsung.
              </p>
            </div>

            {/* SCORE DISPLAY */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-blue-400 blur-3xl opacity-20" />
              <div className={`relative w-40 h-40 rounded-full border-[6px] flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.25)] ${
                evaluasi.grade.includes('A') || evaluasi.grade.includes('B') 
                ? 'border-emerald-400 bg-emerald-50' 
                : evaluasi.grade.includes('C') 
                ? 'border-yellow-400 bg-yellow-50' 
                : 'border-red-400 bg-red-50'
              }`}>
                <div className="text-center">
                  <p className={`text-sm mb-1 font-semibold ${
                    evaluasi.grade.includes('A') || evaluasi.grade.includes('B') ? 'text-emerald-500' : evaluasi.grade.includes('C') ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    Grade
                  </p>
                  <h2 className="text-6xl font-black text-slate-900">
                    {evaluasi.grade}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATISTIK UTAMA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Penguasaan Materi Card */}
          <div className="bg-white/80 border border-blue-100 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-5">
                <Brain className="text-blue-600" size={28} />
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border mt-2 ${
                status_paham === 'Sangat Paham' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                status_paham === 'Lumayan Paham' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                'bg-red-100 text-red-700 border-red-200'
              }`}>
                {status_paham}
              </span>
            </div>
            <p className="text-slate-500 text-sm">Penguasaan Materi</p>
            <h3 className="text-4xl font-black mt-2 text-slate-900">{p_materi}%</h3>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${p_materi}%` }} />
            </div>
          </div>

          {/* Kepercayaan Diri Card */}
          <div className="bg-white/80 border border-blue-100 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center mb-5">
                <Trophy className="text-cyan-600" size={28} />
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border mt-2 ${
                status_pede === 'Percaya Diri' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-orange-100 text-orange-700 border-orange-200'
              }`}>
                {status_pede}
              </span>
            </div>
            <p className="text-slate-500 text-sm">Skor Percaya Diri (Model LSTM)</p>
            <h3 className="text-4xl font-black mt-2 text-slate-900">{p_pede}%</h3>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${p_pede}%` }} />
            </div>
          </div>

          {/* Durasi Latihan Card */}
          <div className="bg-white/80 border border-blue-100 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center mb-5">
              <Clock className="text-sky-600" size={28} />
            </div>
            <p className="text-slate-500 text-sm">Durasi Presentasi</p>
            <h3 className="text-4xl font-black mt-2 text-slate-900">08:45</h3>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-[80%] bg-gradient-to-r from-sky-500 to-blue-500 rounded-full" />
            </div>
          </div>
        </div>

        {/* PAPAN INFORMASI SKEMA PENILAIAN AI (UX COMPLIANCE) */}
        <div className="bg-blue-50/80 border border-blue-200/60 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-xl shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 mb-1">Skema Regulasi Penilaian Konteks AI:</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="font-semibold text-emerald-600">Sangat Paham:</span> rentang nilai 85-100% |  
              <span className="font-semibold text-blue-600 ml-2">Lumayan Paham:</span> rentang nilai 70-84% |  
              <span className="font-semibold text-red-500 ml-2">Gak Paham:</span> nilai di bawah 70%. <br className="hidden md:block"/>
              (Kombinasi kalkulasi matriks NLP diperoleh melalui pembobotan klasifikasi struktural kalimat (Model LSTM) dan nilai indeks kecocokan naskah ilmiah (TF-IDF Cosine)).
            </p>
          </div>
        </div>

        {/* BLOK FEEDBACK DETAIL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Keunggulan */}
          <div className="bg-white/80 border border-blue-100 rounded-3xl p-6 shadow-lg flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-500 font-semibold">Keunggulan</p>
                <h3 className="text-xl font-bold text-slate-900">Yang Sudah Bagus</h3>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              {evaluasi.unggul.map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <ChevronRight className="text-blue-500 mt-1 shrink-0" size={18} />
                  <p className="text-slate-600 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Kelemahan */}
          <div className="bg-white/80 border border-blue-100 rounded-3xl p-6 shadow-lg flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-cyan-500 font-semibold">Evaluasi</p>
                <h3 className="text-xl font-bold text-slate-900">Perlu Ditingkatkan</h3>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              {evaluasi.lemah.map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-cyan-50 rounded-2xl p-4 border border-cyan-100">
                  <ChevronRight className="text-cyan-500 mt-1 shrink-0" size={18} />
                  <p className="text-slate-600 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strategi */}
          <div className="bg-white/80 border border-blue-100 rounded-3xl p-6 shadow-lg flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center shrink-0">
                <Sparkles className="text-sky-600" />
              </div>
              <div>
                <p className="text-sm text-sky-500 font-semibold">Strategi</p>
                <h3 className="text-xl font-bold text-slate-900">Tingkatkan Nilai</h3>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              {evaluasi.strategi.map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-sky-50 rounded-2xl p-4 border border-sky-100">
                  <ChevronRight className="text-sky-500 mt-1 shrink-0" size={18} />
                  <p className="text-slate-600 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="flex gap-3 pt-2 justify-end">

          {/* Download */}
          <button
            onClick={handleDownloadTranscript}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            <Download size={18} />
            Download Hasil Transkip
          </button>

          {/* Dashboard */}
          <button
            onClick={() => navigate("/dashboard-user")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 transition"
          >
            <ChevronRight size={18} />
            Kembali Ke Dashboard
          </button>

        </div>

      </div>
    </div>
  );
}