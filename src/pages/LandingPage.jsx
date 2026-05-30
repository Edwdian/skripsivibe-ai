import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, UploadCloud, Mic, MessageSquare, BarChart3, Plus, Minus } from 'lucide-react';
import { auth } from "../firebase/config";

const faqData = [
  {
    question: "Apa itu Skripsivibe AI?",
    answer: "Skripsivibe AI adalah platform simulasi sidang skripsi pertama di Indonesia. Kamu bisa berlatih presentasi dengan menyalakan kamera dan menghadapi dosen penguji AI yang merespons jawabanmu secara real-time menggunakan suara."
  },
  {
    question: "Bagaimana cara kerja simulasi sidangnya?",
    answer: "Cukup unggah draft skripsi kamu dalam format PDF. Kamu akan diberikan waktu 10 menit untuk presentasi materi melalui video. Setelah itu, avatar dosen AI akan memberikan pertanyaan kritis berdasarkan isi skripsi dan presentasimu."
  },
  {
    question: "Apakah dosen AI-nya bisa berbicara langsung seperti manusia?",
    answer: "Ya! Dosen AI kami dilengkapi teknologi pengenalan dan sintesis suara tingkat lanjut. Kamu tidak perlu mengetik; cukup berbicara seperti biasa, dan dosen AI akan membalas secara interaktif layaknya sidang online di Google Meet atau Zoom."
  },
  {
    question: "Apakah file skripsi dan data saya aman?",
    answer: "Sangat aman. File PDF yang kamu unggah hanya diproses sementara di dalam memori server untuk dibaca oleh AI selama sesi simulasi berlangsung, dan akan otomatis terhapus setelah kamu menutup sesi. Kami tidak menyimpan atau membagikan datamu."
  },
  {
    question: "Apakah ada penilaian setelah simulasi selesai?",
    answer: "Tentu. Setelah sesi tanya jawab berakhir, kamu akan diarahkan ke Dashboard Hasil. Di sana, AI akan memberikan metrik penilaian komprehensif, estimasi nilai (A/B/C/D), serta saran perbaikan agar kamu lebih siap saat sidang sungguhan."
  },
  {
    question: "Apakah Skripsivibe AI ini gratis?",
    answer: "Kami memberikan 1x kuota simulasi gratis untuk setiap mahasiswa yang baru mendaftar agar kamu bisa merasakan langsung pengalaman sidang bersama AI. Untuk latihan tanpa batas dan membuka 'Mode Dosen Killer', kamu dapat berlangganan paket premium."
  }
];

const testimonialsRow1 = [
  { quote: "Penyelamat semester akhir! Fitur format otomatisnya menghemat waktu banget, ga perlu pusingin margin dll.", name: "Santoso", role: "Mahasiswa Manajemen, UGM" },
  { quote: "Awalnya skeptis, tapi pas coba fitur cari judul, langsung dapet ide yang di-approve dosen pembimbing.", name: "Dinda Putri", role: "Mahasiswa Hukum, Unpad" },
  { quote: "Gila sih, fitur simulasi sidangnya ngebantu ngelatih mental sebelum hari H. Dosen AI pertanyaannya tajam!", name: "Rian Saputra", role: "Mahasiswa Informatika, ITB" },
  { quote: "Sangat membantu untuk persiapan sidang. Feedback dari AI-nya detail banget dan ngasih tau bagian mana yang kurang jelas.", name: "Amanda Lestari", role: "Mahasiswa Komunikasi, UI" }
];

