import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase/config.js";
import { onAuthStateChanged, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Eye, EyeOff, Camera, Loader2, User, Shield, Info, Check, X } from "lucide-react";

const Pengaturan = () => {
  const [activeTab, setActiveTab] = useState("profil");
  const fileInputRef = useRef(null);

  const [userProfile, setUserProfile] = useState({
    nama: "", email: "", universitas: "", nomorHp: "", jurusan: "", status: "Mahasiswa", photoURL: null,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [showPasswordLama, setShowPasswordLama] = useState(false);
  const [showPasswordBaru, setShowPasswordBaru] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const statusOptions = ["Mahasiswa", "Dosen", "Peneliti", "Lainnya"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let firestoreData = {};
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists()) firestoreData = docSnap.data();
        } catch (e) {}
        const currentUserData = {
          nama: user.displayName || "Pengguna",
          email: user.email || "",
          universitas: firestoreData.universitas || "",
          nomorHp: firestoreData.nomorHp || "",
          jurusan: firestoreData.jurusan || "",
          status: firestoreData.status || "Mahasiswa",
          photoURL: user.photoURL || null,
        };
        setUserProfile(currentUserData);
        setEditFormData(currentUserData);
      }
    });
    return () => unsubscribe();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { alert("Format foto tidak didukung! Gunakan JPG, PNG, atau WebP."); return; }
    if (file.size > 2 * 1024 * 1024) { alert("Ukuran foto maksimal 2MB!"); return; }
    if (file.size < 10 * 1024) { alert("Ukuran foto terlalu kecil! Minimal 10KB."); return; }
    setPhotoLoading(true);
    try {
      const storage = getStorage();
      const user = auth.currentUser;
      const storageRef = ref(storage, `profile_photos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: downloadURL });
      await setDoc(doc(db, "users", user.uid), { photoURL: downloadURL }, { merge: true });
      setUserProfile((prev) => ({ ...prev, photoURL: downloadURL }));
      setEditFormData((prev) => ({ ...prev, photoURL: downloadURL }));
    } catch (error) {
      alert("Gagal upload foto: " + error.message);
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editFormData.nama.trim()) { alert("Nama Lengkap tidak boleh kosong!"); return; }
    setSaveLoading(true);
    try {
      const user = auth.currentUser;
      if (user && user.displayName !== editFormData.nama) await updateProfile(user, { displayName: editFormData.nama });
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid, name: editFormData.nama, email: user.email,
        universitas: editFormData.universitas || "", nomorHp: editFormData.nomorHp || "",
        jurusan: editFormData.jurusan || "", status: editFormData.status || "Mahasiswa",
      }, { merge: true });
      setUserProfile((prev) => ({ ...prev, ...editFormData }));
      setIsEditModalOpen(false);
    } catch (error) {
      alert("Gagal menyimpan profil: " + error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError(""); setPasswordSuccess("");
    if (!passwordLama || !passwordBaru || !konfirmasiPassword) { setPasswordError("Semua field wajib diisi!"); return; }
    if (passwordBaru.length < 6) { setPasswordError("Password baru minimal 6 karakter!"); return; }
    if (passwordBaru !== konfirmasiPassword) { setPasswordError("Password baru dan konfirmasi tidak cocok!"); return; }
    setPasswordLoading(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, passwordLama);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordBaru);
      setPasswordSuccess("Password berhasil diubah!");
      setPasswordLama(""); setPasswordBaru(""); setKonfirmasiPassword("");
    } catch (error) {
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") setPasswordError("Password lama salah!");
      else if (error.code === "auth/too-many-requests") setPasswordError("Terlalu banyak percobaan. Coba lagi nanti.");
      else setPasswordError("Gagal mengubah password: " + error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const openEditModal = () => { setEditFormData({ ...userProfile }); setIsEditModalOpen(true); };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const tabs = [
    { id: "profil", label: "Profil", icon: <User size={15} /> },
    { id: "keamanan", label: "Keamanan", icon: <Shield size={15} /> },
    { id: "tentang", label: "Tentang", icon: <Info size={15} /> },
  ];

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-gray-800 text-sm transition-all bg-white";

  return (
    <div className="w-full space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Pengaturan</h2>
        <p className="text-slate-400 text-sm mt-1">Kelola profil dan keamanan akun kamu</p>
      </div>

      {/* TAB NAV */}
      <div className="flex gap-2 p-1 rounded-2xl w-fit" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(147,197,253,0.3)", backdropFilter: "blur(12px)" }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? "text-white shadow-md"
                : "text-slate-500 hover:text-slate-700"
            }`}
            style={activeTab === tab.id ? { background: "linear-gradient(135deg, #3b82f6, #0ea5e9)" } : {}}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ======================================= */}
      {/* TAB: PROFIL */}
      {/* ======================================= */}
      {activeTab === "profil" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* CARD KIRI - Avatar */}
          <div className="rounded-3xl p-6 flex flex-col items-center text-center gap-4"
            style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(147,197,253,0.35)", backdropFilter: "blur(16px)", boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>

            <div className="relative mt-2">
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-lg"
                style={{ background: "linear-gradient(135deg, #3b82f6, #0ea5e9)" }}>
                {userProfile.photoURL
                  ? <img src={userProfile.photoURL} alt="Profil" className="w-full h-full object-cover" />
                  : getInitials(userProfile.nama)
                }
              </div>
              <button onClick={() => fileInputRef.current?.click()} disabled={photoLoading}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md transition-all hover:scale-110"
                style={{ background: "linear-gradient(135deg, #3b82f6, #0ea5e9)" }}>
                {photoLoading ? <Loader2 size={13} className="text-white animate-spin" /> : <Camera size={13} className="text-white" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800">{userProfile.nama || "Pengguna"}</h3>
              <p className="text-sm text-slate-400 mt-0.5">{userProfile.email}</p>
              <span className="inline-block mt-3 px-4 py-1 text-xs font-bold rounded-full"
                style={{ background: "rgba(219,234,254,0.8)", color: "#2563eb", border: "1px solid rgba(147,197,253,0.5)" }}>
                {userProfile.status || "Mahasiswa"}
              </span>
            </div>


            <p className="text-[10px] text-slate-300 mt-1">JPG, PNG, WebP • Maks 2MB • Min 10KB</p>

            <button onClick={openEditModal}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #3b82f6, #0ea5e9)", boxShadow: "0 4px 15px rgba(59,130,246,0.3)" }}>
              Edit Profil
            </button>
          </div>

          {/* CARD KANAN - Detail */}
          <div className="lg:col-span-2 rounded-3xl p-6 space-y-5"
            style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(147,197,253,0.35)", backdropFilter: "blur(16px)", boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>

            <h3 className="text-base font-bold text-slate-700">Informasi Akun</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Nama Lengkap", value: userProfile.nama },
                { label: "Email", value: userProfile.email },
                { label: "Status", value: userProfile.status },
                { label: "Nomor HP", value: userProfile.nomorHp },
                { label: "Universitas", value: userProfile.universitas },
                { label: "Jurusan", value: userProfile.jurusan },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl p-4" style={{ background: "rgba(239,246,255,0.6)", border: "1px solid rgba(219,234,254,0.7)" }}>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-700">{item.value || <span className="text-slate-300 font-normal italic">Belum diisi</span>}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL EDIT PROFIL */}
      {/* ======================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ border: "1px solid rgba(147,197,253,0.4)" }}>
            <div className="px-6 py-4 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-3xl" style={{ borderBottom: "1px solid rgba(219,234,254,0.8)" }}>
              <h3 className="text-lg font-bold text-slate-800">Edit Profil</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap <span className="text-red-400">*</span></label>
                  <input type="text" required value={editFormData.nama || ""} onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })} placeholder="Masukkan nama lengkap" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                  <input type="email" value={editFormData.email || ""} disabled readOnly className={`${inputClass} bg-slate-50 text-slate-400 cursor-not-allowed`} />
                  <p className="text-[10px] text-slate-300 mt-1 ml-1">Email tidak dapat diubah.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select value={editFormData.status || "Mahasiswa"} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })} className={inputClass}>
                    {statusOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Universitas</label>
                  <input type="text" value={editFormData.universitas || ""} onChange={(e) => setEditFormData({ ...editFormData, universitas: e.target.value })} placeholder="Nama universitas" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor HP</label>
                  <input type="tel" value={editFormData.nomorHp || ""} onChange={(e) => setEditFormData({ ...editFormData, nomorHp: e.target.value })} placeholder="081234567890" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jurusan</label>
                  <input type="text" value={editFormData.jurusan || ""} onChange={(e) => setEditFormData({ ...editFormData, jurusan: e.target.value })} placeholder="Teknik Informatika" className={inputClass} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4" style={{ borderTop: "1px solid rgba(219,234,254,0.8)" }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">Batal</button>
                <button type="submit" disabled={saveLoading} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-70 transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #0ea5e9)", boxShadow: "0 4px 12px rgba(59,130,246,0.3)" }}>
                  {saveLoading ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Menyimpan...</span> : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* TAB: KEAMANAN */}
      {/* ======================================= */}
      {activeTab === "keamanan" && (
        <div className="max-w-lg">
          <div className="rounded-3xl p-6 space-y-5"
            style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(147,197,253,0.35)", backdropFilter: "blur(16px)", boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>

            <div>
              <h3 className="text-base font-bold text-slate-700">Ganti Password</h3>
              <p className="text-xs text-slate-400 mt-1">Pastikan password baru minimal 6 karakter</p>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              {[
                { label: "Password Lama", value: passwordLama, setter: setPasswordLama, show: showPasswordLama, toggleShow: () => setShowPasswordLama(!showPasswordLama) },
                { label: "Password Baru", value: passwordBaru, setter: setPasswordBaru, show: showPasswordBaru, toggleShow: () => setShowPasswordBaru(!showPasswordBaru) },
                { label: "Konfirmasi Password Baru", value: konfirmasiPassword, setter: setKonfirmasiPassword, show: showKonfirmasi, toggleShow: () => setShowKonfirmasi(!showKonfirmasi) },
              ].map((field, i) => (
                <div key={i}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{field.label}</label>
                  <div className="relative">
                    <input type={field.show ? "text" : "password"} value={field.value} onChange={(e) => field.setter(e.target.value)} placeholder="••••••••" className={`${inputClass} pr-12`} />
                    <button type="button" onClick={field.toggleShow} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                      {field.show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}

              {passwordError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-600 bg-red-50" style={{ border: "1px solid rgba(252,165,165,0.5)" }}>
                  <X size={14} className="shrink-0" />{passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-emerald-600 bg-emerald-50" style={{ border: "1px solid rgba(110,231,183,0.5)" }}>
                  <Check size={14} className="shrink-0" />{passwordSuccess}
                </div>
              )}

              <button type="submit" disabled={passwordLoading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white mt-2 disabled:opacity-70 transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #3b82f6, #0ea5e9)", boxShadow: "0 4px 15px rgba(59,130,246,0.3)" }}>
                {passwordLoading ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" />Menyimpan...</span> : "Simpan Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* TAB: TENTANG */}
      {/* ======================================= */}
      {activeTab === "tentang" && (
        <div className="max-w-lg">
          <div className="rounded-3xl p-6 space-y-5"
            style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(147,197,253,0.35)", backdropFilter: "blur(16px)", boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>

            <div className="flex items-center gap-4 pb-5" style={{ borderBottom: "1px solid rgba(219,234,254,0.8)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md shrink-0"
                style={{ background: "linear-gradient(135deg, #3b82f6, #0ea5e9)" }}>
                <span className="text-white font-black text-lg">SA</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">SkripsiVibe AI</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">Sistem Simulasi Sidang Skripsi Virtual Berbasis AI</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: "Versi Aplikasi", value: "v1.0.0 (Beta)" },
                { label: "Tahun Pengembangan", value: "2026" },
                { label: "Tim Developer", value: "Tim Fullstack SkripsiVibe AI" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 px-4 rounded-2xl"
                  style={{ background: "rgba(239,246,255,0.6)", border: "1px solid rgba(219,234,254,0.7)" }}>
                  <span className="text-xs font-semibold text-slate-400">{item.label}</span>
                  <span className="text-sm font-bold text-slate-700">{item.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-3 px-4 rounded-2xl"
                style={{ background: "rgba(239,246,255,0.6)", border: "1px solid rgba(219,234,254,0.7)" }}>
                <span className="text-xs font-semibold text-slate-400">Kontak Support</span>
                <a href="mailto:support@skripsivibeAI.com" className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors">
                  support@skripsivibeAI.com
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pengaturan;