import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  UploadCloud,
  Mic,
  MessageSquare,
  BarChart3,
  Plus,
  Minus,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";

const faqData = [
  {
    question: "Apa itu SkripsiVibe AI?",
    answer:
      "SkripsiVibe AI adalah platform simulasi sidang skripsi pertama di Indonesia. Kamu bisa berlatih presentasi dengan menyalakan kamera dan menghadapi dosen penguji AI yang merespons jawabanmu secara real-time menggunakan suara.",
  },
  {
    question: "Bagaimana cara kerja simulasi sidangnya?",
    answer:
      "Cukup unggah draft skripsi kamu dalam format PDF. Kamu akan diberikan waktu 10 menit untuk presentasi materi melalui video. Setelah itu, avatar dosen AI akan memberikan pertanyaan kritis berdasarkan isi skripsi dan presentasimu.",
  },
  {
    question: "Apakah dosen AI-nya bisa berbicara langsung seperti manusia?",
    answer:
      "Ya! Dosen AI kami dilengkapi teknologi pengenalan dan sintesis suara tingkat lanjut. Kamu tidak perlu mengetik; cukup berbicara seperti biasa, dan dosen AI akan membalas secara interaktif layaknya sidang online di Google Meet atau Zoom.",
  },
  {
    question: "Apakah file skripsi dan data saya aman?",
    answer:
      "Sangat aman. File PDF yang kamu unggah hanya diproses sementara di dalam memori server untuk dibaca oleh AI selama sesi simulasi berlangsung, dan akan otomatis terhapus setelah kamu menutup sesi. Kami tidak menyimpan atau membagikan datamu.",
  },
  {
    question: "Apakah ada penilaian setelah simulasi selesai?",
    answer:
      "Tentu. Setelah sesi tanya jawab berakhir, kamu akan diarahkan ke Dashboard Hasil. Di sana, AI akan memberikan metrik penilaian komprehensif, estimasi nilai (A/B/C/D), serta saran perbaikan agar kamu lebih siap saat sidang sungguhan.",
  },
];

const testimonialsRow1 = [
  {
    quote:
      "Gila sih, fitur simulasi sidangnya beneran ngebantu ngelatih mental sebelum hari H. Dosen AI pertanyaannya tajam banget!",
    name: "Rian Saputra",
    role: "Mahasiswa Informatika, ITB",
  },
  {
    quote:
      "Awalnya tegang banget waktu presentasi, tapi setelah latihan beberapa kali di sini, tingkat kepahaman materi jadi makin terukur.",
    name: "Amanda Lestari",
    role: "Mahasiswa Komunikasi, UI",
  },
  {
    quote:
      "Penyelamat sidang akhir! Feedback dari AI-nya detail banget buat nunjukin bagian mana jawaban kita yang masih kurang jelas.",
    name: "Santoso",
    role: "Mahasiswa Manajemen, UGM",
  },
  {
    quote:
      "Pertanyaan tak terduga dari dosen penguji AI-nya bener-bener melatih reflex dan kesiapan mental saya di bawah tekanan.",
    name: "Dinda Putri",
    role: "Mahasiswa Hukum, Unpad",
  },
];

const testimonialsRow2 = [
  {
    quote:
      "Fitur analisis ketegangan dan evaluasi jawabannya akurat parah. Jadi tahu persis materi mana yang harus dikuasai lagi.",
    name: "Ahmad Fauzi",
    role: "Mahasiswa Teknik, ITS",
  },
  {
    quote:
      "Recommended banget buat yang grogian pas ngomong di depan penguji. Rasanya kayak sidang asli via online!",
    name: "Dinda Lestari",
    role: "Mahasiswa Manajemen",
  },
  {
    quote:
      "Skor kesiapan sidangnya ngebantu banget nurunin rasa cemas. Kelar simulasi, langsung paham bagian skripsi mana yang bolong.",
    name: "Bima Pratama",
    role: "Mahasiswa DKV, Binus",
  },
  {
    quote:
      "Latihan tanya jawab suaranya natural banget kayak ngobrol sama dosen beneran. Lulus sidang jadi tanpa tegang!",
    name: "Kevin Sanjaya",
    role: "Mahasiswa Sastra, Undip",
  },
];

