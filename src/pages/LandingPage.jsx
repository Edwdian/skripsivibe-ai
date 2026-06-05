import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, UploadCloud, Mic, MessageSquare, BarChart3, Plus, Minus, Target, Zap, CheckCircle, AlertCircle } from 'lucide-react';

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

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const revealRef = useRef(null);

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = 'https://res.cloudinary.com/doabehyrn/image/upload/v1780575299/skripsivibeai-logo_gdzxnq.png';
    document.getElementsByTagName('head')[0].appendChild(link);
    document.title = "Skripsivibe AI - Simulasi Sidang";

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

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
      const navHeight = 80;
      const sectionPosition = section.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({
        top: sectionPosition,
        behavior: "smooth"
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
        background: 'linear-gradient(160deg, #e0f2ff 0%, #cfe8ff 25%, #b9dcff 55%, #d9efff 100%)'
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
        .text-balance { text-wrap: balance; }
      `}} />

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex: 0}}>
        <div className="absolute top-[-8%] left-[-5%] w-[520px] h-[520px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.40) 0%, transparent 70%)' }}></div>
        <div className="absolute top-[25%] right-[-8%] w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(125,211,252,0.32) 0%, transparent 70%)' }}></div>
      </div>

      {/* FIXED NAVBAR */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-blue-100 py-3' : 'bg-transparent pt-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-6 lg:gap-10">
            {/* LOGO & TEXT SPACING*/}
            <div onClick={() => scrollToSection("beranda")} className="flex items-center gap-3 cursor-pointer group">
              <img 
                src="https://res.cloudinary.com/doabehyrn/image/upload/v1780575299/skripsivibeai-logo_gdzxnq.png" 
                alt="Logo Skripsivibe AI" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain group-hover:scale-105 transition-transform" 
              />
              <span className="font-extrabold text-xl md:text-2xl tracking-tight text-slate-800 hidden sm:block">Skripsivibe AI</span>
            </div>
            <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-slate-600">
              <button onClick={() => scrollToSection("beranda")} className="hover:text-blue-600 transition-colors">Beranda</button>
              <button onClick={() => scrollToSection("cara-kerja")} className="hover:text-blue-600 transition-colors">Cara Kerja</button>
              <button onClick={() => scrollToSection("fitur-evaluasi")} className="hover:text-blue-600 transition-colors">Fitur Evaluasi</button>
              {/* <button onClick={() => scrollToSection("demo")} className="hover:text-blue-600 transition-colors">Demo</button> */}
              <button onClick={() => scrollToSection("faq")} className="hover:text-blue-600 transition-colors">FAQ</button>
            </div>
          </div>
          <div>
            <a href="/auth" className="inline-block text-white px-5 py-2 md:px-6 md:py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-md" style={{ background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)' }}>
              Mulai Gratis
            </a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main id="beranda" className="relative pt-48 pb-20 px-6 z-10 flex flex-col items-center flex-grow">
        <h1 className="text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] leading-[1.1] font-extrabold tracking-[-0.04em] text-center max-w-5xl relative z-20 text-slate-800 px-6 text-balance">
          Simulasi Sidang <br />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 50%, #38bdf8 100%)' }}>Tanpa Tegang</span>
        </h1>
        <p className="mt-8 text-lg md:text-xl text-slate-500 text-center max-w-2xl font-medium leading-relaxed z-20 mb-8 text-balance">
          Latih mental dan materimu dengan AI yang didesain khusus menjadi dosen penguji. Hadapi pertanyaan tak terduga dan rasakan euforia lulus sidang skripsi.
        </p>

        {/* Floating Icons di Hero Section */}
        <div className="absolute top-[20%] left-[5%] lg:left-[15%] z-10 animate-float-slow pointer-events-none" style={{"--rot": "-15deg"}}>
          <svg className="w-[60px] md:w-[100px] opacity-70" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 10px 20px rgba(59,130,246,0.18))" }}>
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

        <div className="absolute top-[25%] right-[5%] lg:right-[15%] z-10 animate-float-fast pointer-events-none" style={{"--rot": "10deg"}}>
          <svg className="w-[70px] md:w-[110px] opacity-70" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 10px 20px rgba(14,165,233,0.18))" }}>
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

      {/* LENGKUNGAN KURVA*/}
      <section id="cara-kerja" className="relative w-full flex flex-col items-center mt-16 overflow-visible z-10">
        
        {/* Shadow tipis untuk mempertegas lengkungan */}
        <div className="absolute -top-[1px] left-0 w-full h-[100px] pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(215,232,255,0.4) 0%, transparent 100%)' }}></div>

        <div className="relative w-full flex flex-col items-center pt-32 pb-10 mt-[30px]"
          style={{
            background: 'linear-gradient(180deg, rgba(240,248,255,0.98) 0%, rgba(255,255,255,1) 100%)',
            borderRadius: '50% 50% 0 0 / 8vw 8vw 0 0', 
            borderTop: '1px solid rgba(147,197,253,0.5)',
            boxShadow: '0 -15px 40px rgba(59,130,246,0.06)'
          }}>
          
          <button onClick={() => handleProtectedRoute("/dashboard-ujian")} className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 inline-block text-white px-8 py-3.5 rounded-xl text-base font-bold hover:scale-105 transition-transform z-30 shadow-lg shadow-blue-500/30" style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)' }}>
            Mulai Simulasi
          </button>

          <div className="max-w-7xl w-full px-6 mx-auto flex flex-col items-center text-center relative z-20 mt-8">
            
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-slate-800">
              Cara Kerja <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)' }}>Skripsivibe AI</span>
            </h2>
            <p className="text-slate-500 mb-16 max-w-2xl text-lg font-medium">
              Simulasi semirip aslinya, didesain untuk melatih mental dan penguasaan materi dari presentasi awal hingga evaluasi akhir.
            </p>

            {/* 4 CARA KERJA*/}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 w-full text-left">
              
              {/* Card 1 */}
              <div className="rounded-3xl p-6 lg:p-8 flex flex-col hover:-translate-y-2 transition-all duration-300 group" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(96,165,250,0.55)' }}>
                <div className="h-48 rounded-2xl mb-8 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'rgba(219,234,254,0.9)', border: '1px solid rgba(147,197,253,0.3)' }}>
                  <div className="w-24 h-24 border-2 border-dashed rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ borderColor: 'rgba(59,130,246,0.4)', background: 'rgba(191,219,254,0.7)' }}>
                    <UploadCloud className="text-blue-600" size={48} />
                  </div>
                  <div className="absolute bottom-4 text-xs text-slate-500 font-mono tracking-wider">drop_skripsi_final.pdf</div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
                  Import Skripsi
                </h3>
                <p className="text-base text-slate-500 leading-relaxed">Upload file PDF skripsi kamu. AI kami akan membedah latar belakang, metode, hingga kesimpulan secara kilat.</p>
              </div>

              {/* Card 2 */}
              <div className="rounded-3xl p-6 lg:p-8 flex flex-col hover:-translate-y-2 transition-all duration-300 group" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(147,197,253,0.45)' }}>
                <div className="h-48 rounded-2xl mb-8 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'rgba(219,234,254,0.9)', border: '1px solid rgba(147,197,253,0.3)' }}>
                  <div className="flex items-center gap-3 px-5 py-3 rounded-full shadow-sm" style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(147,197,253,0.5)' }}>
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-slate-700 font-mono font-bold text-2xl tracking-wider">10:00</span>
                  </div>
                  <div className="absolute bottom-6 flex items-end gap-2 opacity-60">
                    <div className="w-2 h-6 bg-blue-500 rounded-full group-hover:h-12 transition-all duration-300"></div>
                    <div className="w-2 h-12 bg-blue-500 rounded-full group-hover:h-6 transition-all duration-300 delay-75"></div>
                    <div className="w-2 h-8 bg-sky-500 rounded-full group-hover:h-14 transition-all duration-300 delay-150"></div>
                    <div className="w-2 h-14 bg-sky-500 rounded-full group-hover:h-8 transition-all duration-300 delay-200"></div>
                    <div className="w-2 h-10 bg-blue-400 rounded-full group-hover:h-10 transition-all duration-300 delay-300"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
                  Presentasi Video
                </h3>
                <p className="text-base text-slate-500 leading-relaxed">Mulai pemaparanmu. Dosen AI mendengarkan secara real-time via mikrofon komputermu layaknya gmeet.</p>
              </div>

              {/* Card 3 */}
              <div className="rounded-3xl p-6 lg:p-8 flex flex-col hover:-translate-y-2 transition-all duration-300 group" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(147,197,253,0.45)' }}>
                <div className="h-48 rounded-2xl mb-8 flex flex-col justify-center px-6 relative overflow-hidden" style={{ background: 'rgba(219,234,254,0.9)', border: '1px solid rgba(147,197,253,0.3)' }}>
                  <div className="w-full space-y-4 relative z-10">
                    <div className="w-10/12 h-12 rounded-2xl rounded-bl-none flex items-center px-4" style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(203,213,225,0.6)' }}>
                      <div className="w-full h-2.5 bg-slate-300 rounded-full opacity-70"></div>
                    </div>
                    <div className="w-9/12 h-12 rounded-2xl rounded-br-none ml-auto flex items-center px-4" style={{ background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)' }}>
                      <div className="w-full h-2.5 bg-blue-200 rounded-full opacity-70"></div>
                    </div>
                  </div>
                  <MessageSquare className="absolute -right-4 -bottom-4 text-blue-300/40" size={120} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">3</span>
                  Tanya Jawab Suara
                </h3>
                <p className="text-base text-slate-500 leading-relaxed">Hadapi pertanyaan tajam dan kritis. Pilih mode santai atau "Killer" untuk ujian sesungguhnya.</p>
              </div>

              {/* Card 4 */}
              <div className="rounded-3xl p-6 lg:p-8 flex flex-col hover:-translate-y-2 transition-all duration-300 group" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(147,197,253,0.45)' }}>
                <div className="h-48 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden" style={{ background: 'rgba(219,234,254,0.9)', border: '1px solid rgba(147,197,253,0.3)' }}>
                  <div className="relative w-28 h-28 rounded-full flex items-center justify-center" style={{ border: '8px solid rgba(186,230,255,0.6)' }}>
                    <div className="absolute inset-0 rounded-full border-[8px] border-emerald-400 border-l-transparent border-b-transparent -rotate-45 group-hover:rotate-0 transition-transform duration-700"></div>
                    <span className="text-3xl font-black text-slate-700">A-</span>
                  </div>
                  <div className="absolute top-5 right-5 flex gap-1.5">
                    <div className="w-2 h-6 bg-emerald-300 rounded-full"></div>
                    <div className="w-2 h-8 bg-emerald-400 rounded-full"></div>
                    <div className="w-2 h-10 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">4</span>
                  Dashboard Evaluasi
                </h3>
                <p className="text-base text-slate-500 leading-relaxed">Dapatkan penilaian instan, feedback terstruktur, dan skor kesiapan sidang kamu secara detail.</p>
              </div>

            </div>

            {/* FITUR DETAIL EVALUASI AI*/}
            <div id="fitur-evaluasi" className="w-full mt-32 md:mt-48 flex flex-col gap-24 lg:gap-32 pt-10 z-20">
              <div className="text-center mb-4">
                <p className="text-blue-600 text-sm md:text-base font-bold tracking-widest uppercase mb-3">Teknologi Analisis Mendalam</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 tracking-tight leading-tight">Lebih dari sekadar skor. <br className="hidden md:block"/> Ini adalah <span className="text-blue-600">Feedback Real.</span></h2>
              </div>

              {/* FITUR 1: Grading Kampus & Metrik Spesifik */}
              <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24 text-left">
                <div className="w-full md:w-1/2">
                   <div className="relative w-full rounded-[2rem] bg-white border border-blue-100 shadow-xl p-8 flex flex-col gap-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                        <div>
                          <p className="text-sm text-slate-500 font-medium">Nilai Akhir Simulasi</p>
                          <div className="flex items-end gap-3 mt-1">
                            <span className="text-5xl font-black text-slate-800">88.5</span>
                            <span className="text-xl font-bold text-emerald-500 mb-1">/ 100</span>
                          </div>
                        </div>
                        <div className="w-20 h-20 rounded-full border-[6px] border-emerald-400 flex items-center justify-center bg-emerald-50 shadow-inner">
                          <span className="text-3xl font-black text-emerald-600">A</span>
                        </div>
                      </div>
                      <div className="space-y-5">
                        <div>
                          <div className="flex justify-between text-sm mb-2"><span className="font-semibold text-slate-600">Pemahaman Materi</span><span className="text-blue-600 font-bold">90%</span></div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full w-[90%]"></div></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2"><span className="font-semibold text-slate-600">Kesesuaian Jawaban</span><span className="text-blue-600 font-bold">85%</span></div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full w-[85%]"></div></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2"><span className="font-semibold text-slate-600">Kepercayaan Diri</span><span className="text-sky-500 font-bold">82%</span></div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-sky-400 h-2.5 rounded-full w-[82%]"></div></div>
                        </div>
                      </div>
                   </div>
                </div>
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="inline-flex px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-widest uppercase border border-blue-100">Standar Penilaian Kampus</div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 leading-tight">Grading & Skor Metrik Detail</h3>
                  <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium">Sistem tidak hanya memberikan estimasi nilai huruf (A/B/C/D) dan angka yang menyesuaikan standar akademik. AI membedah performamu menjadi 3 metrik krusial: <strong className="text-slate-700">Pemahaman Materi, Kepercayaan Diri, dan Kesesuaian Jawaban.</strong></p>
                </div>
              </div>

              {/* FITUR 2: Evaluasi & Strategi */}
              <div className="flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-24 text-left">
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="inline-flex px-4 py-1.5 rounded-full bg-sky-50 text-sky-700 text-xs font-bold tracking-widest uppercase border border-sky-100">Personalized Blueprint</div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 leading-tight">Evaluasi & Strategi Peningkatan</h3>
                  <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium">Kamu akan tahu persis apa <strong className="text-slate-700">keunggulanmu</strong> yang harus dipertahankan, area yang <strong className="text-slate-700">perlu ditingkatkan</strong>, dan yang terpenting: AI memberikan <strong className="text-slate-700">strategi konkret</strong> tentang cara menaikkan nilai sebelum sidang asli.</p>
                </div>
                <div className="w-full md:w-1/2">
                   <div className="relative w-full rounded-[2rem] bg-slate-800 border border-slate-700 shadow-2xl p-6 md:p-8 flex flex-col gap-5">
                      <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600">
                        <div className="flex items-center gap-3 mb-2"><Target className="w-6 h-6 text-emerald-400"/><span className="text-white font-bold text-lg">Keunggulan</span></div>
                        <p className="text-slate-300 text-base leading-relaxed">Metodologi dijelaskan dengan sangat runut dan masuk akal.</p>
                      </div>
                      <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600">
                        <div className="flex items-center gap-3 mb-2"><AlertCircle className="w-6 h-6 text-amber-400"/><span className="text-white font-bold text-lg">Area Perbaikan</span></div>
                        <p className="text-slate-300 text-base leading-relaxed">Gagap saat ditanya batasan masalah. Argumen kurang didukung teori.</p>
                      </div>
                      <div className="bg-blue-900/40 p-5 rounded-xl border border-blue-500/30">
                        <div className="flex items-center gap-3 mb-2"><Zap className="w-6 h-6 text-blue-400"/><span className="text-blue-100 font-bold text-lg">Strategi Nilai A</span></div>
                        <p className="text-blue-200 text-base leading-relaxed">Hafalkan 2 teori utama di Bab 2 untuk back-up jawaban saat diserang penguji.</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* FITUR 3: Feedback Spesifik Q&A */}
              <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24 text-left">
                <div className="w-full md:w-1/2">
                   <div className="relative w-full rounded-[2rem] bg-slate-50 border border-slate-200 shadow-lg p-6 md:p-8 flex flex-col gap-6">
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-sm text-slate-400 mb-2 font-bold uppercase tracking-wider">Pertanyaan Dosen AI</p>
                        <p className="text-base font-medium text-slate-800">"Kenapa Anda menggunakan algoritma X dibandingkan Y?"</p>
                      </div>
                      <div className="ml-4 md:ml-8 bg-red-50 p-5 rounded-2xl border border-red-100 relative">
                        <div className="absolute -left-4 top-5 w-8 h-8 rounded-full bg-red-100 border-2 border-white flex items-center justify-center"><Minus className="text-red-500 w-5 h-5"/></div>
                        <p className="text-sm text-red-500 mb-2 font-bold uppercase tracking-wider">Jawaban Kurang Tepat</p>
                        <p className="text-base text-slate-700 mb-4 leading-relaxed">Kamu menjawab karena algoritma X lebih cepat, padahal datasetmu kecil.</p>
                        <div className="bg-white/80 p-4 rounded-xl border border-red-50">
                          <p className="text-sm text-slate-600 leading-relaxed"><strong className="text-slate-800">Seharusnya:</strong> Jelaskan bahwa algoritma X terbukti lebih akurat untuk tipe data berderau (noise) seperti di penelitianmu.</p>
                        </div>
                      </div>
                   </div>
                </div>
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="inline-flex px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tracking-widest uppercase border border-emerald-100">Micro-Feedback Analysis</div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 leading-tight">Koreksi Akurat Tiap Pertanyaan</h3>
                  <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium">Sistem membedah ucapanmu kata per kata. Jika jawabanmu <strong>salah</strong>, AI memberitahu titik lemahnya. Jika <strong>kurang tepat</strong>, AI meluruskannya. Bahkan jika <strong>benar</strong>, AI akan memandu cara menyampaikannya agar terkesan lebih expert.</p>
                </div>
              </div>

            </div>

            {/* DEMO APLIKASI
            <div id="demo" className="w-full mt-40 relative flex flex-col items-center z-30 pt-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-10 text-slate-800 tracking-tight">Lihat Bagaimana AI Bekerja</h2>
              <div className="relative w-full max-w-5xl p-2 md:p-3 rounded-2xl md:rounded-[2rem] bg-white/60 backdrop-blur-lg border border-blue-200 shadow-2xl">
                <div className="relative w-full aspect-video rounded-xl md:rounded-[1.5rem] overflow-hidden bg-slate-900">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.youtube.com/embed/xz4F8GnBcqo?autoplay=0&controls=1&rel=0"
                    title="Demo Skripsivibe AI"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div> */}

            {/* STATEMENT REVEAL*/}
            <section className="relative w-full z-20 flex justify-center mt-40 mb-24 px-6">
              <div ref={revealRef} className="max-w-5xl w-full">
                <p className="text-blue-600 text-base font-bold tracking-widest uppercase mb-8 flex items-center justify-center md:justify-start gap-3">
                  Mengapa Skripsivibe AI?
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-[3.5rem] font-extrabold leading-relaxed md:leading-[1.6] text-center md:text-left tracking-tight mb-8">
                  {statementWords.map((word, i) => {
                    const isRevealed = (i / statementWords.length) < scrollProgress;
                    return (
                      <span key={i} className="inline-block transition-all duration-300 ease-out" style={{ opacity: isRevealed ? 1 : 0.1, color: isRevealed ? '#1e293b' : '#94a3b8' }}>
                        {word}&nbsp;
                      </span>
                    );
                  })}
                </h2>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="w-full z-20 flex flex-col items-center pt-10 mb-32">
              <div className="max-w-3xl w-full text-left">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">Ada pertanyaan?</h2>
                  <p className="text-slate-500 text-lg">Temukan jawaban untuk pertanyaan yang sering diajukan</p>
                </div>
                <div className="space-y-4">
                  {faqData.map((faq, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <div key={index} className="border border-blue-100 rounded-2xl bg-white/50 backdrop-blur-sm overflow-hidden transition-all duration-300">
                        <button onClick={() => setOpenFaq(isOpen ? null : index)} className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-blue-50/50 transition-colors">
                          <span className={`text-lg font-semibold ${isOpen ? 'text-blue-600' : 'text-slate-700'}`}>{faq.question}</span>
                          {isOpen ? <Minus className="text-blue-500 w-6 h-6 flex-shrink-0" /> : <Plus className="text-slate-400 w-6 h-6 flex-shrink-0" />}
                        </button>
                        <div className={`px-6 md:px-8 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <p className="text-slate-500 text-base leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="w-full pt-16 pb-8 border-t border-blue-200 text-left mt-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16 w-full max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-3 cursor-pointer mb-2">
                    <img 
                      src="https://res.cloudinary.com/doabehyrn/image/upload/v1780575299/skripsivibeai-logo_gdzxnq.png" 
                      alt="Logo Skripsivibe AI" 
                      className="w-10 h-10 object-contain" 
                    />
                    <span className="font-extrabold text-xl text-slate-800">Skripsivibe AI</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed pr-4">Platform simulasi sidang skripsi interaktif pertama di Indonesia. Latih mentalmu dan selesaikan ujianmu dengan percaya diri.</p>
                </div>
                <div>
                  <h4 className="text-slate-800 font-bold mb-4 md:mb-6">Produk</h4>
                  <ul className="space-y-3 text-sm text-slate-500">
                    <li><a href="#fitur-evaluasi" className="hover:text-blue-600 transition-colors">Fitur Evaluasi</a></li>
                    <li><a href="#demo" className="hover:text-blue-600 transition-colors">Live Demo</a></li>
                    <li><a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-slate-800 font-bold mb-4 md:mb-6">Legal</h4>
                  <ul className="space-y-3 text-sm text-slate-500">
                    <li><a href="#" className="hover:text-blue-600 transition-colors">Syarat & Ketentuan</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition-colors">Kebijakan Privasi</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-slate-800 font-bold mb-4 md:mb-6">Komunitas</h4>
                  <ul className="space-y-3 text-sm text-slate-500">
                    <li><a href="#" className="hover:text-blue-600 transition-colors">Discord</a></li>
                    <li><a href="#" className="hover:text-blue-600 transition-colors">Instagram</a></li>
                  </ul>
                </div>
              </div>
              <div className="w-full max-w-7xl mx-auto mt-12 pt-8 border-t border-blue-100 text-center text-sm text-slate-400">
                &copy; {new Date().getFullYear()} Skripsivibe AI. Hak Cipta Dilindungi.
              </div>
            </footer>

          </div>
        </div>
      </section>
    </div>
  );
}