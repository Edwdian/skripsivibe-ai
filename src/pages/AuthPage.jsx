import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import emailjs from "@emailjs/browser";

import { Eye, EyeOff, CheckCircle, KeyRound, ShieldCheck } from "lucide-react";

import { auth, db } from "../firebase/config.js";

const EMAILJS_SERVICE_ID  = "service_8jwzrs7";
const EMAILJS_TEMPLATE_ID = "template_smhde1e";
const EMAILJS_PUBLIC_KEY  = "0O2DeYRJndy1t7a5N";

// Cloud Function URL
const RESET_PASSWORD_URL = "https://us-central1-skripsivibe-ai.cloudfunctions.net/resetUserPassword";

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
    where("otp", "==", inputOtp)
  );
  const snap = await getDocs(q);
  if (snap.empty) return { valid: false, reason: "Kode OTP salah" };
  const data = snap.docs[0].data();
  const expires = data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
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
    EMAILJS_PUBLIC_KEY
  );
}

export default function AuthPage() {
  const navigate = useNavigate();

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
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [otpError, setOtpError] = useState("");

  const isValidGmail = (e) => e?.toLowerCase().trim().endsWith("@gmail.com");

  useEffect(() => {
    if (mode === "otp") {
      setOtpTimer(600);
      timerRef.current = setInterval(() => {
        setOtpTimer((t) => {
          if (t <= 1) { clearInterval(timerRef.current); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [mode]);

  const formatTimer = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  useEffect(() => {
    if (email) setEmailError(isValidGmail(email) ? "" : "Hanya email @gmail.com yang diperbolehkan");
    else setEmailError("");
  }, [email]);

  useEffect(() => {
    if (password && ["login", "register", "new-password"].includes(mode)) {
      setPasswordError(password.length >= 6 ? "" : "Password minimal 6 karakter");
    } else {
      setPasswordError("");
    }
  }, [password, mode]);

  const resetErrors = () => {
    setNameError(""); setEmailError(""); setPasswordError(""); setOtpError("");
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
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
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
        const q = query(collection(db, "users"), where("email", "==", email.toLowerCase().trim()));
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
        if (otpValue.length < 6) { setOtpError("Masukkan 6 digit kode OTP"); return; }
        if (otpTimer === 0) { setOtpError("Kode OTP sudah kadaluarsa. Minta kode baru."); return; }
        const result = await verifyOTPFromFirestore(email.toLowerCase().trim(), otpValue);
        if (!result.valid) { setOtpError(result.reason); return; }
        setMode("new-password");
        return;
      }

      // ── NEW PASSWORD ──────────────────────
      if (mode === "new-password") {
        if (!password || password.length < 6) {
          setPasswordError("Password minimal 6 karakter"); return;
        }
        if (password !== confirmPassword) {
          setPasswordError("Password dan konfirmasi tidak cocok"); return;
        }

        // ✅ Update password langsung via Cloud Function (realtime)
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
          setPasswordError(result.error || "Gagal mengubah password"); return;
        }

        setMode("reset-success");
        return;
      }

      // ── LOGIN ─────────────────────────────
      if (mode === "login") {
        if (!email || !isValidGmail(email)) { setEmailError("Hanya email @gmail.com yang diperbolehkan"); return; }
        if (!password || password.length < 6) { setPasswordError("Password minimal 6 karakter"); return; }
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/dashboard-user");
        return;
      }

      // ── REGISTER ──────────────────────────
      if (mode === "register") {
        if (!name.trim()) { setNameError("Nama lengkap wajib diisi"); return; }
        if (!email || !isValidGmail(email)) { setEmailError("Hanya email @gmail.com yang diperbolehkan"); return; }
        if (!password || password.length < 6) { setPasswordError("Password minimal 6 karakter"); return; }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name.trim() });
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          createdAt: new Date(),
        });
        setMode("login");
        setName(""); setEmail(""); setPassword("");
        return;
      }

    } catch (error) {
      console.error(error);
      if (mode === "login") {
        if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
          setEmailError("Email atau password salah");
        } else if (error.code === "auth/wrong-password") {
          setPasswordError("Password salah");
        } else {
          setEmailError("Email atau password salah");
        }
      } else if (mode === "register") {
        if (error.code === "auth/email-already-in-use") setEmailError("Email sudah digunakan");
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
    setEmail(""); setPassword(""); setConfirmPassword("");
    setOtpDigits(["", "", "", "", "", ""]);
    resetErrors();
  };

  const titles = {
    login: "Welcome Back",
    register: "Create Account",
    forgot: "Lupa Password",
    otp: "Verifikasi Kode",
    "new-password": "Buat Password Baru",
    "reset-success": "Berhasil!",
  };

  const subtitles = {
    login: "Masuk ke akun Skripsivibe AI",
    register: "Daftar akun Skripsivibe AI",
    forgot: "Masukkan email untuk menerima kode OTP",
    otp: `Kode 6 digit telah dikirim ke ${email}`,
    "new-password": "Buat password baru yang kuat",
    "reset-success": "Password Anda telah berhasil diubah",
  };

  return (
    <div
      className="min-h-screen overflow-hidden flex items-center justify-center px-6 relative"
      style={{ background: "linear-gradient(160deg, #eef7ff 0%, #dceeff 25%, #cfe7ff 55%, #edf7ff 100%)" }}
    >
      <div className="relative z-10 w-full max-w-md rounded-[2rem] p-8 md:p-10 bg-white/70 backdrop-blur-xl border border-blue-100 shadow-xl">

        {mode === "otp" && (
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <ShieldCheck size={28} className="text-blue-500" />
            </div>
          </div>
        )}
        {mode === "new-password" && (
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <KeyRound size={28} className="text-blue-500" />
            </div>
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-2 tracking-tight">
          {titles[mode]}
        </h1>
        <p className="text-center text-slate-500 mb-8 text-sm md:text-base">
          {subtitles[mode]}
        </p>

        <form onSubmit={handleAuth} className="space-y-5">

          {mode === "register" && (
            <div>
              <input
                type="text" placeholder="Nama Lengkap" value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl px-5 py-3.5 outline-none text-slate-700"
                style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.35)" }}
              />
              {nameError && <p className="text-red-500 text-sm mt-1.5 ml-1">{nameError}</p>}
            </div>
          )}

          {["login", "register", "forgot"].includes(mode) && (
            <div>
              <input
                type="email" placeholder="Email @gmail.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl px-5 py-3.5 outline-none text-slate-700"
                style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.35)" }}
              />
              {emailError && <p className="text-red-500 text-sm mt-1.5 ml-1">{emailError}</p>}
            </div>
          )}

          {["login", "register"].includes(mode) && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl px-5 py-3.5 pr-14 outline-none text-slate-700"
                style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.35)" }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {passwordError && <p className="text-red-500 text-sm mt-1.5 ml-1">{passwordError}</p>}
            </div>
          )}

          {mode === "otp" && (
            <div className="space-y-4">
              <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i} ref={(el) => (otpRefs.current[i] = el)}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-2xl outline-none text-slate-700 transition-all"
                    style={{
                      background: "rgba(255,255,255,0.95)",
                      border: digit ? "2px solid #3b82f6" : "1px solid rgba(147,197,253,0.5)",
                      boxShadow: digit ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
                    }}
                  />
                ))}
              </div>
              {otpError && <p className="text-red-500 text-sm text-center">{otpError}</p>}
              <div className="text-center">
                {otpTimer > 0 ? (
                  <p className="text-slate-500 text-sm">
                    Kode berlaku{" "}
                    <span className="font-semibold text-blue-500 tabular-nums">{formatTimer(otpTimer)}</span>
                  </p>
                ) : (
                  <p className="text-red-500 text-sm font-medium">Kode OTP kadaluarsa</p>
                )}
              </div>
              <div className="text-center">
                <button type="button" onClick={handleResendOTP}
                  disabled={otpTimer > 540 || loading}
                  className="text-sm text-blue-500 hover:text-blue-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors">
                  {otpTimer > 540 ? `Kirim ulang dalam ${formatTimer(otpTimer - 540)}` : "Kirim ulang kode"}
                </button>
              </div>
            </div>
          )}

          {mode === "new-password" && (
            <>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} placeholder="Password baru" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl px-5 py-3.5 pr-14 outline-none text-slate-700"
                  style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.35)" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"} placeholder="Konfirmasi password baru"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl px-5 py-3.5 pr-14 outline-none text-slate-700"
                  style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(147,197,253,0.35)" }}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordError && <p className="text-red-500 text-sm mt-1.5 ml-1">{passwordError}</p>}
              {password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: password.length >= i * 3
                            ? i <= 1 ? "#ef4444" : i <= 2 ? "#f97316" : i <= 3 ? "#eab308" : "#22c55e"
                            : "rgba(0,0,0,0.08)",
                        }} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    {password.length < 6 ? "Terlalu pendek" : password.length < 9 ? "Lemah" : password.length < 12 ? "Sedang" : "Kuat"}
                  </p>
                </div>
              )}
            </>
          )}

          {mode === "reset-success" && (
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Password Berhasil Diubah!</h3>
              <p className="text-slate-500 text-sm">Silakan login dengan password baru Anda.</p>
            </div>
          )}

          {mode !== "reset-success" && (
            <button type="submit" disabled={loading}
              className="w-full text-white py-3.5 rounded-2xl font-bold text-base hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #2563eb, #0ea5e9)" }}>
              {loading ? "Memproses..." :
                mode === "forgot" ? "Kirim Kode OTP" :
                mode === "otp" ? "Verifikasi Kode" :
                mode === "new-password" ? "Simpan Password Baru" :
                mode === "login" ? "Masuk" : "Daftar"}
            </button>
          )}

          {mode === "login" && (
            <button type="button" onClick={() => { setMode("forgot"); resetErrors(); }}
              className="w-full text-sm text-blue-500 hover:text-blue-600 transition-colors">
              Lupa Password?
            </button>
          )}

          {["forgot", "otp", "new-password", "reset-success"].includes(mode) && (
            <button type="button" onClick={goBackToLogin}
              className="w-full text-sm text-blue-500 hover:text-blue-600 transition-colors">
              ← Kembali ke Login
            </button>
          )}

          {["forgot", "otp", "new-password"].includes(mode) && (
            <div className="flex items-center justify-center gap-2 pt-2">
              {["forgot", "otp", "new-password"].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="rounded-full transition-all duration-300" style={{
                    background: mode === step ? "#3b82f6"
                      : ["forgot", "otp", "new-password"].indexOf(mode) > i ? "#93c5fd" : "rgba(0,0,0,0.12)",
                    width: mode === step ? "24px" : "8px",
                    height: "8px",
                    borderRadius: "999px",
                  }} />
                  {i < 2 && (
                    <div className="h-px w-6" style={{
                      background: ["forgot", "otp", "new-password"].indexOf(mode) > i ? "#93c5fd" : "rgba(0,0,0,0.1)",
                    }} />
                  )}
                </div>
              ))}
            </div>
          )}

        </form>

        {["login", "register"].includes(mode) && (
          <div className="mt-7 text-center text-sm text-slate-500">
            {mode === "login" ? (
              <>Belum punya akun?{" "}
                <button onClick={() => { setMode("register"); resetErrors(); }}
                  className="font-semibold text-blue-500 hover:text-blue-600">Daftar</button>
              </>
            ) : (
              <>Sudah punya akun?{" "}
                <button onClick={() => { setMode("login"); resetErrors(); }}
                  className="font-semibold text-blue-500 hover:text-blue-600">Masuk</button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}