# 🎓 SkripsiVibe AI

> **Platform Simulasi Sidang Skripsi Berbasis AI Pertama di Indonesia**

SkripsiVibe AI adalah aplikasi web yang membantu mahasiswa berlatih sidang skripsi secara realistis — lengkap dengan avatar dosen AI yang bisa berbicara, mengajukan pertanyaan kritis berdasarkan isi skripsi, dan memberikan evaluasi komprehensif setelah sesi selesai.

---

## 📸 Tampilan Aplikasi

| Halaman | Deskripsi |
|---|---|
| Landing Page | Pengenalan fitur, testimoni, dan FAQ |
| Auth Page | Login / Register dengan verifikasi email |
| Dashboard User | Manajemen akun dan kuota simulasi |
| Dashboard Ujian | Sesi simulasi sidang live (kamera + mikrofon) |
| Dashboard Hasil | Hasil evaluasi AI + estimasi nilai |

---

## ✨ Fitur Utama

- **📄 Upload Skripsi (PDF)** — Unggah file skripsi kamu; AI akan membaca dan memahami isinya secara otomatis.
- **🤖 Dosen AI Interaktif** — Avatar dosen AI dengan video dan suara nyata yang mengajukan pertanyaan tajam dan kritis.
- **🎙️ Speech-to-Text Real-time** — Jawab pertanyaan dosen dengan berbicara langsung; ucapanmu ditranskripsi menggunakan Groq Whisper.
- **📊 Evaluasi Komprehensif** — Setelah sesi, AI memberikan skor, feedback per jawaban, keunggulan, kelemahan, dan saran perbaikan.
- **🔐 Autentikasi Aman** — Login dengan email & Google, dilengkapi verifikasi email via Firebase Auth.
- **📜 Riwayat Simulasi** — Pantau histori simulasi yang pernah kamu lakukan.
- **⚙️ Pengaturan Akun** — Kelola profil dan preferensi pengguna.

---

## 🏗️ Arsitektur Aplikasi

```
skripsivibe-ai/
├── src/                        # Frontend (React + Vite)
│   ├── pages/
│   │   ├── LandingPage.jsx     # Halaman utama / beranda
│   │   ├── AuthPage.jsx        # Login & Register
│   │   ├── DashboardUser.jsx   # Dashboard pengguna
│   │   ├── DashboardUjian.jsx  # Sesi simulasi sidang
│   │   ├── DashboardHasil.jsx  # Hasil evaluasi AI
│   │   ├── Riwayat.jsx         # Riwayat simulasi
│   │   └── Pengaturan.jsx      # Pengaturan akun
│   ├── firebase/
│   │   └── config.js           # Konfigurasi Firebase
│   ├── utils/
│   │   └── apiService.js       # Fungsi API (Gemini, Groq, HuggingFace)
│   └── services/
│       └── apiSimulations.js   # Layanan data simulasi
│
├── server-express/             # Backend (Node.js + Express)
│   ├── server.js               # Entry point server
│   ├── routes/
│   │   ├── gemini.route.js     # API generate pertanyaan & evaluasi QnA
│   │   └── simulations.js      # API data simulasi
│   └── firebaseAdmin.js        # Firebase Admin SDK
│
└── functions/                  # Firebase Cloud Functions
    └── index.js                # Reset password via Admin SDK
```

---

## 🔄 Alur Simulasi Sidang

```
Upload PDF Skripsi
       ↓
AI Generate 3 Pertanyaan (Gemini 2.5 Flash)
       ↓
Sesi Presentasi (10 menit — kamera & mikrofon aktif)
       ↓
Sesi Tanya Jawab (3 pertanyaan dari dosen AI)
       ↓
Audio Ditranskripsi (Groq Whisper Large V3)
       ↓
Evaluasi Jawaban (Gemini 2.5 Flash)
       ↓
Dashboard Hasil (Skor + Feedback + Estimasi Nilai)
```

---

## 🛠️ Tech Stack

### Frontend
| Teknologi | Kegunaan |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool & dev server |
| React Router DOM 7 | Client-side routing |
| Tailwind CSS 3 | Styling |
| Lucide React | Icon library |
| Firebase SDK 12 | Auth & Firestore |

### Backend (Express Server)
| Teknologi | Kegunaan |
|---|---|
| Node.js + Express 5 | REST API server |
| Multer | File upload (PDF) |
| pdf-parse | Ekstraksi teks dari PDF |
| Google Generative AI (Gemini) | Generate pertanyaan & evaluasi |
| Firebase Admin SDK | Manajemen user server-side |
| dotenv | Manajemen environment variable |

### Layanan Eksternal
| Layanan | Kegunaan |
|---|---|
| **Google Gemini 2.5 Flash** | Generate pertanyaan sidang + evaluasi jawaban |
| **Groq Whisper Large V3** | Transkripsi suara mahasiswa ke teks |
| **Hugging Face Space** | Model prediksi nilai / scoring |
| **Firebase Auth** | Autentikasi pengguna |
| **Firebase Firestore** | Database riwayat simulasi |
| **Firebase Cloud Functions** | Reset password via Admin SDK |
| **Cloudinary** | Hosting video avatar dosen AI |
| **EmailJS** | Pengiriman email notifikasi |