// --- VARIANTS ANIMASI ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Jeda animasi antar elemen
    },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    const link =
      document.querySelector("link[rel~='icon']") ||
      document.createElement("link");
    link.type = "image/png";
    link.rel = "icon";
    link.href =
      "https://res.cloudinary.com/doabehyrn/image/upload/v1780575299/skripsivibeai-logo_gdzxnq.png";
    document.getElementsByTagName("head")[0].appendChild(link);
    document.title = "SkripsiVibe AI - Simulasi Sidang";

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [menuOpen]);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      const navHeight = 80;
      const sectionPosition =
        section.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({
        top: sectionPosition,
        behavior: "smooth",
      });
    }
  };

  const getFeatureItemStyle = (side, index) => ({
    opacity: 1,
    transform: "translateX(0)",
    transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
    transitionDelay: `${index * 130}ms`,
  });

  const handleProtectedRoute = (path) => {
    const user = localStorage.getItem("user");
    if (user) {
      window.location.href = path;
    } else {
      window.location.href = "/auth";
    }
  };

  const textContainerVariant = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.035, // Jeda sangat singkat (35ms) agar mengalir mulus seperti di-swipe
        delayChildren: 0.2,
      },
    },
  };

  const textChildVariant = {
    hidden: {
      opacity: 0,
      x: -8, // Teks bersiap sedikit di sebelah kiri
    },
    visible: {
      opacity: 1,
      x: 0, // Bergeser mulus ke posisi asli
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <div
      className="min-h-screen text-slate-800 font-sans overflow-x-hidden selection:bg-blue-200 selection:text-blue-900 flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #e0f2ff 0%, #cfe8ff 25%, #b9dcff 55%, #d9efff 100%)",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        html {scroll-behavior: smooth;}
        @keyframes float {
          0% { transform: translateY(0px) rotate(var(--rot)); }
          50% { transform: translateY(-20px) rotate(calc(var(--rot) + 5deg)); }
          100% { transform: translateY(0px) rotate(var(--rot)); }
        }
        .animate-float-slow { animation: float 6s ease-in-out infinite; }
        .animate-float-fast { animation: float 4s ease-in-out infinite; }
        .text-balance { text-wrap: balance; }

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
              "radial-gradient(circle, rgba(96,165,250,0.40) 0%, transparent 70%)",
          }}
        ></div>
        <div
          className="absolute top-[25%] right-[-8%] w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(125,211,252,0.32) 0%, transparent 70%)",
          }}
        ></div>
      </div>

      {/* FIXED NAVBAR */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-blue-100 py-3" : "bg-transparent pt-6"}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6 lg:gap-10">
            {/* LOGO & TEXT SPACING*/}
            <div
              onClick={() => {
                scrollToSection("beranda");
                setMenuOpen(false);
              }}
              className="flex items-center cursor-pointer group"
            >
              <img
                src="https://res.cloudinary.com/doabehyrn/image/upload/v1780575299/skripsivibeai-logo_gdzxnq.png"
                alt="Logo SkripsiVibe AI"
                className="w-10 h-10 md:w-12 md:h-12 object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-extrabold text-xl md:text-2xl tracking-tight text-slate-800 hidden sm:block mb-1 md:mb-1.5">
                SkripsiVibe AI
              </span>
            </div>
          </div>

          {/* NAV LINKS */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              onClick={() => scrollToSection("beranda")}
              className="hover:text-blue-600 transition-colors"
            >
              Beranda
            </button>
            <button
              onClick={() => scrollToSection("cara-kerja")}
              className="hover:text-blue-600 transition-colors"
            >
              Cara Kerja
            </button>
            <button
              onClick={() => scrollToSection("fitur-evaluasi")}
              className="hover:text-blue-600 transition-colors"
            >
              Fitur Evaluasi
            </button>
            <button
              onClick={() => scrollToSection("testi")}
              className="hover:text-blue-600 transition-colors"
            >
              Testimoni
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="hover:text-blue-600 transition-colors"
            >
              FAQ
            </button>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/auth"
              className="hidden md:inline-block text-white px-5 py-2 md:px-6 md:py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-md"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
              }}
            >
              Mulai Gratis
            </a>

            <button
              ref={menuButtonRef}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-white/90 text-slate-700 shadow-sm hover:bg-blue-50/80 hover:text-blue-600 active:scale-95 transition-all duration-200"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <span className="sr-only">Toggle menu</span>

              {/* Animasi Transisi Ikon Menu <-> X */}
              <div className="relative w-6 h-6 flex items-center justify-center">
                {menuOpen ? (
                  <X
                    size={24}
                    className="text-blue-600 transition-transform duration-300 rotate-90 scale-110"
                  />
                ) : (
                  <Menu
                    size={24}
                    className="text-slate-700 transition-transform duration-300"
                  />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* DROPDOWN MENU MOBILE */}
        <div
          ref={menuRef}
          className={`md:hidden overflow-hidden bg-white/95 border-t border-blue-100 shadow-xl transition-all duration-300 ease-out ${
            menuOpen
              ? "max-h-[420px] opacity-100 pt-3 pb-4"
              : "max-h-0 opacity-0 pt-0 pb-0 pointer-events-none"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 space-y-2 flex flex-col items-center">
            <button
              onClick={() => {
                scrollToSection("beranda");
                setMenuOpen(false);
              }}
              className="w-full text-center px-4 py-3 rounded-2xl text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
            >
              Beranda
            </button>
            <button
              onClick={() => {
                scrollToSection("cara-kerja");
                setMenuOpen(false);
              }}
              className="w-full text-center px-4 py-3 rounded-2xl text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
            >
              Cara Kerja
            </button>
            <button
              onClick={() => {
                scrollToSection("fitur-evaluasi");
                setMenuOpen(false);
              }}
              className="w-full text-center px-4 py-3 rounded-2xl text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
            >
              Fitur Evaluasi
            </button>
            <button
              onClick={() => {
                scrollToSection("testi");
                setMenuOpen(false);
              }}
              className="w-full text-center px-4 py-3 rounded-2xl text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
            >
              Testimoni
            </button>
            <button
              onClick={() => {
                scrollToSection("faq");
                setMenuOpen(false);
              }}
              className="w-full text-center px-4 py-3 rounded-2xl text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
            >
              FAQ
            </button>
            <a
              href="/auth"
              className="block w-full text-center rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-sm font-bold text-white hover:opacity-95 transition-opacity shadow-sm"
            >
              Mulai Gratis
            </a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main
        id="beranda"
        className="relative pt-48 pb-20 px-6 z-10 flex flex-col items-center flex-grow"
      >
        {/* TAMBAHKAN WRAPPER INI UNTUK MEMICU ANIMASI */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center w-full"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] leading-[1.1] font-extrabold tracking-[-0.04em] text-center max-w-5xl relative z-20 text-slate-800 px-6 text-balance"
          >
            Simulasi Sidang <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 50%, #38bdf8 100%)",
              }}
            >
              Tanpa Tegang
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-8 text-lg md:text-xl text-slate-500 text-center max-w-2xl font-medium leading-relaxed z-20 mb-8 text-balance"
          >
            Latih mental dan materimu dengan AI yang didesain khusus menjadi
            dosen penguji. Hadapi pertanyaan tak terduga dan rasakan euforia
            lulus sidang skripsi.
          </motion.p>
        </motion.div>

        {/* Floating Icons di Hero Section */}
        <div
          className="absolute top-[20%] left-[5%] lg:left-[15%] z-10 animate-float-slow pointer-events-none"
          style={{ "--rot": "-15deg" }}
        >
          <svg
            className="w-[60px] md:w-[100px] opacity-70"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: "drop-shadow(0 10px 20px rgba(59,130,246,0.18))" }}
          >
            <defs>
              <linearGradient
                id="cursorGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#bfdbfe" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="cursorEdge" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#dbeafe" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
            <path
              d="M50 40 L160 100 L95 115 L80 180 Z"
              fill="url(#cursorGrad)"
              opacity="0.4"
              transform="translate(10, 15)"
            />
            <path
              d="M40 30 L150 90 L85 105 L70 170 Z"
              fill="url(#cursorGrad)"
              stroke="url(#cursorEdge)"
              strokeWidth="3"
              strokeLinejoin="round"
              opacity="0.85"
            />
          </svg>
        </div>

        {/* Ubah motion.div kembali menjadi div biasa karena animasinya memakai CSS (animate-float-fast) */}
        <div
          className="absolute top-[25%] right-[5%] lg:right-[15%] z-10 animate-float-fast pointer-events-none"
          style={{ "--rot": "10deg" }}
        >
          <svg
            className="w-[70px] md:w-[110px] opacity-70"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: "drop-shadow(0 10px 20px rgba(14,165,233,0.18))" }}
          >
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
            <path
              d="M40 50 C40 35 55 20 70 20 L160 20 C175 20 190 35 190 50 L190 120 C190 135 175 150 160 150 L100 150 L60 190 L60 150 C45 150 40 140 40 120 Z"
              fill="url(#chatGrad)"
              opacity="0.35"
              transform="translate(8, 12)"
            />
            <path
              d="M30 40 C30 25 45 10 60 10 L150 10 C165 10 180 25 180 40 L180 110 C180 125 165 140 150 140 L90 140 L50 180 L50 140 C35 140 30 130 30 110 Z"
              fill="url(#chatGrad)"
              stroke="url(#chatEdge)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              opacity="0.85"
            />
          </svg>
        </div>
      </main>

      {/* LENGKUNGAN KURVA*/}
      <section
        id="cara-kerja"
        className="relative w-full flex flex-col items-center mt-16 overflow-visible z-10"
      >
        {/* Shadow tipis untuk mempertegas lengkungan */}
        <div
          className="absolute -top-[1px] left-0 w-full h-[100px] pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(215,232,255,0.4) 0%, transparent 100%)",
          }}
        ></div>

        <div
          className="relative w-full flex flex-col items-center pt-32 pb-10 mt-[30px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(240,248,255,0.98) 0%, rgba(255,255,255,1) 100%)",
            borderRadius: "50% 50% 0 0 / 8vw 8vw 0 0",
            borderTop: "1px solid rgba(147,197,253,0.5)",
            boxShadow: "0 -15px 40px rgba(59,130,246,0.06)",
          }}
        >
          <button
            onClick={() => handleProtectedRoute("/dashboard-ujian")}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 inline-block text-white px-8 py-3.5 rounded-xl text-base font-bold hover:scale-105 transition-transform z-30 shadow-lg shadow-blue-500/30"
            style={{ background: "linear-gradient(135deg, #2563eb, #0ea5e9)" }}
          >
            Mulai Simulasi
          </button>

          <div className="max-w-7xl w-full px-6 mx-auto flex flex-col items-center text-center relative z-20 mt-8">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-slate-800">
              Cara Kerja{" "}
              <span
                className="inline-block pb-2 text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
                }}
              >
                SkripsiVibe AI
              </span>
            </h2>
            <p className="text-slate-500 mb-16 max-w-2xl text-lg font-medium">
              Simulasi semirip aslinya, didesain untuk melatih mental dan
              penguasaan materi dari presentasi awal hingga evaluasi akhir.
            </p>

            {/* 4 CARA KERJA*/}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 w-full text-left"
            >
              {/* Card 1 */}
              <motion.div
                variants={fadeInUp}
                className="card-hover-effect rounded-[2.5rem] p-6 lg:p-8 flex flex-col group relative overflow-hidden cursor-pointer"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.55) 100%)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(147,197,253,0.6)",
                  boxShadow: "0 15px 35px -15px rgba(59,130,246,0.12)",
                }}
              >
                {/* Glow Corner Background */}
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-blue-400/20 rounded-full blur-2xl pointer-events-none transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-500/30"></div>

                <div
                  className="h-48 rounded-2xl mb-8 flex flex-col items-center justify-center relative overflow-hidden shadow-inner transition-all duration-500 group-hover:border-blue-300"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(219,234,254,0.95) 0%, rgba(191,219,254,0.65) 100%)",
                    border: "1px solid rgba(147,197,253,0.4)",
                  }}
                >
                  <div
                    className="w-24 h-24 border-2 border-dashed rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm group-hover:shadow-md group-hover:scale-110 group-hover:rotate-2"
                    style={{
                      borderColor: "rgba(37,99,235,0.5)",
                      background: "rgba(255,255,255,0.9)",
                    }}
                  >
                    <UploadCloud
                      className="text-blue-600 animate-bounce-short transition-colors duration-300 group-hover:text-blue-700"
                      size={44}
                    />
                  </div>
                  <div className="absolute bottom-3.5 px-3 py-1 rounded-full bg-white/90 border border-blue-200 text-[11px] text-blue-600 font-mono font-bold tracking-wide shadow-xs transition-transform duration-300 group-hover:scale-105">
                    draft_skripsi_final.pdf
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-slate-800 mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-blue-500/25 transition-transform duration-300 group-hover:scale-110">
                    1
                  </span>
                  Import Skripsi
                </h3>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
                  Unggah file PDF skripsi kamu. AI secara kilat membedah latar
                  belakang, metode penelitian, hingga kesimpulanmu.
                </p>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                variants={fadeInUp}
                className="card-hover-effect rounded-[2.5rem] p-6 lg:p-8 flex flex-col group relative overflow-hidden cursor-pointer"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.55) 100%)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(147,197,253,0.6)",
                  boxShadow: "0 15px 35px -15px rgba(59,130,246,0.12)",
                }}
              >
                {/* Glow Corner Background */}
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-sky-400/20 rounded-full blur-2xl pointer-events-none transition-all duration-500 group-hover:scale-150 group-hover:bg-sky-500/30"></div>

                <div
                  className="h-48 rounded-2xl mb-8 flex flex-col items-center justify-center relative overflow-hidden shadow-inner transition-all duration-500 group-hover:border-sky-300"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(219,234,254,0.95) 0%, rgba(191,219,254,0.65) 100%)",
                    border: "1px solid rgba(147,197,253,0.4)",
                  }}
                >
                  <div
                    className="flex items-center gap-2.5 px-4 py-2 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: "rgba(255,255,255,0.95)",
                      border: "1px solid rgba(147,197,253,0.6)",
                    }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-slate-700 font-mono font-extrabold text-xl tracking-wider">
                      10:00
                    </span>
                  </div>
                  {/* Equalizer Bars Effect */}
                  <div className="absolute bottom-5 flex items-end gap-1.5 opacity-70">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full group-hover:h-12 transition-all duration-300"></div>
                    <div className="w-1.5 h-12 bg-blue-500 rounded-full group-hover:h-5 transition-all duration-300 delay-75"></div>
                    <div className="w-1.5 h-8 bg-sky-500 rounded-full group-hover:h-14 transition-all duration-300 delay-150"></div>
                    <div className="w-1.5 h-14 bg-sky-400 rounded-full group-hover:h-7 transition-all duration-300 delay-200"></div>
                    <div className="w-1.5 h-10 bg-blue-400 rounded-full group-hover:h-11 transition-all duration-300 delay-300"></div>
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-slate-800 mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-blue-500/25 transition-transform duration-300 group-hover:scale-110">
                    2
                  </span>
                  Presentasi Video
                </h3>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
                  Mulai pemaparan materimu. Dosen AI mendengarkan secara
                  real-time via mikrofon layaknya Google Meet.
                </p>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                variants={fadeInUp}
                className="card-hover-effect rounded-[2.5rem] p-6 lg:p-8 flex flex-col group relative overflow-hidden cursor-pointer"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.55) 100%)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(147,197,253,0.6)",
                  boxShadow: "0 15px 35px -15px rgba(59,130,246,0.12)",
                }}
              >
                {/* Glow Corner Background */}
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-600/30"></div>

                <div
                  className="h-48 rounded-2xl mb-8 flex flex-col justify-center px-5 relative overflow-hidden shadow-inner transition-all duration-500 group-hover:border-blue-300"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(219,234,254,0.95) 0%, rgba(191,219,254,0.65) 100%)",
                    border: "1px solid rgba(147,197,253,0.4)",
                  }}
                >
                  <div className="w-full space-y-3 relative z-10">
                    <div
                      className="w-10/12 h-10 rounded-xl rounded-bl-none flex items-center px-3 shadow-xs transition-transform duration-300 group-hover:-translate-x-1"
                      style={{
                        background: "rgba(255,255,255,0.95)",
                        border: "1px solid rgba(203,213,225,0.6)",
                      }}
                    >
                      <div className="w-full h-2 bg-slate-300 rounded-full opacity-70"></div>
                    </div>
                    <div
                      className="w-9/12 h-10 rounded-xl rounded-br-none ml-auto flex items-center px-3 shadow-xs transition-transform duration-300 group-hover:translate-x-1"
                      style={{
                        background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
                      }}
                    >
                      <div className="w-full h-2 bg-blue-200/80 rounded-full"></div>
                    </div>
                  </div>
                  <MessageSquare
                    className="absolute -right-3 -bottom-3 text-blue-400/25 group-hover:text-blue-500/35 group-hover:scale-115 group-hover:-rotate-6 transition-all duration-500"
                    size={110}
                  />
                </div>

                <h3 className="text-xl font-extrabold text-slate-800 mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-blue-500/25 transition-transform duration-300 group-hover:scale-110">
                    3
                  </span>
                  Tanya Jawab Suara
                </h3>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
                  Hadapi pertanyaan tajam dan kritis. Pilih mode santai atau
                  "Killer" untuk simulasi ujian sesungguhnya.
                </p>
              </motion.div>

              {/* Card 4 */}
              <motion.div
                variants={fadeInUp}
                className="card-hover-effect rounded-[2.5rem] p-6 lg:p-8 flex flex-col group relative overflow-hidden cursor-pointer"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.55) 100%)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(147,197,253,0.6)",
                  boxShadow: "0 15px 35px -15px rgba(59,130,246,0.12)",
                }}
              >
                {/* Glow Corner Background */}
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none transition-all duration-500 group-hover:scale-150 group-hover:bg-emerald-500/30"></div>

                <div
                  className="h-48 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden shadow-inner transition-all duration-500 group-hover:border-emerald-300"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(219,234,254,0.95) 0%, rgba(191,219,254,0.65) 100%)",
                    border: "1px solid rgba(147,197,253,0.4)",
                  }}
                >
                  <div
                    className="relative w-24 h-24 rounded-full flex items-center justify-center bg-white/90 shadow-sm transition-transform duration-500 group-hover:scale-110"
                    style={{ border: "6px solid rgba(186,230,255,0.6)" }}
                  >
                    <div className="absolute inset-0 rounded-full border-[6px] border-emerald-500 border-l-transparent border-b-transparent -rotate-45 group-hover:rotate-[315deg] transition-transform duration-700 ease-in-out"></div>
                    <span className="text-2xl font-black text-slate-700 group-hover:text-emerald-600 transition-colors duration-300">
                      A
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-1 bg-white/90 p-1.5 rounded-full border border-blue-100 shadow-xs transition-transform duration-300 group-hover:scale-105">
                    <div className="w-1.5 h-4 bg-emerald-300 rounded-full"></div>
                    <div className="w-1.5 h-6 bg-emerald-400 rounded-full"></div>
                    <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-slate-800 mb-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-blue-500/25 transition-transform duration-300 group-hover:scale-110">
                    4
                  </span>
                  Dashboard Evaluasi
                </h3>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
                  Dapatkan penilaian instan, analisis tingkat kepahaman, serta
                  skor kesiapan sidang secara komprehensif.
                </p>
              </motion.div>
            </motion.div>

            {/* FITUR DETAIL EVALUASI AI */}
            <div
              id="fitur-evaluasi"
              className="w-full mt-32 md:mt-48 flex flex-col gap-28 lg:gap-36 pt-10 z-20"
            >
              {/* Header Section */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 border border-blue-200/60 text-blue-600 text-xs font-bold tracking-[0.2em] uppercase mb-4 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  Teknologi Analisis Mendalam
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight max-w-4xl mx-auto">
                  Lebih dari sekadar skor. <br className="hidden md:block" />
                  Ini adalah{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
                    Feedback Real.
                  </span>
                </h2>
              </div>

              {/* FITUR 1: Grading Kampus & Metrik Spesifik */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
                className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 text-left"
              >
                {/* Left Visual Card */}
                <motion.div variants={slideInLeft} className="w-full md:w-1/2">
                  <div className="group relative w-full rounded-[2.5rem] bg-gradient-to-br from-white/90 via-blue-50/30 to-white/90 border border-blue-200/70 shadow-2xl shadow-blue-500/10 p-8 flex flex-col gap-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-blue-400">
                    <div className="flex justify-between items-center border-b border-slate-100/80 pb-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Nilai Akhir Simulasi
                        </p>
                        <div className="flex items-end gap-3">
                          <span className="text-5xl font-black text-slate-800 tracking-tight">
                            88.5
                          </span>
                          <span className="text-xl font-bold text-emerald-500 mb-1">
                            / 100
                          </span>
                        </div>
                      </div>
                      <div className="relative w-20 h-20 rounded-full border-[5px] border-emerald-400 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100/50 shadow-inner group-hover:scale-105 transition-transform">
                        <span className="text-3xl font-black text-emerald-600">
                          A
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Progress Bars */}
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-bold text-slate-700">
                            Pemahaman Materi
                          </span>
                          <span className="text-blue-600 font-extrabold">
                            90%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 shadow-inner">
                          <div className="bg-gradient-to-r from-blue-500 to-sky-400 h-2 rounded-full w-[90%] transition-all duration-1000"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-bold text-slate-700">
                            Kesesuaian Jawaban
                          </span>
                          <span className="text-blue-600 font-extrabold">
                            85%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 shadow-inner">
                          <div className="bg-gradient-to-r from-blue-500 to-sky-400 h-2 rounded-full w-[85%] transition-all duration-1000"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-bold text-slate-700">
                            Kepercayaan Diri
                          </span>
                          <span className="text-sky-500 font-extrabold">
                            82%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 shadow-inner">
                          <div className="bg-gradient-to-r from-sky-400 to-cyan-400 h-2 rounded-full w-[82%] transition-all duration-1000"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Right Text Description */}
                <motion.div
                  variants={slideInRight}
                  className="w-full md:w-1/2 space-y-6"
                  style={getFeatureItemStyle("right", 0)}
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-100/60 text-blue-700 text-xs font-extrabold tracking-wider uppercase border border-blue-200/50">
                    <span className="text-blue-600 font-black"></span> Standar
                    Penilaian Kampus
                  </div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800 leading-tight">
                    Grading & Skor Metrik Detail
                  </h3>
                  <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium">
                    Sistem tidak hanya memberikan estimasi nilai huruf (A/B/C/D)
                    dan angka yang menyesuaikan standar akademik kampus. AI
                    membedah performamu menjadi 3 metrik krusial:
                  </p>
                  <ul className="space-y-3 pt-2">
                    {[
                      "Pemahaman Materi Penelitian",
                      "Kesesuaian Jawaban dengan Teori",
                      "Tingkat Kepercayaan Diri & Artikulasi",
                    ].map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 text-slate-700 font-bold text-base md:text-lg"
                      >
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-extrabold">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>

              {/* FITUR 2: Evaluasi & Strategi (Light Mode Harmonized) */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
                className="flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-20 text-left"
              >
                {/* Left Text Description */}
                <motion.div
                  variants={slideInLeft}
                  className="w-full md:w-1/2 space-y-6"
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-100/60 text-sky-700 text-xs font-extrabold tracking-wider uppercase border border-sky-200/50">
                    <span className="text-sky-600 font-black"></span>{" "}
                    Personalized Blueprint
                  </div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800 leading-tight">
                    Evaluasi & Strategi Peningkatan
                  </h3>
                  <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium">
                    Kamu akan tahu persis apa{" "}
                    <strong className="text-slate-800">keunggulanmu</strong>{" "}
                    yang harus dipertahankan, area yang{" "}
                    <strong className="text-slate-800">
                      perlu ditingkatkan
                    </strong>
                    , serta panduan langkah konkret sebelum hari H.
                  </p>
                </motion.div>

                {/* Right Visual Card */}
                <motion.div variants={slideInRight} className="w-full md:w-1/2">
                  <div className="group relative w-full rounded-[2.5rem] bg-gradient-to-br from-white/90 via-slate-50/50 to-white/90 border border-slate-200/80 shadow-2xl p-6 md:p-8 flex flex-col gap-4 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-blue-300">
                    {/* Keunggulan Card */}
                    <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 transition-transform duration-300 group-hover:translate-x-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <Target className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-950 font-extrabold text-base">
                          Keunggulan
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">
                        Metodologi dijelaskan dengan sangat runut, logis, dan
                        mudah dipahami penguji.
                      </p>
                    </div>

                    {/* Area Perbaikan Card */}
                    <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-100 transition-transform duration-300 group-hover:translate-x-1 delay-75">
                      <div className="flex items-center gap-3 mb-1.5">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <span className="text-amber-950 font-extrabold text-base">
                          Area Perbaikan
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">
                        Sedikit ragu saat membatasi ruang lingkup. Argumen Bab 2
                        kurang didukung teori utama.
                      </p>
                    </div>

                    {/* Strategi Nilai A Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-5 rounded-2xl shadow-lg text-white transition-transform duration-300 group-hover:translate-x-1 delay-150">
                      <div className="flex items-center gap-3 mb-1.5">
                        <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                        <span className="font-extrabold text-base">
                          Strategi Nilai A
                        </span>
                      </div>
                      <p className="text-blue-50 text-sm md:text-base font-medium leading-relaxed">
                        Kuasai 2 teori rujukan utama di Bab 2 sebagai pertahanan
                        kuat saat diserang dosen penguji.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* FITUR 3: Feedback Spesifik Q&A */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
                className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 text-left"
              >
                {/* Left Visual Card */}
                <motion.div variants={slideInLeft} className="w-full md:w-1/2">
                  <div className="group relative w-full rounded-[2.5rem] bg-gradient-to-br from-white/90 via-slate-50/50 to-white/90 border border-slate-200/80 shadow-2xl p-6 md:p-8 flex flex-col gap-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-blue-300">
                    {/* Pertanyaan Dosen AI */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
                      <p className="text-xs text-blue-600 mb-1.5 font-extrabold uppercase tracking-wider">
                        Pertanyaan Dosen AI
                      </p>
                      <p className="text-base md:text-lg font-bold text-slate-800">
                        "Kenapa Anda menggunakan algoritma X dibandingkan Y?"
                      </p>
                    </div>

                    {/* Jawaban Kurang Tepat & Koreksi */}
                    <div className="ml-4 md:ml-8 bg-red-50/70 p-5 rounded-2xl border border-red-100 relative shadow-xs">
                      <div className="absolute -left-4 top-5 w-8 h-8 rounded-full bg-red-500 text-white border-2 border-white flex items-center justify-center font-bold text-lg shadow-sm">
                        !
                      </div>
                      <p className="text-xs text-red-600 mb-1 font-extrabold uppercase tracking-wider">
                        Jawaban Kurang Tepat
                      </p>
                      <p className="text-sm md:text-base text-slate-700 mb-3 font-medium">
                        Kamu menjawab karena algoritma X lebih cepat, padahal
                        dataset penelitianmu tergolong kecil.
                      </p>
                      <div className="bg-white/90 p-4 rounded-xl border border-red-100 shadow-xs">
                        <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                          <strong className="text-emerald-600 font-extrabold">
                            Seharusnya:
                          </strong>{" "}
                          Jelaskan bahwa algoritma X terbukti lebih akurat untuk
                          tipe data berderau (*noise*) sesuai karakteristik data
                          penelitianmu.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Right Text Description */}
                <motion.div
                  variants={slideInRight}
                  className="w-full md:w-1/2 space-y-6"
                  style={getFeatureItemStyle("right", 2)}
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-100/60 text-emerald-700 text-xs font-extrabold tracking-wider uppercase border border-emerald-200/50">
                    <span className="text-emerald-600 font-black"></span>{" "}
                    Micro-Feedback Analysis
                  </div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800 leading-tight">
                    Koreksi Akurat Tiap Pertanyaan
                  </h3>
                  <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium">
                    Sistem membedah ucapanmu kata per kata. Jika jawabanmu{" "}
                    <strong className="text-slate-800">salah</strong>, AI
                    memberi tahu titik lemahnya. Jika{" "}
                    <strong className="text-slate-800">kurang tepat</strong>, AI
                    meluruskannya. Bahkan jika{" "}
                    <strong className="text-slate-800">benar</strong>, AI
                    memandu cara penyampaian agar terkesan lebih expert di depan
                    dosen penguji.
                  </p>
                </motion.div>
              </motion.div>
            </div>

            {/* DEMO APLIKASI */}
            <motion.div
              id="demo"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="w-full mt-32 md:mt-40 relative flex flex-col items-center z-30 pt-10 px-6"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-8 md:mb-12 text-slate-800 tracking-tight text-center"
              >
                Lihat Bagaimana AI Bekerja
              </motion.h2>

              <motion.div
                variants={fadeInUp}
                className="relative w-full max-w-5xl p-2 md:p-3 rounded-2xl md:rounded-[2rem] bg-white/60 backdrop-blur-lg border border-blue-200 shadow-2xl transition-transform duration-500 hover:scale-[1.01]"
              >
                <div className="relative w-full aspect-video rounded-xl md:rounded-[1.5rem] overflow-hidden bg-slate-900 shadow-inner border border-slate-800/50">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    /* Link embed sudah disesuaikan dengan ID L-VSrx0eWKY */
                    src="https://www.youtube.com/embed/L-VSrx0eWKY?autoplay=0&controls=1&rel=0"
                    title="Demo SkripsiVibe AI"
                    allowFullScreen
                  ></iframe>
                </div>
              </motion.div>
            </motion.div>

            <motion.section
              className="relative w-full z-20 flex justify-center mt-40 mb-24 px-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
            >
              <div className="max-w-5xl w-full">
                <motion.p
                  variants={fadeInUp}
                  className="text-blue-600 text-base font-bold tracking-widest uppercase mb-8 flex items-center justify-center md:justify-start gap-3"
                >
                  Mengapa SkripsiVibe AI?
                </motion.p>

                <motion.h2
                  variants={textContainerVariant}
                  className="text-3xl md:text-4xl lg:text-[3.5rem] font-extrabold leading-relaxed md:leading-[1.6] text-center md:text-left tracking-tight mb-8"
                >
                  {"SkripsiVibe AI bukan cuma tools biasa. Ini adalah copilot yang nemenin kamu dari awal sampai sidang, tanpa menggantikan peran kamu sebagai peneliti sejati."
                    .split(" ")
                    .map((word, index) => (
                      /* Gunakan React.Fragment agar spasi dirender sebagai elemen terpisah di luar span */
                      <React.Fragment key={index}>
                        <span className="inline-block overflow-hidden">
                          <motion.span
                            variants={textChildVariant}
                            className="inline-block"
                          >
                            {word}
                          </motion.span>
                        </span>{" "}
                        {/* Spasi diletakkan di luar span overflow-hidden */}
                      </React.Fragment>
                    ))}
                </motion.h2>
              </div>
            </motion.section>

            {/* TESTIMONIALS (WALL OF LOVE) */}
            <section
              id="testi"
              className="relative w-full z-20 flex flex-col items-center mt-12 mb-24 px-6 overflow-hidden"
            >
              {/* Background Glow Premium */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-400/25 to-sky-300/25 blur-[140px] rounded-full pointer-events-none -z-10"></div>

              {/* Header Section */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="text-center mb-16 max-w-3xl mx-auto"
              >
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-blue-200/60 text-blue-600 text-xs font-bold tracking-[0.2em] uppercase mb-6 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Wall of Love & Success Stories
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 mb-6 tracking-tight leading-[1.15]">
                  Cerita Mereka yang <br className="hidden md:block" />
                  <span
                    className="text-transparent bg-clip-text"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)",
                    }}
                  >
                    Lulus Sidang Tanpa Tegang
                  </span>
                </h2>
                <p className="text-slate-500 text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                  Ribuan mahasiswa dari berbagai perguruan tinggi telah
                  membuktikan efektivitas latihan bersama Dosen AI sebelum
                  menghadapi sidang sungguhan.
                </p>
              </motion.div>

              {/* Marquee Container dengan Mask Gradient Kiri-Kanan */}
              <div className="relative w-full max-w-[1450px] mx-auto flex flex-col gap-8 overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent_0%,black_12%,black_88%,transparent_100%)]">
                {/* Baris 1: Geser ke Kiri */}
                <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
                  {[0, 1].map((copy) => (
                    <div key={`row1-${copy}`} className="flex gap-8 pr-8">
                      {testimonialsRow1.map((t, i) => (
                        <div
                          key={i}
                          className="w-[340px] md:w-[440px] p-8 rounded-[2rem] flex flex-col justify-between group transition-all duration-500 hover:-translate-y-2.5 hover:shadow-2xl hover:border-blue-300 cursor-default relative overflow-hidden"
                          style={{
                            background:
                              "linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.45) 100%)",
                            backdropFilter: "blur(24px)",
                            border: "1px solid rgba(255,255,255,0.9)",
                            boxShadow:
                              "0 12px 40px -12px rgba(59,130,246,0.12)",
                          }}
                        >
                          {/* Aksen kilau tipis di sudut kartu */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-bl-full pointer-events-none"></div>

                          <div>
                            {/* Bintang */}
                            <div className="flex gap-1 mb-5">
                              {[...Array(5)].map((_, idx) => (
                                <svg
                                  key={idx}
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="#f59e0b"
                                  stroke="#f59e0b"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                              ))}
                            </div>
                            <p className="text-slate-700 text-base md:text-[1.055rem] leading-relaxed mb-8 font-medium">
                              "{t.quote}"
                            </p>
                          </div>

                          <div className="flex items-center gap-4 pt-4 border-t border-blue-100/60 justify-start">
                            {/* Avatar Inisial */}
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform"
                              style={{
                                background:
                                  "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                                border: "2px solid white",
                              }}
                            >
                              {t.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-slate-800 font-bold text-sm tracking-tight text-left">
                                {t.name}
                              </p>
                              <p className="text-blue-600/80 text-xs font-semibold mt-0.5 text-left">
                                {t.role}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Baris 2: Geser ke Kanan */}
                <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused]">
                  {[0, 1].map((copy) => (
                    <div key={`row2-${copy}`} className="flex gap-8 pr-8">
                      {testimonialsRow2.map((t, i) => (
                        <div
                          key={i}
                          className="w-[340px] md:w-[440px] p-8 rounded-[2rem] flex flex-col justify-between group transition-all duration-500 hover:-translate-y-2.5 hover:shadow-2xl hover:border-blue-300 cursor-default relative overflow-hidden"
                          style={{
                            background:
                              "linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.45) 100%)",
                            backdropFilter: "blur(24px)",
                            border: "1px solid rgba(255,255,255,0.9)",
                            boxShadow:
                              "0 12px 40px -12px rgba(59,130,246,0.12)",
                          }}
                        >
                          {/* Aksen kilau tipis di sudut kartu */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-400/10 to-transparent rounded-bl-full pointer-events-none"></div>

                          <div>
                            {/* Bintang */}
                            <div className="flex gap-1 mb-5">
                              {[...Array(5)].map((_, idx) => (
                                <svg
                                  key={idx}
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="#f59e0b"
                                  stroke="#f59e0b"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                              ))}
                            </div>
                            <p className="text-slate-700 text-base md:text-[1.055rem] leading-relaxed mb-8 font-medium">
                              "{t.quote}"
                            </p>
                          </div>

                          <div className="flex items-center gap-4 pt-4 border-t border-blue-100/60">
                            {/* Avatar Inisial */}
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform"
                              style={{
                                background:
                                  "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                                border: "2px solid white",
                              }}
                            >
                              {t.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-slate-800 font-bold text-sm tracking-tight text-left">
                                {t.name}
                              </p>
                              <p className="text-blue-600/80 text-xs font-semibold mt-0.5 text-left">
                                {t.role}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ */}
            <motion.section
              id="faq"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="w-full z-20 flex flex-col items-center pt-10 mb-32"
            >
              <div className="max-w-3xl w-full text-left">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
                    Ada pertanyaan?
                  </h2>
                  <p className="text-slate-500 text-lg">
                    Temukan jawaban untuk pertanyaan yang sering diajukan
                  </p>
                </div>
                <div className="space-y-4">
                  {faqData.map((faq, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <div
                        key={index}
                        className="border border-blue-100 rounded-2xl bg-white/50 backdrop-blur-sm overflow-hidden transition-all duration-300"
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : index)}
                          className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-blue-50/50 transition-colors"
                        >
                          <span
                            className={`text-lg font-semibold ${isOpen ? "text-blue-600" : "text-slate-700"}`}
                          >
                            {faq.question}
                          </span>
                          {isOpen ? (
                            <Minus className="text-blue-500 w-6 h-6 flex-shrink-0" />
                          ) : (
                            <Plus className="text-slate-400 w-6 h-6 flex-shrink-0" />
                          )}
                        </button>
                        <div
                          className={`px-6 md:px-8 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 pb-8 opacity-100" : "max-h-0 opacity-0"}`}
                        >
                          <p className="text-slate-500 text-base leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.section>

            {/* FOOTER MINIMALIS */}
            <footer
              className="w-full pt-5 pb-8 border-t border-blue-200 mt-auto"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(219,234,254,0.4) 100%)",
              }}
            >
              <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col">
                {/* Bagian Atas: Copyright & Tagline */}
                <div className="mb-12 md:mb-16 text-left w-full">
                  <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">
                    &copy; {new Date().getFullYear()} SkripsiVibe AI{" "}
                    <span className="hidden md:inline mx-3 text-slate-300">
                      |
                    </span>
                    <br className="md:hidden" />
                    Hadirkan kecerdasan AI untuk bantu setiap mahasiswa lulus
                    sidang skripsi tanpa tegang.
                  </p>
                </div>

                {/* Bagian Bawah: Logo & Teks Raksasa (Selalu Sejajar Nyamping di Semua Device) */}
                <div className="flex flex-row items-center justify-center w-full opacity-90 overflow-hidden gap-3 md:gap-6">
                  <img
                    src="https://res.cloudinary.com/doabehyrn/image/upload/v1780575299/skripsivibeai-logo_gdzxnq.png"
                    alt="Logo SkripsiVibe AI"
                    className="w-[18vw] h-[18vw] md:w-[14vw] md:h-[14vw] xl:w-[160px] xl:h-[160px] object-contain"
                  />
                  <span className="font-extrabold text-[9vw] md:text-[6vw] xl:text-[85px] tracking-tighter text-slate-800 leading-none whitespace-nowrap mb-1 md:mb-2 xl:mb-4">
                    SkripsiVibe AI
                  </span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </section>
    </div>
  );
}
