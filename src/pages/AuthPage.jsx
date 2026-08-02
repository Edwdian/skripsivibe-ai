import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  reload,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import emailjs from "@emailjs/browser";

import {
  Eye,
  EyeOff,
  CheckCircle,
  KeyRound,
  ShieldCheck,
  Mail,
  Lock,
  User,
  GraduationCap,
  Sparkles,
  FileText,
  Cpu,
  ArrowLeft,
} from "lucide-react";

import { auth, db } from "../firebase/config.js";
import logoSkripsiVibe from "../assets/logo skripsivibe.jpeg";

const EMAILJS_SERVICE_ID = "service_8jwzrs7";
const EMAILJS_TEMPLATE_ID = "template_smhde1e";
const EMAILJS_PUBLIC_KEY = "0O2DeYRJndy1t7a5N";

const RESET_PASSWORD_URL =
  "https://us-central1-skripsivibe-ai.cloudfunctions.net/resetUserPassword";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function saveOTPToFirestore(email, otp) {
  const otpRef = collection(db, "passwordResetOTPs");
  const q = query(otpRef, where("email", "==", email));
  const existing = await getDocs(q);
  existing.forEach(async (d) => await deleteDoc(d.ref));
  await addDoc(otpRef, {
    email,
    otp,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });
}

async function verifyOTPFromFirestore(email, inputOtp) {
  const q = query(
    collection(db, "passwordResetOTPs"),
    where("email", "==", email),
    where("otp", "==", inputOtp),
  );
  const snap = await getDocs(q);
  if (snap.empty) return { valid: false, reason: "Kode OTP salah" };
  const data = snap.docs[0].data();
  const expires = data.expiresAt.toDate
    ? data.expiresAt.toDate()
    : new Date(data.expiresAt);
  if (new Date() > expires) {
    await deleteDoc(snap.docs[0].ref);
    return { valid: false, reason: "Kode OTP sudah kadaluarsa" };
  }
  await deleteDoc(snap.docs[0].ref);
  return { valid: true };
}

async function sendOTPEmail(email, otp) {
  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    { to_email: email, otp_code: otp },
    EMAILJS_PUBLIC_KEY,
  );
}