---

## ⚙️ Cara Menjalankan Lokal

### Prasyarat

- Node.js v18+
- npm atau yarn
- Akun Firebase (dengan Firestore & Authentication aktif)
- API Key: Google Gemini, Groq, EmailJS

---

### 1. Clone Repository

```bash
git clone https://github.com/username/skripsivibe-ai.git
cd skripsivibe-ai
```

---

### 2. Setup Frontend

```bash
npm install
```

Buat file `.env` di root folder:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_GROQ_API_KEY=your_groq_api_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

Jalankan frontend:

```bash
npm run dev
```

Frontend berjalan di: `http://localhost:5173`

---

### 3. Setup Backend (Express Server)

```bash
cd server-express
npm install
```

Buat file `.env` di dalam folder `server-express/`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

> Untuk Firebase Admin SDK, letakkan file `serviceAccountKey.json` (unduh dari Firebase Console → Project Settings → Service Accounts) di dalam folder `server-express/`.

Jalankan server:

```bash
npm start
# atau dengan hot-reload:
npx nodemon server.js
```

Backend berjalan di: `http://localhost:5000`

---

### 4. Setup Firebase Cloud Functions (Opsional)

```bash
cd functions
npm install
firebase deploy --only functions
```

---

## 📡 Dokumentasi API

### Base URL
```
http://localhost:5000/api
```

### `POST /gemini/generate-pertanyaan`

Generate 3 pertanyaan sidang berdasarkan isi PDF skripsi.

**Request:** `multipart/form-data`
| Field | Tipe | Keterangan |
|---|---|---|
| `file` | File (PDF) | File skripsi mahasiswa |

**Response:**
```json
{
  "status": "success",
  "message": "Pertanyaan berhasil dibuat.",
  "questions": [
    "Mengapa kamu memilih metode kuantitatif, bukan kualitatif?",
    "Bagaimana kamu memastikan validitas instrumen penelitianmu?",
    "Apa dampak nyata penelitian ini terhadap masyarakat?"
  ]
}
```

---

### `POST /gemini/evaluasi-qna`

Evaluasi jawaban mahasiswa dari sesi tanya jawab.

**Request:** `multipart/form-data`
| Field | Tipe | Keterangan |
|---|---|---|
| `pertanyaan_1` | string | Pertanyaan pertama dosen AI |
| `jawaban_1` | string | Jawaban mahasiswa (transkripsi) |
| `pertanyaan_2` | string | Pertanyaan kedua |
| `jawaban_2` | string | Jawaban kedua |
| `pertanyaan_3` | string | Pertanyaan ketiga |
| `jawaban_3` | string | Jawaban ketiga |

**Response:**
```json
{
  "status": "success",
  "data": {
    "qna_summary": {
      "skor_rata_rata": 82,
      "keunggulan": ["Jawaban sistematis", "Pemahaman metodologi baik"],
      "kelemahan": ["Kurang elaborasi pada implikasi praktis"],
      "strategi": ["Perkuat argumentasi dengan data empiris"]
    },
    "evaluasi_qna": [
      {
        "soal": "Validitas instrumen penelitian",
        "status": "Benar",
        "feedback": "Jawabanmu sudah tepat sasaran, namun akan lebih kuat jika disertai referensi pengujian validitas yang kamu gunakan."
      }
    ]
  }
}
```

---

## 🚀 Deployment

### Frontend — Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Backend — Opsional (Railway / Render / VPS)

```bash
# Pastikan environment variable sudah diset di platform deployment
npm start
```

> **Catatan:** URL backend di `src/utils/apiService.js` perlu diubah dari `http://localhost:5000` ke URL server production kamu.

---

## 🔐 Keamanan & Privasi

- File PDF yang diunggah hanya diproses **di memori server** dan **tidak pernah disimpan** ke disk atau database.
- Autentikasi menggunakan Firebase Auth dengan verifikasi email wajib.
- Route dashboard dilindungi oleh `ProtectedRoute` — hanya bisa diakses oleh user yang sudah login dan terverifikasi.
- API Key sensitif disimpan di `.env` dan tidak pernah diekspos ke client.

---

## 🤝 Kontribusi

Pull request sangat disambut! Untuk perubahan besar, harap buka issue terlebih dahulu untuk mendiskusikan apa yang ingin kamu ubah.

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b fitur/nama-fitur`)
3. Commit perubahanmu (`git commit -m 'Tambah fitur X'`)
4. Push ke branch (`git push origin fitur/nama-fitur`)
5. Buat Pull Request

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan skripsi dan pengembangan pribadi. Hak cipta © 2026 SkripsiVibe AI.

---

<div align="center">
  <p>Dibuat dengan ❤️ untuk mahasiswa Indonesia yang sedang berjuang menyelesaikan skripsinya.</p>
  <p><strong>Semangat! Kamu pasti bisa lulus! 🎓</strong></p>
</div>