const testimonialsRow2 = [
  { quote: "Tampilan editornya bersih dan fokus. Bikin nulis skripsi jadi ga terasa berat beban mentalnya.", name: "Bima Pratama", role: "Mahasiswa DKV, Binus" },
  { quote: "Support team-nya responsif banget kalau ada kendala. Aplikasi buatan lokal rasa internasional.", name: "Nadia Utami", role: "Mahasiswa Hubungan Internasional, UMY" },
  { quote: "Citation managernya life saver banget. Dulu pusing mikirin format, sekarang sekali klik beres semua.", name: "Ahmad Fauzi", role: "Mahasiswa Teknik, ITS" },
  { quote: "Fitur parafrasenya natural banget, ga kelihatan kayak robot. Plagiasi langsung turun drastis!", name: "Kevin Sanjaya", role: "Mahasiswa Sastra, Undip" }
];

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const revealRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!revealRef.current) return;
      const rect = revealRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const startReveal = windowHeight * 0.85;
      const endReveal = windowHeight * 0.3;
      let progress = (startReveal - rect.top) / (startReveal - endReveal);
      progress = Math.max(0, Math.min(1, progress));
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

    const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

    const handleProtectedRoute = (path) => {
    const user = localStorage.getItem("user");

    if (user) {
      window.location.href = path;
    } else {
      window.location.href = "/auth";
    }
  };

  const statementWords = "Skripsivibe AI bukan cuma tools biasa. Ini adalah copilot yang nemenin kamu dari awal sampai sidang, tanpa menggantikan peran kamu sebagai peneliti sejati.".split(" ");

  return (
    <div
      className="min-h-screen text-slate-800 font-sans overflow-x-hidden selection:bg-blue-200 selection:text-blue-900 flex flex-col"
      style={{
        background:
          'linear-gradient(160deg, #e0f2ff 0%, #cfe8ff 25%, #b9dcff 55%, #d9efff 100%)'
      }}
    >

      <style dangerouslySetInnerHTML={{__html: `
        html {scroll-behavior: smooth;}
        @keyframes float {
          0% { transform: translateY(0px) rotate(var(--rot)); }
          50% { transform: translateY(-20px) rotate(calc(var(--rot) + 5deg)); }
          100% { transform: translateY(0px) rotate(var(--rot)); }
        }
        .animate-float-slow { animation: float 6s ease-in-out infinite; }
        .animate-float-fast { animation: float 4s ease-in-out infinite; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 40s linear infinite; }
        .animate-marquee-reverse { animation: marquee 40s linear infinite reverse; }
      `}} />

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex: 0}}>
        <div className="absolute top-[-8%] left-[-5%] w-[520px] h-[520px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.40) 0%, transparent 70%)' }}></div>
        <div className="absolute top-[25%] right-[-8%] w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(125,211,252,0.32) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-[5%] left-[5%] w-[450px] h-[450px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(191,219,254,0.42) 0%, transparent 70%)' }}></div>
        <div className="absolute top-[60%] left-[40%] w-[350px] h-[350px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(186,230,255,0.18) 0%, transparent 70%)' }}></div>
      </div>

      {/* NAVBAR */}
      <nav className="absolute top-10 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(12px)', border: '1px solid rgba(147,197,253,0.5)', boxShadow: '0 0 20px rgba(96,165,250,0.25)' }}>
                <div className="w-3.5 h-3.5 bg-gradient-to-tr from-blue-400 via-sky-400 to-cyan-300 rotate-45 rounded-[2px]"></div>
              </div>
              <span className="font-bold text-lg tracking-wide text-slate-800 hidden sm:block">Skripsivibe AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
              <button onClick={() => scrollToSection("fitur")} className="flex items-center gap-1 hover:text-blue-600 transition-colors"> Fitur </button>
              <button onClick={() => scrollToSection("kampus")} className="flex items-center gap-1 hover:text-blue-600 transition-colors"> Kampus </button>
              <a onClick={() => scrollToSection("testi")} className="cursor-pointer hover:text-blue-600 transition-colors"> Testimoni </a>
              <a onClick={() => scrollToSection("blog")} className="cursor-pointer hover:text-blue-600 transition-colors"> Blog </a>
            </div>
          </div>
          <div>
            <a href="/auth" className="inline-block text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all" style={{ background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)', boxShadow: '0 4px 15px rgba(59,130,246,0.35)' }}>
              Mulai Gratis
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <main className="relative pt-32 pb-16 px-6 z-10 flex flex-col items-center flex-grow">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(147,197,253,0.3) 0%, transparent 70%)' }}></div>

        {/* Announcement Pill */}
        <div className="mb-8 inline-flex items-center gap-3 px-5 py-1.5 rounded-full cursor-pointer text-xs md:text-sm transition-colors" style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(147,197,253,0.55)', color: '#475569' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
          <span className="font-semibold">Rilis Baru: Mode Dosen Killer</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span className="font-bold text-blue-500 flex items-center gap-1">Baca update →</span>
        </div>

        {/* Headline */}
        <h1 className="
          text-[3.2rem]
          sm:text-[4.5rem]
          md:text-[5.5rem]
          lg:text-[6.5rem]
          xl:text-[7rem]
          leading-[1.05]
          font-bold
          tracking-[-0.04em]
          text-center
          max-w-5xl
          relative
          z-20
          text-slate-800
          px-6
        ">
          Simulasi Sidang <br />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 50%, #38bdf8 100%)' }}>Tanpa Tegang</span>
        </h1>

        {/* Subheadline */}
        <p className="mt-8 text-lg md:text-xl text-slate-500 text-center max-w-2xl font-medium leading-relaxed z-20 mb-8">
          Latih mental dan materimu dengan AI yang didesain khusus menjadi dosen penguji. Hadapi pertanyaan tak terduga dan rasakan euforia lulus sidang skripsi.
        </p>

        {/* Left Floating */}
        <div className="absolute
          top-[16%]
          left-[2%]
          sm:left-[4%]
          md:left-[8%]
          lg:left-[14%]
          xl:left-[18%]
          z-10
          animate-float-slow
          pointer-events-none" 
          style={{"--rot": "-15deg"}}>
          <svg className="
            w-[40px]
            sm:w-[55px]
            md:w-[75px]
            lg:w-[100px]
            xl:w-[140px]
            h-auto
            opacity-50
            md:opacity-70
            xl:opacity-100
          "
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: "drop-shadow(0 10px 20px rgba(59,130,246,0.18))",
              opacity: 0.7,
            }}>
            <defs>
              <linearGradient id="cursorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#bfdbfe" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="cursorEdge" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#dbeafe" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
            <path d="M50 40 L160 100 L95 115 L80 180 Z" fill="url(#cursorGrad)" opacity="0.4" transform="translate(10, 15)"/>
            <path d="M40 30 L150 90 L85 105 L70 170 Z" fill="url(#cursorGrad)" stroke="url(#cursorEdge)" strokeWidth="3" strokeLinejoin="round" opacity="0.85"/>
          </svg>
        </div>

        {/* Right Floating */}
        <div className="absolute
          top-[22%]
          right-[2%]
          sm:right-[4%]
          md:right-[8%]
          lg:right-[14%]
          xl:right-[18%]
          z-10
          animate-float-fast
          pointer-events-none" 
          style={{"--rot": "10deg"}}>
          <svg className="
            w-[45px]
            sm:w-[60px]
            md:w-[80px]
            lg:w-[110px]
            xl:w-[150px]
            h-auto
            opacity-50
            md:opacity-70
            xl:opacity-100
          "
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: "drop-shadow(0 10px 20px rgba(14,165,233,0.18))",
              opacity: 0.7,
            }}>
            <defs>
              <linearGradient id="chatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="60%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="chatEdge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
            </defs>
            <path d="M40 50 C40 35 55 20 70 20 L160 20 C175 20 190 35 190 50 L190 120 C190 135 175 150 160 150 L100 150 L60 190 L60 150 C45 150 40 140 40 120 Z" fill="url(#chatGrad)" opacity="0.35" transform="translate(8, 12)"/>
            <path d="M30 40 C30 25 45 10 60 10 L150 10 C165 10 180 25 180 40 L180 110 C180 125 165 140 150 140 L90 140 L50 180 L50 140 C35 140 30 130 30 110 Z" fill="url(#chatGrad)" stroke="url(#chatEdge)" strokeWidth="2.5" strokeLinejoin="round" opacity="0.85"/>
          </svg>
        </div>
      </main>

      {/* HOW IT WORKS */}
      <section id="fitur" className="relative w-full flex flex-col items-center mt-16 overflow-visible z-10">

        {/* Ambient bridging gradient */}
        <div
          className="absolute -top-[250px] left-0 w-full h-[420px] pointer-events-none -z-10"
          style={{
            background:
              'linear-gradient(to bottom, transparent, rgba(191,219,254,0.45), rgba(219,234,254,0.9))',
          }}
        ></div>

        {/* Soft blue ambient glow */}
        <div
          className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-full h-[320px] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(96,165,250,0.22) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        ></div>

        {/* Main Container - Flat */}
        <div
          className="relative w-full flex flex-col items-center pt-32 pb-10 mt-[30px]"
          style={{
            background:
              'linear-gradient(180deg, rgba(215,232,255,0.96) 0%, rgba(240,248,255,1) 100%)',
            borderTopLeftRadius: '50% 180px',
            borderTopRightRadius: '50% 180px',
            borderTop: '1px solid rgba(96,165,250,0.22)',
            boxShadow:
              '0 -30px 80px rgba(59,130,246,0.08)',
          }}
        >

          {/* Floating Button */}
          <button
            onClick={() => handleProtectedRoute("/dashboard-ujian")}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 inline-block text-white px-8 py-3.5 rounded-xl text-base font-bold hover:scale-105 transition-all z-30"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
              boxShadow: '0 0 35px rgba(59,130,246,0.45)',
            }}
          >
            Get started
          </button>

          {/* Content */}
          <div className="max-w-6xl w-full px-6 mx-auto flex flex-col items-center text-center relative z-20 mt-4">

            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-slate-800">
              Cara Kerja{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                }}
              >
                Skripsivibe AI
              </span>
            </h2>

            <p className="text-slate-500 mb-16 max-w-2xl text-lg font-medium">
              Simulasi semirip aslinya, didesain untuk melatih mental dan penguasaan
              materi dari presentasi awal hingga evaluasi akhir.
            </p>

            {/* 4 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">

              {/* Card 1 */}
              <div className="rounded-3xl p-6 flex flex-col hover:scale-[1.02] transition-all duration-300 group" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(96,165,250,0.55)' }}>
                <div className="h-40 rounded-2xl mb-6 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'rgba(219,234,254,0.9)', border: '1px solid rgba(147,197,253,0.3)' }}>
                  <div className="w-20 h-20 border-2 border-dashed rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ borderColor: 'rgba(59,130,246,0.4)', background: 'rgba(191,219,254,0.7)' }}>
                    <UploadCloud className="text-blue-400" size={32} />
                  </div>
                  <div className="absolute bottom-3 text-[10px] text-slate-400 font-mono tracking-wider">drop_skripsi_final.pdf</div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full text-blue-500 flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(219,234,254,0.8)' }}>1</span>
                  Import Skripsi
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">Upload file PDF skripsi kamu. AI kami akan membedah latar belakang, metode, hingga kesimpulan dalam hitungan detik.</p>
              </div>

              {/* Card 2 */}
              <div className="rounded-3xl p-6 flex flex-col hover:scale-[1.02] transition-all duration-300 group" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(147,197,253,0.45)' }}>
                <div className="h-40 rounded-2xl mb-6 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'rgba(219,234,254,0.9)', border: '1px solid rgba(147,197,253,0.3)' }}>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-sm" style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(147,197,253,0.5)' }}>
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                    <span className="text-slate-700 font-mono font-bold text-lg tracking-wider">10:00</span>
                  </div>
                  <div className="absolute bottom-6 flex items-end gap-1.5 opacity-60">
                    <div className="w-1.5 h-4 bg-blue-400 rounded-full group-hover:h-8 transition-all duration-300"></div>
                    <div className="w-1.5 h-8 bg-blue-400 rounded-full group-hover:h-4 transition-all duration-300 delay-75"></div>
                    <div className="w-1.5 h-5 bg-sky-400 rounded-full group-hover:h-10 transition-all duration-300 delay-150"></div>
                    <div className="w-1.5 h-10 bg-sky-400 rounded-full group-hover:h-5 transition-all duration-300 delay-200"></div>
                    <div className="w-1.5 h-6 bg-blue-300 rounded-full group-hover:h-7 transition-all duration-300 delay-300"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full text-blue-500 flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(219,234,254,0.8)' }}>2</span>
                  Presentasi
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">Mulai pemaparanmu. Dosen AI mendengarkan secara real-time dan menyiapkan pertanyaan berdasarkan ucapanmu.</p>
              </div>

              {/* Card 3 */}
              <div className="rounded-3xl p-6 flex flex-col hover:scale-[1.02] transition-all duration-300 group" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(147,197,253,0.45)' }}>
                <div className="h-40 rounded-2xl mb-6 flex flex-col justify-center px-4 relative overflow-hidden" style={{ background: 'rgba(219,234,254,0.9)', border: '1px solid rgba(147,197,253,0.3)' }}>
                  <div className="w-full space-y-3 relative z-10">
                    <div className="w-10/12 h-10 rounded-2xl rounded-bl-none flex items-center px-3" style={{ background: 'rgba(226,232,240,0.9)', border: '1px solid rgba(203,213,225,0.6)' }}>
                      <div className="w-full h-2 bg-slate-300 rounded-full opacity-70"></div>
                    </div>
                    <div className="w-9/12 h-10 rounded-2xl rounded-br-none ml-auto flex items-center px-3" style={{ background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)' }}>
                      <div className="w-full h-2 bg-blue-200 rounded-full opacity-70"></div>
                    </div>
                  </div>
                  <MessageSquare className="absolute -right-4 -bottom-4 text-blue-200/40" size={100} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full text-blue-500 flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(219,234,254,0.8)' }}>3</span>
                  Tanya Jawab
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">Hadapi pertanyaan tajam dan kritis. Pilih mode santai untuk berlatih atau mode "Killer" untuk ujian mental sesungguhnya.</p>
              </div>

              {/* Card 4 */}
              <div className="rounded-3xl p-6 flex flex-col hover:scale-[1.02] transition-all duration-300 group" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(147,197,253,0.45)' }}>
                <div className="h-40 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden" style={{ background: 'rgba(219,234,254,0.9)', border: '1px solid rgba(147,197,253,0.3)' }}>
                  <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{ border: '6px solid rgba(186,230,255,0.6)' }}>
                    <div className="absolute inset-0 rounded-full border-[6px] border-emerald-400 border-l-transparent border-b-transparent -rotate-45 group-hover:rotate-0 transition-transform duration-700"></div>
                    <span className="text-2xl font-black text-slate-700">A-</span>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-1">
                    <div className="w-1.5 h-4 bg-emerald-300 rounded-full"></div>
                    <div className="w-1.5 h-6 bg-emerald-400 rounded-full"></div>
                    <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full text-blue-500 flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(219,234,254,0.8)' }}>4</span>
                  Dashboard
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">Dapatkan penilaian instan, feedback terstruktur mana yang harus diperbaiki, dan skor kesiapan sidang kamu.</p>
              </div>

            </div>

            {/* YOUTUBE */}
            <div className="w-full mt-24 relative flex flex-col items-center group z-30">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[110%] blur-3xl rounded-[3rem] pointer-events-none transition duration-700 group-hover:opacity-100 opacity-70" style={{ background: 'radial-gradient(ellipse, rgba(147,197,253,0.25) 0%, rgba(186,230,255,0.15) 50%, transparent 100%)' }}></div>
              <div className="relative w-full max-w-5xl p-2 md:p-3 rounded-2xl md:rounded-[2rem]" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(147,197,253,0.5)', boxShadow: '0 20px 60px rgba(59,130,246,0.12)' }}>
                <div className="relative w-full aspect-video rounded-xl md:rounded-[1.5rem] overflow-hidden bg-slate-100 shadow-inner">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                      zIndex: 0
                    }}
                    src="https://www.youtube.com/embed/xz4F8GnBcqo?autoplay=0&controls=1&rel=0"
                    title="Demo Skripsivibe AI"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
              <p className="mt-6 text-xs sm:text-sm text-slate-400 font-semibold tracking-[0.2em] uppercase">Official Introduction</p>
            </div>

            {/* FEATURE ZIG-ZAG */}
            <div className="w-full mt-32 md:mt-48 flex flex-col gap-24 md:gap-32 z-20">

              {/* Feature 1 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
                <div className="w-full md:w-1/2">
                  <div className="relative aspect-[4/3] w-full rounded-3xl md:rounded-[2.5rem] p-5 md:p-6 overflow-hidden group flex flex-col justify-center" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #e0f2fe 100%)', border: '1px solid rgba(147,197,253,0.5)', boxShadow: '0 15px 40px rgba(59,130,246,0.10)' }}>
                    <div className="absolute top-0 left-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)' }}></div>
                    <div className="relative flex-grow rounded-2xl flex flex-col overflow-hidden" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(147,197,253,0.35)' }}>
                      <div className="flex-grow relative p-2 md:p-3" style={{ background: 'rgba(241,245,249,0.7)' }}>
                        <div className="w-full h-full rounded-xl relative flex items-center justify-center overflow-hidden" style={{ background: 'rgba(248,250,252,0.9)', border: '1px solid rgba(186,230,255,0.4)' }}>
                          <BarChart3 className="w-16 h-16 text-slate-200" />
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <div className="text-red-500 text-[10px] md:text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 shadow-sm" style={{ background: 'rgba(254,226,226,0.9)', border: '1px solid rgba(252,165,165,0.5)' }}>
                              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span> REC
                            </div>
                            <div className="text-slate-600 text-[10px] md:text-xs px-2.5 py-1 rounded-md font-mono font-bold" style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(203,213,225,0.5)' }}>09:58 / 10:00</div>
                          </div>
                          <div className="absolute bottom-3 left-3 text-slate-500 text-[10px] md:text-xs px-2 py-1 rounded flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(203,213,225,0.4)' }}>
                            <span>Mempresentasikan Skripsi</span>
                          </div>
                          <div className="absolute top-3 right-3 flex flex-col gap-2 md:gap-3 z-10">
                            <div className="w-[70px] md:w-[100px] aspect-[4/5] rounded-lg md:rounded-xl relative flex items-center justify-center overflow-hidden cursor-move hover:scale-105 transition-transform" style={{ background: 'linear-gradient(to bottom, #cbd5e1, #94a3b8)', border: '2px solid rgba(52,211,153,0.6)', boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}>
                              <span className="text-xl md:text-3xl font-bold text-white">PB</span>
                              <div className="absolute bottom-1.5 left-1.5 right-1.5 rounded text-[8px] md:text-[10px] text-white px-1 py-0.5 text-center truncate" style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.15)' }}>Prof. Budi (AI)</div>
                              <div className="absolute top-1.5 right-1.5 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                                <Mic size={10} className="text-emerald-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="h-16 flex items-center justify-center gap-4" style={{ background: 'rgba(241,245,249,0.8)', borderTop: '1px solid rgba(203,213,225,0.4)' }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-50 transition-colors cursor-pointer" style={{ background: 'rgba(219,234,254,0.6)', border: '1px solid rgba(147,197,253,0.4)' }}><Mic size={18} className="text-blue-500" /></div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-50 transition-colors cursor-pointer" style={{ background: 'rgba(219,234,254,0.6)', border: '1px solid rgba(147,197,253,0.4)' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-50 transition-colors cursor-pointer" style={{ background: 'rgba(219,234,254,0.6)', border: '1px solid rgba(147,197,253,0.4)' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                        </div>
                        <div className="w-12 h-10 rounded-2xl hover:opacity-90 flex items-center justify-center transition-colors cursor-pointer" style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 text-left space-y-6">
                  <div className="inline-flex px-4 py-1.5 rounded-full text-sky-600 text-xs font-bold tracking-widest uppercase" style={{ background: 'rgba(224,242,254,0.8)', border: '1px solid rgba(125,211,252,0.5)' }}>10-Minute Video Present</div>
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-800 leading-tight">Presentasi tatap muka, direkam layaknya Google Meet.</h2>
                  <p className="text-lg text-slate-500 leading-relaxed font-medium">Nyalakan kamera, bagikan layar materi skripsimu, dan mulailah presentasi selama 10 menit. Sistem kami merekam gestur, kelancaran, dan intonasi layaknya sidang online sungguhan.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">
                <div className="w-full md:w-1/2 text-left space-y-6">
                  <div className="inline-flex px-4 py-1.5 rounded-full text-blue-600 text-xs font-bold tracking-widest uppercase" style={{ background: 'rgba(219,234,254,0.8)', border: '1px solid rgba(147,197,253,0.5)' }}>Interactive AI Examiner</div>
                  <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-tight text-slate-800 leading-tight">
                    Dosen AI yang bisa mendengar & berbicara secara <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #2563eb, #0ea5e9)' }}>real-time</span>.
                  </h2>
                  <p className="text-lg text-slate-500 leading-relaxed font-medium">Tidak perlu mengetik! Dosen penguji diwakili oleh avatar interaktif yang merespons jawabanmu dengan suara. Garis animasi suara yang dinamis membuat sesi tanya jawab terasa sangat hidup.</p>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="relative aspect-[4/3] w-full rounded-3xl md:rounded-[2.5rem] p-5 overflow-hidden group flex flex-col justify-center" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #e0f2fe 100%)', border: '1px solid rgba(147,197,253,0.5)', boxShadow: '0 15px 40px rgba(59,130,246,0.10)' }}>
                    <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)' }}></div>
                    <div className="relative flex flex-col items-center gap-8">
                      <div className="relative flex justify-center items-center">
                        <div className="absolute inset-0 rounded-full animate-ping opacity-30 scale-150" style={{ background: 'rgba(52,211,153,0.25)' }}></div>
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-300 animate-pulse scale-125"></div>
                        <div className="relative z-10 w-28 h-28 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #cbd5e1, #94a3b8)', border: '4px solid #34d399', boxShadow: '0 0 30px rgba(52,211,153,0.25)' }}>
                          <span className="text-4xl font-bold text-white">PB</span>
                          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full border-2 flex items-center justify-center" style={{ background: 'white', borderColor: 'rgba(219,234,254,0.8)' }}>
                            <Mic size={14} className="text-emerald-500" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-1.5 h-8">
                          <div className="w-1.5 bg-emerald-400 rounded-full h-1/2 animate-[pulse_1s_ease-in-out_infinite]"></div>
                          <div className="w-1.5 bg-emerald-400 rounded-full h-full animate-[pulse_1.2s_ease-in-out_infinite_0.2s]"></div>
                          <div className="w-1.5 bg-emerald-400 rounded-full h-3/4 animate-[pulse_0.8s_ease-in-out_infinite_0.4s]"></div>
                          <div className="w-1.5 bg-emerald-400 rounded-full h-1/3 animate-[pulse_1.1s_ease-in-out_infinite_0.1s]"></div>
                          <div className="w-1.5 bg-emerald-400 rounded-full h-5/6 animate-[pulse_0.9s_ease-in-out_infinite_0.3s]"></div>
                          <div className="w-1.5 bg-emerald-400 rounded-full h-1/2 animate-[pulse_1s_ease-in-out_infinite_0.5s]"></div>
                        </div>
                        <div className="px-4 py-3 rounded-2xl max-w-[250px] text-center" style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(147,197,253,0.4)' }}>
                          <p className="text-xs text-slate-400 font-medium mb-1">Prof. Budiman (AI)</p>
                          <p className="text-sm text-slate-700 font-medium">"Lalu, bagaimana Anda memastikan validitas datanya?"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* UNIVERSITY TRUST */}
            <section id="kampus" className="relative w-full z-20 flex flex-col items-center mt-32 md:mt-48 mb-8 px-6">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 text-center tracking-tight">Dipercaya oleh mahasiswa dari universitas terbaik</h2>
              <p className="text-slate-400 text-sm md:text-base mb-12 text-center font-medium">10,000+ mahasiswa dari 100+ universitas di Indonesia</p>
              <div className="relative w-full max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
                <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-default transition-all">
                  <div className="flex items-center gap-12 md:gap-24 px-6 md:px-12">
                    {["Telkom University","Binus University","Universitas Terbuka","Universitas Indonesia","Universitas Gadjah Mada","Institut Teknologi Bandung","Universitas Padjadjaran","Universitas Sebelas April Sumedang"].map((u, i) => (
                      <span key={i} className="text-lg md:text-xl font-semibold text-slate-400 whitespace-nowrap transition-all duration-300 hover:font-black hover:text-blue-500 hover:scale-110 cursor-pointer">{u}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-12 md:gap-24 px-6 md:px-12">
                    {["Telkom University","Binus University","Universitas Terbuka","Universitas Indonesia","Universitas Gadjah Mada","Institut Teknologi Bandung","Universitas Padjadjaran","Universitas Sebelas April Sumedang"].map((u, i) => (
                      <span key={i} className="text-lg md:text-xl font-semibold text-slate-400 whitespace-nowrap transition-all duration-300 hover:font-black hover:text-blue-500 hover:scale-110 cursor-pointer">{u}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[10px] md:text-xs text-slate-400 mt-10 text-center max-w-2xl px-4">* Platform independen yang digunakan oleh mahasiswa. Tidak berafiliasi dengan universitas tersebut.</p>
            </section>

            {/* STATEMENT REVEAL */}
            <section className="relative w-full z-20 flex justify-center mt-20 mb-32 px-6">
              <div ref={revealRef} className="max-w-6xl w-full flex flex-col-reverse md:flex-row gap-6 md:gap-10 items-start">
                <div className="flex-shrink-0 pt-2 hidden md:block">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor" className="text-blue-300">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <div className="flex flex-col flex-1">
                  <p className="text-blue-500 text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                    <span className="md:hidden">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-blue-300">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </span>
                    Kenapa Skripsivibe AI?
                  </p>
                  <h2 className="text-3xl md:text-5xl lg:text-[4rem] font-extrabold leading-[1.2] md:leading-[1.25] text-left tracking-tight mb-4">
                    {statementWords.map((word, i) => {
                      const isRevealed = (i / statementWords.length) < scrollProgress;
                      return (
                        <span key={i} className="inline-block transition-all duration-[400ms] ease-out" style={{ opacity: isRevealed ? 1 : 0.1, filter: isRevealed ? 'blur(0px)' : 'blur(8px)', color: isRevealed ? '#1e3a5f' : '#94a3b8' }}>
                          {word}&nbsp;
                        </span>
                      );
                    })}
                  </h2>
                  <div className="w-full mt-6 md:mt-10 flex flex-row items-end justify-between gap-6">
                    <p className="text-base md:text-[1.15rem] font-medium leading-[1.7] md:leading-[1.8] text-slate-500 text-left transition-all duration-[400ms] ease-out max-w-3xl" style={{ opacity: scrollProgress > 0.85 ? 1 : 0.1, filter: scrollProgress > 0.85 ? 'blur(0px)' : 'blur(8px)' }}>
                      Dari brainstorming judul, parafrase natural, auto-format sesuai pedoman kampus, sampai simulasi sidang—semua dalam satu platform yang dirancang khusus untuk mahasiswa Indonesia.
                    </p>
                    <div className="flex-shrink-0 text-blue-300 transition-all duration-[400ms] ease-out mb-2" style={{ opacity: scrollProgress > 0.9 ? 1 : 0.05, transform: scrollProgress > 0.9 ? 'translateX(0)' : 'translateX(-10px)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="md:w-[40px] md:h-[40px]" style={{ transform: 'scaleX(-1)' }}>
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="testi" className="scroll-mt-32 relative w-full z-20 flex flex-col items-center mt-10 mb-32 px-6">
              <div className="max-w-3xl w-full">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">Ada pertanyaan?</h2>
                  <p className="text-slate-400 text-sm md:text-base font-medium">Temukan jawaban untuk pertanyaan yang sering diajukan</p>
                </div>
                <div className="space-y-2">
                  {faqData.map((faq, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <div key={index} className="transition-colors duration-300" style={{ borderBottom: `1px solid ${isOpen ? 'rgba(147,197,253,0.5)' : 'rgba(203,213,225,0.4)'}` }}>
                        <button onClick={() => setOpenFaq(isOpen ? null : index)} className="w-full flex items-center justify-between py-6 text-left focus:outline-none group">
                          <div className="flex items-center gap-4">
                            <span className={`w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}></span>
                            <span className={`text-base md:text-lg font-semibold transition-colors duration-300 ${isOpen ? 'text-blue-600' : 'text-slate-600 group-hover:text-blue-500'}`}>{faq.question}</span>
                          </div>
                          <span className="flex-shrink-0 ml-6">
                            {isOpen ? <Minus className="text-blue-500 w-5 h-5 md:w-6 md:h-6" /> : <Plus className="text-slate-400 group-hover:text-blue-400 w-5 h-5 md:w-6 md:h-6 transition-colors duration-300" />}
                          </span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
                          <p className="text-slate-500 text-sm md:text-base leading-[1.8] pr-8 pl-6 text-justify">{faq.answer}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="relative w-full z-20 flex flex-col items-center mt-10 mb-32 px-6">
              <div className="text-center mb-16 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
                  Dipercaya <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #2563eb, #0ea5e9)' }}>Ribuan</span> Mahasiswa
                </h2>
                <p className="text-slate-400 text-sm md:text-base font-medium">Bergabung dengan komuniti mahasiswa yang sudah merasakan kemudahan menulis skripsi</p>
              </div>

              <div className="relative w-full max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] mb-6">
                <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-6">
                  {[0,1].map(copy => (
                    <div key={copy} className="flex gap-6">
                      {testimonialsRow1.map((t, i) => (
                        <div key={i} className="w-[300px] md:w-[400px] p-6 rounded-2xl flex flex-col justify-between cursor-default hover:scale-[1.02] transition-all duration-300" style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(147,197,253,0.4)' }}>
                          <p className="text-slate-600 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                          <div><p className="text-slate-800 font-bold text-sm">{t.name}</p><p className="text-slate-400 text-xs mt-1">{t.role}</p></div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative w-full max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused] gap-6">
                  {[0,1].map(copy => (
                    <div key={copy} className="flex gap-6">
                      {testimonialsRow2.map((t, i) => (
                        <div key={i} className="w-[300px] md:w-[400px] p-6 rounded-2xl flex flex-col justify-between cursor-default hover:scale-[1.02] transition-all duration-300" style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(147,197,253,0.4)' }}>
                          <p className="text-slate-600 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                          <div><p className="text-slate-800 font-bold text-sm">{t.name}</p><p className="text-slate-400 text-xs mt-1">{t.role}</p></div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* BLOG */}
            <section id="blog" className="relative w-full z-20 flex flex-col items-center mt-10 mb-32 px-6">
              <div className="max-w-5xl w-full text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
                  Blog & Artikel
                </h2>

                <p className="text-slate-400 mb-12">
                  Tips sidang, revisi skripsi, dan persiapan mental mahasiswa.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-3xl bg-white/70 border border-blue-100">
                    <h3 className="font-bold text-slate-800 mb-2">
                      Tips Menghadapi Sidang Skripsi
                    </h3>
                    <p className="text-sm text-slate-500">
                      Cara mengurangi gugup saat presentasi di depan dosen penguji.
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-white/70 border border-blue-100">
                    <h3 className="font-bold text-slate-800 mb-2">
                      Kesalahan Revisi yang Sering Terjadi
                    </h3>
                    <p className="text-sm text-slate-500">
                      Hindari revisi berulang dengan memahami catatan dosen.
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-white/70 border border-blue-100">
                    <h3 className="font-bold text-slate-800 mb-2">
                      Persiapan Mental Sebelum Sidang
                    </h3>
                    <p className="text-sm text-slate-500">
                      Bangun rasa percaya diri sebelum menghadapi sidang akhir.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="w-full pt-16 pb-8 mt-10 text-left" style={{ borderTop: '1px solid rgba(147,197,253,0.4)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 w-full">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 cursor-pointer mb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center relative" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(147,197,253,0.5)', boxShadow: '0 0 15px rgba(96,165,250,0.2)' }}>
                      <div className="w-3 h-3 bg-gradient-to-tr from-blue-400 via-sky-400 to-cyan-300 rotate-45 rounded-[2px]"></div>
                    </div>
                    <span className="font-bold text-lg tracking-wide text-slate-800">Skripsivibe AI</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed pr-4">Skripsivibe AI – Copilot pertama di Indonesia untuk bantu formatting skripsi, tesis, dan disertasi secara otomatis. Gunakan AI untuk selesaikan skripsi tanpa joki.</p>
                <button onClick={() => handleProtectedRoute("/dashboard-ujian")} className="inline-block text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-colors w-max mt-2"style={{ background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)' }}> Mulai Sekarang </button>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-slate-700 font-bold mb-6 tracking-wide">Kebijakan Privasi & ToS</h4>
                  <ul className="flex flex-col gap-4 text-sm text-slate-500 font-medium">
                    <li><a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a></li>
                    <li><a href="#" className="hover:text-blue-500 transition-colors">Kebijakan Privasi</a></li>
                  </ul>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-slate-700 font-bold mb-6 tracking-wide">Documentation</h4>
                  <ul className="flex flex-col gap-4 text-sm text-slate-500 font-medium">
                    <li><a href="#" className="hover:text-blue-500 transition-colors">Dokumentasi</a></li>
                    <li><a href="#" className="hover:text-blue-500 transition-colors">Panduan Penggunaan</a></li>
                    <li><a href="#" className="hover:text-blue-500 transition-colors">Contoh Format</a></li>
                    <li><a href="#" className="hover:text-blue-500 transition-colors">Contributing</a></li>
                    <li><a href="#" className="hover:text-blue-500 transition-colors">Changelog</a></li>
                  </ul>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-slate-700 font-bold mb-6 tracking-wide">Socials</h4>
                  <ul className="flex flex-col gap-4 text-sm text-slate-500 font-medium">
                    <li><a href="#" className="hover:text-blue-500 transition-colors">Komunitas</a></li>
                    <li><a href="#" className="hover:text-blue-500 transition-colors">GitHub</a></li>
                    <li><a href="#" className="hover:text-blue-500 transition-colors">X (formerly Twitter)</a></li>
                  </ul>
                </div>
              </div>
            </footer>

          </div>
        </div>
      </section>

    </div>
  );
}