export default function AuthPage() {
  const navigate = useNavigate();

  // State Manajemen Mode
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [otpTimer, setOtpTimer] = useState(600);
  const timerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifyError, setVerifyError] = useState("");

  // Polling Status Email Verified
  useEffect(() => {
    if (mode !== "verify-email") return;
    const interval = setInterval(async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        await reload(user);
        if (user.emailVerified) {
          clearInterval(interval);
          await auth.signOut();
          setMode("verified-success");
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [mode]);

  const isValidGmail = (e) => e?.toLowerCase().trim().endsWith("@gmail.com");

  useEffect(() => {
    if (mode === "otp") {
      setOtpTimer(600);
      timerRef.current = setInterval(() => {
        setOtpTimer((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [mode]);

  const formatTimer = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  useEffect(() => {
    if (email)
      setEmailError(
        isValidGmail(email) ? "" : "Hanya email @gmail.com yang diperbolehkan",
      );
    else setEmailError("");
  }, [email]);

  useEffect(() => {
    if (password && ["login", "register", "new-password"].includes(mode)) {
      setPasswordError(
        password.length >= 6 ? "" : "Password minimal 6 karakter",
      );
    } else {
      setPasswordError("");
    }
  }, [password, mode]);

  const resetErrors = () => {
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setOtpError("");
    setVerifyError("");
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    setOtpError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  // ── FUNKSI LOGIN GOOGLE ──────────────────────────
  const handleGoogleSignIn = async () => {
    resetErrors();
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Simpan/sinkronkan data user di Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          name: user.displayName || "Pengguna Google",
          email: user.email?.toLowerCase().trim(),
          photoURL: user.photoURL || "",
          createdAt: new Date(),
        });
      }

      // Google Account otomatis terverifikasi oleh Firebase
      navigate("/dashboard-user");
    } catch (error) {
      console.error("Google Auth Error:", error);
      setEmailError("Gagal login dengan Google. Silakan coba lagi.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setVerifyError("");
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setVerifyError("✅ Email verifikasi berhasil dikirim ulang!");
      }
    } catch (err) {
      if (err.code === "auth/too-many-requests") {
        setVerifyError("Terlalu banyak permintaan. Tunggu beberapa menit.");
      } else {
        setVerifyError("Gagal mengirim ulang. Coba lagi.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    resetErrors();
    setLoading(true);

    try {
      // ── FORGOT ────────────────────────────
      if (mode === "forgot") {
        if (!email || !isValidGmail(email)) {
          setEmailError("Masukkan email @gmail.com yang valid");
          return;
        }
        const q = query(
          collection(db, "users"),
          where("email", "==", email.toLowerCase().trim()),
        );
        const snap = await getDocs(q);
        if (snap.empty) {
          setEmailError("Email belum terdaftar di sistem kami");
          return;
        }
        const otp = generateOTP();
        await saveOTPToFirestore(email.toLowerCase().trim(), otp);
        await sendOTPEmail(email.toLowerCase().trim(), otp);
        setMode("otp");
        return;
      }

      // ── OTP ───────────────────────────────
      if (mode === "otp") {
        const otpValue = otpDigits.join("");
        if (otpValue.length < 6) {
          setOtpError("Masukkan 6 digit kode OTP");
          return;
        }
        if (otpTimer === 0) {
          setOtpError("Kode OTP sudah kadaluarsa. Minta kode baru.");
          return;
        }
        const result = await verifyOTPFromFirestore(
          email.toLowerCase().trim(),
          otpValue,
        );
        if (!result.valid) {
          setOtpError(result.reason);
          return;
        }
        setMode("new-password");
        return;
      }

      // ── NEW PASSWORD ──────────────────────
      if (mode === "new-password") {
        if (!password || password.length < 6) {
          setPasswordError("Password minimal 6 karakter");
          return;
        }
        if (password !== confirmPassword) {
          setPasswordError("Password dan konfirmasi tidak cocok");
          return;
        }
        const response = await fetch(RESET_PASSWORD_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            newPassword: password,
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          setPasswordError(result.error || "Gagal mengubah password");
          return;
        }
        setMode("reset-success");
        return;
      }

      // ── LOGIN ─────────────────────────────
      if (mode === "login") {
        if (!email || !isValidGmail(email)) {
          setEmailError("Hanya email @gmail.com yang diperbolehkan");
          return;
        }
        if (!password || password.length < 6) {
          setPasswordError("Password minimal 6 karakter");
          return;
        }

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const user = userCredential.user;

        if (!user.emailVerified) {
          await sendEmailVerification(user);
          setMode("verify-email");
          return;
        }

        navigate("/dashboard-user");
        return;
      }

      // ── REGISTER ──────────────────────────
      if (mode === "register") {
        if (!name.trim()) {
          setNameError("Nama lengkap wajib diisi");
          return;
        }
        if (!email || !isValidGmail(email)) {
          setEmailError("Hanya email @gmail.com yang diperbolehkan");
          return;
        }
        if (!password || password.length < 6) {
          setPasswordError("Password minimal 6 karakter");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          createdAt: new Date(),
        });

        await sendEmailVerification(userCredential.user);
        setMode("verify-email");
        return;
      }
    } catch (error) {
      console.error(error);
      if (mode === "login") {
        if (
          error.code === "auth/user-not-found" ||
          error.code === "auth/invalid-credential"
        ) {
          setEmailError("Email atau password salah");
        } else if (error.code === "auth/wrong-password") {
          setPasswordError("Password salah");
        } else {
          setEmailError("Email atau password salah");
        }
      } else if (mode === "register") {
        if (error.code === "auth/email-already-in-use")
          setEmailError("Email sudah digunakan");
        else setEmailError("Terjadi kesalahan saat registrasi");
      } else if (mode === "forgot") {
        setEmailError("Gagal mengirim OTP. Coba lagi.");
      } else if (mode === "otp") {
        setOtpError("Terjadi kesalahan verifikasi. Coba lagi.");
      } else if (mode === "new-password") {
        setPasswordError("Gagal mengubah password. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 540 || loading) return;
    setLoading(true);
    try {
      const otp = generateOTP();
      await saveOTPToFirestore(email.toLowerCase().trim(), otp);
      await sendOTPEmail(email.toLowerCase().trim(), otp);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpTimer(600);
      setOtpError("");
    } catch {
      setOtpError("Gagal mengirim ulang OTP");
    } finally {
      setLoading(false);
    }
  };

  const goBackToLogin = () => {
    setMode("login");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOtpDigits(["", "", "", "", "", ""]);
    resetErrors();
  };

  const titles = {
    login: "Masuk ke Akun",
    register: "Buat Akun Baru",
    forgot: "Lupa Password",
    otp: "Verifikasi Kode",
    "new-password": "Buat Password Baru",
    "reset-success": "Berhasil!",
    "verify-email": "Verifikasi Email",
    "verified-success": "Email Terverifikasi!",
  };

  const subtitles = {
    login: "Masukkan kredensial Anda untuk mengakses SkripsiVibe AI.",
    register: "Daftar untuk memulai simulasi sidang & penulisan skripsi.",
    forgot: "Masukkan email terdaftar untuk menerima kode OTP.",
    otp: `Kode 6 digit telah dikirimkan ke ${email}`,
    "new-password": "Buat password baru yang aman untuk akun Anda.",
    "reset-success": "Password Anda telah berhasil diubah.",
    "verify-email": "Buka inbox Gmail kamu dan klik link verifikasi.",
    "verified-success": "Akun kamu sudah aktif, silakan login.",
  };

  return (
    <div
      className="min-h-screen text-slate-800 font-sans overflow-x-hidden selection:bg-blue-200 selection:text-blue-900 flex flex-col justify-between relative"
      style={{
        background:
          "linear-gradient(160deg, #e0f2ff 0%, #cfe8ff 25%, #b9dcff 55%, #d9efff 100%)",
      }}
    >
      {/* Background Soft Blobs */}
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
        />
        <div
          className="absolute top-[25%] right-[-8%] w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(125,211,252,0.32) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[5%] left-[5%] w-[450px] h-[450px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(191,219,254,0.42) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-[60%] left-[40%] w-[350px] h-[350px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(186,230,255,0.18) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* NAVBAR SEDERHANA */}
      <header className="relative z-20 w-full pt-6 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group text-left"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center relative transition-transform group-hover:scale-105"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(147,197,253,0.6)",
                boxShadow: "0 0 20px rgba(96,165,250,0.25)",
              }}
            >
              <img
                src={logoSkripsiVibe}
                alt="Logo SkripsiVibe"
                className="w-full h-full object-cover p-1"
              />
            </div>
            <span className="font-bold text-lg tracking-wide text-slate-800">
              SkripsiVibe<span className="text-blue-600"> AI</span>
            </span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors bg-white/50 backdrop-blur-md px-3.5 py-2 rounded-xl border border-blue-200/60 shadow-sm"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Beranda</span>
          </button>
        </div>
      </header>

      {/* SEKSI KONTEN UTAMA */}
      <main className="relative z-10 my-auto py-8 px-4 sm:px-6 flex items-center justify-center">
        <div
          className="w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col lg:flex-row"
          style={{
            background: "rgba(255, 255, 255, 0.65)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow:
              "0 20px 50px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(147, 197, 253, 0.3)",
          }}
        >
          {/* SEKSI KIRI: BRANDING */}
          <div
            className="hidden lg:flex lg:w-5/12 p-10 flex-col justify-between relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(239, 246, 255, 0.7) 0%, rgba(219, 234, 254, 0.5) 100%)",
              borderRight: "1px solid rgba(191, 219, 254, 0.6)",
            }}
          >
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-blue-200 text-[11px] font-bold text-blue-600 shadow-sm">
                <Sparkles size={12} className="text-sky-500" />
                <span>AI Student Assistant</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-snug">
                Simulasi Sidang <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
                  Tanpa Rasa Tegang
                </span>
              </h2>
            </div>

            <div className="relative z-10 my-8 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border border-blue-300/50 bg-gradient-to-tr from-blue-100/60 to-white/80 flex items-center justify-center backdrop-blur-md relative shadow-inner">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
                    boxShadow: "0 8px 25px rgba(59, 130, 246, 0.4)",
                  }}
                >
                  <GraduationCap size={44} />
                </div>

                <div className="absolute -top-2 -left-3 bg-white border border-blue-200 p-2 rounded-xl shadow-md text-blue-500 animate-bounce">
                  <FileText size={18} />
                </div>
                <div className="absolute -bottom-1 -right-3 bg-white border border-blue-200 p-2 rounded-xl shadow-md text-sky-500">
                  <Cpu size={18} />
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Persiapkan mental & kuasai materi skripsimu bersama Dosen AI
                interaktif kapan saja.
              </p>
              <div className="mt-4 pt-4 border-t border-blue-200/60 flex items-center gap-2 text-[11px] text-slate-600 font-semibold">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>Kredensial Aman & Terenskripsi</span>
              </div>
            </div>
          </div>

          {/* SEKSI KANAN: FORM INPUT */}
          <div className="w-full lg:w-7/12 p-8 sm:p-12 flex flex-col justify-center bg-white/40">
            <div className="w-full max-w-sm mx-auto space-y-6">
              {/* Header Icon untuk Mode Tertentu */}
              {mode === "otp" && (
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                    <ShieldCheck size={26} />
                  </div>
                </div>
              )}
              {mode === "new-password" && (
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                    <KeyRound size={26} />
                  </div>
                </div>
              )}
              {mode === "verify-email" && (
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                    <Mail size={26} />
                  </div>
                </div>
              )}

              {/* Title & Subtitle */}
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {titles[mode]}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                  {subtitles[mode]}
                </p>
              </div>

              {/* Form Input Email & Pass */}
              <form onSubmit={handleAuth} className="space-y-4">
                {/* FIELD: NAMA LENGKAP */}
                {mode === "register" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        required
                        placeholder="Nama lengkap Anda"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-blue-200/80 rounded-xl outline-none text-slate-800 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder:text-slate-400 font-medium"
                      />
                    </div>
                    {nameError && (
                      <p className="text-red-500 text-xs font-medium">
                        {nameError}
                      </p>
                    )}
                  </div>
                )}

                {/* FIELD: EMAIL */}
                {["login", "register", "forgot"].includes(mode) && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="email"
                        required
                        placeholder="email@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-blue-200/80 rounded-xl outline-none text-slate-800 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder:text-slate-400 font-medium"
                      />
                    </div>
                    {emailError && (
                      <p className="text-red-500 text-xs font-medium">
                        {emailError}
                      </p>
                    )}
                  </div>
                )}

                {/* FIELD: PASSWORD */}
                {["login", "register"].includes(mode) && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-11 py-2.5 bg-white/80 border border-blue-200/80 rounded-xl outline-none text-slate-800 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder:text-slate-400 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>

                    {/* OPSI BAWAH FIELD: ERROR & LUPA SANDI */}
                    <div className="flex justify-between items-center pt-0.5">
                      <div>
                        {passwordError && (
                          <p className="text-red-500 text-xs font-medium">
                            {passwordError}
                          </p>
                        )}
                      </div>

                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode("forgot");
                            resetErrors();
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors ml-auto"
                        >
                          Lupa sandi?
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* BUTTON LOGIN GOOGLE (Tampil di Mode Login & Register) */}
                {["login", "register"].includes(mode) && (
                  <div className="space-y-4">
                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-blue-200/80 w-full" />
                      <span className="bg-white/60 backdrop-blur-sm px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
                        Atau
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading || loading}
                      className="w-full py-2.5 px-4 bg-white/90 hover:bg-white border border-blue-200 hover:border-blue-300 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.35 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                        />
                      </svg>
                      <span>
                        {googleLoading
                          ? "Menghubungkan..."
                          : "Lanjut dengan Google"}
                      </span>
                    </button>
                  </div>
                )}

                {/* FIELD: OTP INPUT */}
                {mode === "otp" && (
                  <div className="space-y-4 py-2">
                    <div
                      className="flex gap-2 justify-center"
                      onPaste={handleOtpPaste}
                    >
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-11 h-12 text-center text-lg font-bold bg-white border border-blue-200 rounded-xl text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all shadow-sm"
                        />
                      ))}
                    </div>

                    {otpError && (
                      <p className="text-red-500 text-xs text-center font-medium">
                        {otpError}
                      </p>
                    )}

                    <div className="text-center text-xs font-medium">
                      {otpTimer > 0 ? (
                        <p className="text-slate-500">
                          Kode berlaku{" "}
                          <span className="font-bold text-blue-600 tabular-nums">
                            {formatTimer(otpTimer)}
                          </span>
                        </p>
                      ) : (
                        <p className="text-red-500 font-semibold">
                          Kode OTP kadaluarsa
                        </p>
                      )}
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={otpTimer > 540 || loading}
                        className="text-xs text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed font-semibold transition-colors"
                      >
                        {otpTimer > 540
                          ? `Kirim ulang dalam ${formatTimer(otpTimer - 540)}`
                          : "Kirim ulang kode OTP"}
                      </button>
                    </div>
                  </div>
                )}

                {/* FIELD: NEW PASSWORD */}
                {mode === "new-password" && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Password Baru"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-11 py-2.5 bg-white/80 border border-blue-200/80 rounded-xl outline-none text-slate-800 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="Konfirmasi Password Baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-11 py-2.5 bg-white/80 border border-blue-200/80 rounded-xl outline-none text-slate-800 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>

                    {passwordError && (
                      <p className="text-red-500 text-xs font-medium">
                        {passwordError}
                      </p>
                    )}
                  </div>
                )}

                {/* MODE: VERIFY EMAIL */}
                {mode === "verify-email" && (
                  <div className="space-y-4">
                    <div className="bg-white/80 border border-blue-200/80 rounded-2xl p-4 text-center shadow-sm">
                      <p className="text-slate-500 text-xs mb-1 font-medium">
                        Email verifikasi dikirim ke:
                      </p>
                      <p className="font-bold text-blue-600 text-sm">
                        {auth.currentUser?.email}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                      <p>1. Buka inbox Gmail Anda.</p>
                      <p>
                        2. Cari pesan dari{" "}
                        <strong>Firebase / SkripsiVibe</strong>.
                      </p>
                      <p>
                        3. Klik tombol / link <strong>"Verify email"</strong>.
                      </p>
                      <p>
                        4. Sistem akan mendeteksi otomatis setelah
                        terverifikasi.
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 py-1">
                      <span className="text-slate-500 text-xs font-medium mr-2">
                        Menunggu verifikasi
                      </span>
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-blue-500"
                          style={{
                            animation: `bounce 1.2s ease-in-out ${
                              i * 0.2
                            }s infinite`,
                          }}
                        />
                      ))}
                    </div>

                    {verifyError && (
                      <p
                        className={`text-xs text-center font-semibold ${
                          verifyError.startsWith("✅")
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {verifyError}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="w-full py-2.5 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl font-bold text-xs transition-all disabled:opacity-50 shadow-sm"
                    >
                      {resendLoading
                        ? "Mengirim..."
                        : "Kirim Ulang Email Verifikasi"}
                    </button>
                  </div>
                )}

                {/* MODE: VERIFIED SUCCESS */}
                {mode === "verified-success" && (
                  <div className="text-center py-4">
                    <div className="mx-auto w-12 h-12 bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-center mb-3 text-emerald-600">
                      <CheckCircle size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      Email Terverifikasi!
                    </h3>
                    <p className="text-slate-500 text-xs mb-5 font-medium">
                      Akun Anda siap digunakan. Silakan masuk sekarang.
                    </p>
                    <button
                      type="button"
                      onClick={goBackToLogin}
                      className="w-full text-white font-bold py-3 rounded-xl transition-all shadow-lg text-sm"
                      style={{
                        background: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
                        boxShadow: "0 4px 15px rgba(59,130,246,0.35)",
                      }}
                    >
                      Masuk Sekarang
                    </button>
                  </div>
                )}

                {/* MODE: RESET SUCCESS */}
                {mode === "reset-success" && (
                  <div className="text-center py-4">
                    <div className="mx-auto w-12 h-12 bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-center mb-3 text-emerald-600">
                      <CheckCircle size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      Password Berhasil Diubah!
                    </h3>
                    <p className="text-slate-500 text-xs mb-5 font-medium">
                      Silakan login menggunakan kata sandi baru Anda.
                    </p>
                  </div>
                )}

                {/* TOMBOL UTAMA */}
                {![
                  "reset-success",
                  "verify-email",
                  "verified-success",
                ].includes(mode) && (
                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full text-white font-bold py-3 rounded-xl transition-all shadow-lg text-sm mt-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
                      boxShadow: "0 4px 15px rgba(59,130,246,0.35)",
                    }}
                  >
                    {loading
                      ? "Memproses..."
                      : mode === "forgot"
                        ? "Kirim Kode OTP"
                        : mode === "otp"
                          ? "Verifikasi Kode"
                          : mode === "new-password"
                            ? "Simpan Password Baru"
                            : mode === "login"
                              ? "Masuk Ke Dashboard"
                              : "Daftar Akun Sekarang"}
                  </button>
                )}

                {/* LINK KEMBALI */}
                {[
                  "forgot",
                  "otp",
                  "new-password",
                  "reset-success",
                  "verify-email",
                ].includes(mode) && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={goBackToLogin}
                      className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      ← Kembali ke Halaman Login
                    </button>
                  </div>
                )}
              </form>

              {/* FOOTER SWITCH LOGIN / REGISTER */}
              {["login", "register"].includes(mode) && (
                <div className="text-center text-xs text-slate-500 font-medium pt-2 border-t border-blue-200/50">
                  {mode === "login" ? (
                    <>
                      Belum memiliki akun?{" "}
                      <button
                        onClick={() => {
                          setMode("register");
                          resetErrors();
                        }}
                        className="font-bold text-blue-600 hover:text-blue-700 ml-1"
                      >
                        Daftar Gratis
                      </button>
                    </>
                  ) : (
                    <>
                      Sudah mendaftar sebelumnya?{" "}
                      <button
                        onClick={() => {
                          setMode("login");
                          resetErrors();
                        }}
                        className="font-bold text-blue-600 hover:text-blue-700 ml-1"
                      >
                        Masuk
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER HALAMAN */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 font-medium">
        &copy; 2026 SkripsiVibe.AI Inc. All rights reserved.
      </footer>

      {/* Style Animasi Dots */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
