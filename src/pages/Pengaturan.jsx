import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/config.js";
import { onAuthStateChanged, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Pengaturan = () => {
  const [activeTab, setActiveTab] = useState("profil");

  const [userProfile, setUserProfile] = useState({
    nama: "",
    email: "",
    universitas: "",
    nomorHp: "",
    jurusan: "",
    photoPreview: null,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // ==========================================
  // AMBIL DATA USER DARI FIREBASE AUTH + FIRESTORE
  // ==========================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Ambil data tambahan dari Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const firestoreData = docSnap.exists() ? docSnap.data() : {};

        const currentUserData = {
          nama: user.displayName || firestoreData.name || "Pengguna",
          email: user.email || "",
          universitas: firestoreData.universitas || "",
          nomorHp: firestoreData.nomorHp || "",
          jurusan: firestoreData.jurusan || "",
          photoPreview: user.photoURL || null,
        };

        setUserProfile(currentUserData);
        setEditFormData(currentUserData);
        setLoadingProfile(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ==========================================
  // HANDLER FOTO
  // ==========================================
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const photoUrl = URL.createObjectURL(file);
      setEditFormData({ ...editFormData, photoPreview: photoUrl });
    }
  };

  // ==========================================
  // SIMPAN PROFIL KE FIREBASE AUTH + FIRESTORE
  // ==========================================
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!editFormData.nama.trim()) {
      alert("Nama Lengkap tidak boleh kosong!");
      return;
    }

    setSavingProfile(true);
    try {
      const user = auth.currentUser;

      // Update displayName di Firebase Auth
      if (user.displayName !== editFormData.nama) {
        await updateProfile(user, { displayName: editFormData.nama });
      }

      // Simpan data tambahan ke Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: editFormData.nama,
        email: user.email,
        universitas: editFormData.universitas || "",
        nomorHp: editFormData.nomorHp || "",
        jurusan: editFormData.jurusan || "",
        updatedAt: new Date(),
      }, { merge: true }); // merge: true agar tidak menimpa field lain

      setUserProfile(editFormData);
      setIsEditModalOpen(false);
      alert("Profil berhasil disimpan!");
    } catch (error) {
      alert("Gagal menyimpan profil: " + error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // ==========================================
  // GANTI PASSWORD VIA RE-AUTHENTICATION
  // ==========================================
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordLama || !passwordBaru || !konfirmasiPassword) {
      setPasswordError("Semua field wajib diisi."); return;
    }
    if (passwordBaru.length < 6) {
      setPasswordError("Password baru minimal 6 karakter."); return;
    }
    if (passwordBaru !== konfirmasiPassword) {
      setPasswordError("Konfirmasi password tidak cocok."); return;
    }

    setSavingPassword(true);
    try {
      const user = auth.currentUser;

      // Re-authenticate dulu dengan password lama
      const credential = EmailAuthProvider.credential(user.email, passwordLama);
      await reauthenticateWithCredential(user, credential);

      // Setelah berhasil re-auth, baru update password
      await updatePassword(user, passwordBaru);

      setPasswordSuccess("Password berhasil diubah!");
      setPasswordLama("");
      setPasswordBaru("");
      setKonfirmasiPassword("");
    } catch (error) {
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setPasswordError("Password lama salah.");
      } else {
        setPasswordError("Gagal mengubah password: " + error.message);
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const openEditModal = () => {
    setEditFormData({ ...userProfile });
    setIsEditModalOpen(true);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const profileDetails = [
    { label: "Nama Lengkap", value: userProfile.nama },
    { label: "Email", value: userProfile.email },
    { label: "Universitas", value: userProfile.universitas },
    { label: "Nomor HP", value: userProfile.nomorHp },
    { label: "Jurusan", value: userProfile.jurusan },
  ];

  if (loadingProfile) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 w-full flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 w-full relative">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan</h2>

      {/* Navigasi Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { id: "profil", label: "Profil Pengguna" },
          { id: "keamanan", label: "Keamanan Akun" },
          { id: "tentang", label: "Tentang Aplikasi" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ======================================= */}
      {/* TAB: PROFIL PENGGUNA */}
      {/* ======================================= */}
      {activeTab === "profil" && (
        <div className="space-y-6">
          <div className="flex items-center gap-5 mb-2">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-md overflow-hidden border-2 border-white outline outline-2 outline-blue-100">
              {userProfile.photoPreview ? (
                <img src={userProfile.photoPreview} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                getInitials(userProfile.nama)
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-1">Foto Profil</h3>
              <p className="text-xs text-gray-500">Menampilkan foto profil Anda saat ini.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 border-t border-gray-100 pt-6">
            {profileDetails.map((detail, index) => (
              <div key={index}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{detail.label}</p>
                <p className="text-base font-medium text-gray-800">{detail.value || "-"}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={openEditModal}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md"
            >
              Edit Profil
            </button>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL EDIT PROFIL */}
      {/* ======================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-800">Edit Profil Pengguna</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-md overflow-hidden">
                  {editFormData.photoPreview ? (
                    <img src={editFormData.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(editFormData.nama)
                  )}
                </div>
                <div>
                  <label className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2 px-4 rounded-lg cursor-pointer transition-colors shadow-sm inline-block">
                    Ubah Foto
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">Disarankan ukuran 1:1, maksimal 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-gray-100 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                  <input
                    type="text" required value={editFormData.nama || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email" value={editFormData.email || ""} disabled readOnly
                    className="w-full border border-gray-200 bg-gray-100 rounded-lg px-4 py-2 outline-none text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Email tidak dapat diubah.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Universitas</label>
                  <input
                    type="text" value={editFormData.universitas || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, universitas: e.target.value })}
                    placeholder="Masukkan nama universitas"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label>
                  <input
                    type="tel" value={editFormData.nomorHp || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, nomorHp: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan</label>
                  <input
                    type="text" value={editFormData.jurusan || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, jurusan: e.target.value })}
                    placeholder="Contoh: Teknik Informatika"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={savingProfile}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md disabled:opacity-70">
                  {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* TAB: KEAMANAN AKUN */}
      {/* ======================================= */}
      {activeTab === "keamanan" && (
        <div className="space-y-6">
          <div className="w-full md:w-1/2 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ganti Password</h3>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
                <input
                  type="password" value={passwordLama}
                  onChange={(e) => setPasswordLama(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <input
                  type="password" value={passwordBaru}
                  onChange={(e) => setPasswordBaru(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                <input
                  type="password" value={konfirmasiPassword}
                  onChange={(e) => setKonfirmasiPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
              {passwordSuccess && <p className="text-green-500 text-sm">{passwordSuccess}</p>}

              <div className="pt-2">
                <button type="submit" disabled={savingPassword}
                  className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-70">
                  {savingPassword ? "Menyimpan..." : "Simpan Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* TAB: TENTANG APLIKASI */}
      {/* ======================================= */}
      {activeTab === "tentang" && (
        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 w-full">
            <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl">SA</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">SkripsiVibe AI</h3>
                <p className="text-sm text-gray-500">Sistem Simulasi Sidang Skripsi Virtual untuk Evaluasi Kesiapan Mental dan Kepercayaan Diri Berbasis AI</p>
              </div>
            </div>
            <ul className="space-y-4 text-sm">
              <li className="flex flex-col md:flex-row md:items-center justify-between">
                <span className="font-medium text-gray-500">Versi Aplikasi</span>
                <span className="text-gray-800 font-semibold">v1.0.0 (Beta)</span>
              </li>
              <li className="flex flex-col md:flex-row md:items-center justify-between">
                <span className="font-medium text-gray-500">Tahun Pengembangan</span>
                <span className="text-gray-800 font-semibold">2026</span>
              </li>
              <li className="flex flex-col md:flex-row md:items-center justify-between">
                <span className="font-medium text-gray-500">Tim Developer</span>
                <span className="text-gray-800 font-semibold">Tim Fullstack SkripsiVibe AI</span>
              </li>
              <li className="flex flex-col md:flex-row md:items-center justify-between">
                <span className="font-medium text-gray-500">Kontak Support</span>
                <a href="mailto:support@skripsivibeAI.com" className="text-blue-500 hover:text-blue-600 font-semibold">
                  support@skripsivibeAI.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pengaturan;