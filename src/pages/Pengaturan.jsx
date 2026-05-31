import React, { useState, useEffect } from "react";
// Import auth dan fungsi Firebase yang dibutuhkan
import { auth } from "../firebase/config.js";
import { onAuthStateChanged, updateProfile } from "firebase/auth";

const Pengaturan = () => {
  const [activeTab, setActiveTab] = useState("profil");

  // State Default
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

  // ==========================================
  // MENGAMBIL DATA USER LOGIN DARI FIREBASE
  // ==========================================
  useEffect(() => {
    // onAuthStateChanged akan mendeteksi user yang sedang login secara real-time
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const currentUserData = {
          nama: user.displayName || "Pengguna",
          email: user.email || "",
          // Karena Firebase Auth standar tidak menyimpan universitas, nomor HP,
          // dan jurusan, kita gunakan string kosong sampai ada database (seperti Firestore)
          universitas: "",
          nomorHp: "",
          jurusan: "",
          photoPreview: user.photoURL || null,
        };

        setUserProfile(currentUserData);
        setEditFormData(currentUserData);
      }
    });

    // Cleanup listener saat komponen ditutup
    return () => unsubscribe();
  }, []);

  // ==========================================
  // HANDLER MODAL & FORM
  // ==========================================
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const photoUrl = URL.createObjectURL(file);
      setEditFormData({ ...editFormData, photoPreview: photoUrl });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Validasi
    if (!editFormData.nama.trim() || !editFormData.nomorHp.trim()) {
      alert("Nama Lengkap dan Nomor HP tidak boleh kosong!");
      return;
    }

    try {
      // Jika nama berubah, update juga displayName di Firebase Auth
      if (
        auth.currentUser &&
        auth.currentUser.displayName !== editFormData.nama
      ) {
        await updateProfile(auth.currentUser, {
          displayName: editFormData.nama,
        });
      }

      // Simpan perubahan ke tampilan UI dan tutup modal
      setUserProfile(editFormData);
      setIsEditModalOpen(false);
    } catch (error) {
      alert("Gagal menyimpan profil: " + error.message);
    }
  };

  const openEditModal = () => {
    setEditFormData({ ...userProfile });
    setIsEditModalOpen(true);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Array data profil untuk di-render dengan .map()
  const profileDetails = [
    { label: "Nama Lengkap", value: userProfile.nama },
    { label: "Email", value: userProfile.email },
    { label: "Universitas", value: userProfile.universitas },
    { label: "Nomor HP", value: userProfile.nomorHp },
    { label: "Jurusan", value: userProfile.jurusan },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 w-full relative">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan</h2>

      {/* Navigasi Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
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
      {/* KONTEN TAB: PROFIL PENGGUNA (READ-ONLY) */}
      {/* ======================================= */}
      {activeTab === "profil" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Foto Profil */}
          <div className="flex items-center gap-5 mb-2">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-md overflow-hidden border-2 border-white outline outline-2 outline-blue-100">
              {userProfile.photoPreview ? (
                <img
                  src={userProfile.photoPreview}
                  alt="Profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(userProfile.nama)
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-1">
                Foto Profil
              </h3>
              <p className="text-xs text-gray-500">
                Menampilkan foto profil Anda saat ini.
              </p>
            </div>
          </div>

          {/* Render Isi Profil Dinamis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 border-t border-gray-100 pt-6">
            {profileDetails.map((detail, index) => (
              <div key={index}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  {detail.label}
                </p>
                <p className="text-base font-medium text-gray-800">
                  {detail.value || "-"}
                </p>
              </div>
            ))}
          </div>

          {/* Tombol Edit */}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-800">
                Edit Profil Pengguna
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
              {/* Form Ubah Foto di Modal */}
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-md overflow-hidden">
                  {editFormData.photoPreview ? (
                    <img
                      src={editFormData.photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(editFormData.nama)
                  )}
                </div>
                <div>
                  <label className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2 px-4 rounded-lg cursor-pointer transition-colors shadow-sm inline-block">
                    Ubah Foto
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    Disarankan ukuran 1:1, maksimal 2MB.
                  </p>
                </div>
              </div>

              {/* Form Input Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-gray-100 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.nama || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, nama: e.target.value })
                    }
                    placeholder="Masukkan nama lengkap"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                  />
                </div>

                {/* KOLOM EMAIL - DISABLED & PATEN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email || ""}
                    disabled
                    readOnly
                    className="w-full border border-gray-200 bg-gray-100 rounded-lg px-4 py-2 outline-none text-gray-500 cursor-not-allowed select-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Email tertaut dengan akun, tidak dapat diubah.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Universitas
                  </label>
                  <input
                    type="text"
                    value={editFormData.universitas || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        universitas: e.target.value,
                      })
                    }
                    placeholder="Masukkan nama universitas"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={editFormData.nomorHp || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        nomorHp: e.target.value,
                      })
                    }
                    placeholder="Contoh: 081234567890"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jurusan
                  </label>
                  <input
                    type="text"
                    value={editFormData.jurusan || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        jurusan: e.target.value,
                      })
                    }
                    placeholder="Contoh: Teknik Informatika"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* KONTEN TAB: KEAMANAN AKUN */}
      {/* ======================================= */}
      {activeTab === "keamanan" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="w-full md:w-1/2 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Ganti Password
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Lama
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Baru
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="pt-2">
              <button className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Simpan Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* KONTEN TAB: TENTANG APLIKASI */}
      {/* ======================================= */}
      {activeTab === "tentang" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 w-full">
            <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl">SA</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  SkripsiVibe AI
                </h3>
                <p className="text-sm text-gray-500">
                  Sistem Simulasi Sidang Skripsi Virtual untuk Evaluasi Kesiapan
                  Mental dan Kepercayaan Diri Berbasis AI
                </p>
              </div>
            </div>

            <ul className="space-y-4 text-sm">
              <li className="flex flex-col md:flex-row md:items-center justify-between">
                <span className="font-medium text-gray-500">
                  Versi Aplikasi
                </span>
                <span className="text-gray-800 font-semibold">
                  v1.0.0 (Beta)
                </span>
              </li>
              <li className="flex flex-col md:flex-row md:items-center justify-between">
                <span className="font-medium text-gray-500">
                  Tahun Pengembangan
                </span>
                <span className="text-gray-800 font-semibold">2026</span>
              </li>
              <li className="flex flex-col md:flex-row md:items-center justify-between">
                <span className="font-medium text-gray-500">Tim Developer</span>
                <span className="text-gray-800 font-semibold">
                  Tim Fullstack SkripsiVibe AI
                </span>
              </li>
              <li className="flex flex-col md:flex-row md:items-center justify-between">
                <span className="font-medium text-gray-500">
                  Kontak Support
                </span>
                <a
                  href="mailto:support@skripsivibeAI.com"
                  className="text-blue-500 hover:text-blue-600 font-semibold"
                >
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