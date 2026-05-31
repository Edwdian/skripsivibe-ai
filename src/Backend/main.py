import os
import json
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
from google import genai
from dotenv import load_dotenv

# --- TAMBAHAN LIBRARY UNTUK MERINGKAS OFFLINE ---
import nltk
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer

# Download data bahasa untuk pemotong kalimat (hanya jalan sekali)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    nltk.download('punkt_tab')

# 1. LOAD API KEY
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY tidak ditemukan!")

client = genai.Client(api_key=GEMINI_API_KEY)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def ekstrak_teks_pdf(file) -> str:
    teks = ""
    try:
        reader = PyPDF2.PdfReader(file)
        # Ambil maksimal 15 halaman (Biasanya Bab 1 dan Bab 5 ada di rentang ini/awal-awal)
        jumlah_halaman = min(len(reader.pages), 15) 
        for i in range(jumlah_halaman):
            teks += reader.pages[i].extract_text() + "\n"
        return teks
    except Exception as e:
        print(f"Error membaca PDF: {e}")
        return ""

# =========================================================
# FUNGSI BARU: MERINGKAS TEKS SECARA OFFLINE (HEMAT KUOTA)
# =========================================================
def ringkas_teks_lokal(teks_mentah: str, jumlah_kalimat=25) -> str:
    print("Meringkas teks skripsi secara offline...")
    try:
        # Gunakan pemecah kata bahasa indonesia/umum
        parser = PlaintextParser.from_string(teks_mentah, Tokenizer("english")) 
        summarizer = LsaSummarizer()
        
        # Ambil 25 kalimat paling krusial
        ringkasan = summarizer(parser.document, jumlah_kalimat)
        
        # Gabungkan kembali jadi 1 paragraf panjang
        teks_ringkasan = " ".join([str(kalimat) for kalimat in ringkasan])
        print("Berhasil meringkas! Ukuran teks jadi sangat kecil.")
        return teks_ringkasan
    except Exception as e:
        print("Gagal meringkas offline, pakai cara potong biasa:", e)
        # Fallback kalau library gagal, potong paksa karakternya
        return teks_mentah[:3000] 

@app.get("/")
async def root():
    return {"message": "Server Backend Skripsivibe AI berjalan lancar! Siap menerima PDF. 🚀"}

@app.post("/api/generate-pertanyaan")
async def generate_pertanyaan(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File harus berupa PDF")

    # 1. BACA PDF (Semua teks berantakan masuk sini)
    teks_skripsi_mentah = ekstrak_teks_pdf(file.file)
    if not teks_skripsi_mentah.strip():
        raise HTTPException(status_code=400, detail="Tidak dapat membaca teks dari PDF ini.")

    # 2. PROSES RINGKASAN LOKAL (Teks disaring di laptop, BUKAN di server Google)
    teks_matang = ringkas_teks_lokal(teks_skripsi_mentah)

    # 3. SIAPKAN PROMPT (Kirim teks yang sudah kecil/ringkas saja)
    prompt = f"""
    Anda adalah seorang Dosen Penguji Skripsi yang SANGAT KRITIS, tegas, dan "Killer".
    Anda benci basa-basi dan selalu bertanya langsung ke titik kelemahan mahasiswa.
    
    Berikut adalah RINGKASAN skripsi mahasiswa:
    ---
    {teks_matang}
    ---
    
    Buatlah 3 pertanyaan sidang skripsi dengan ATURAN SUPER KETAT berikut:
    1. HARUS SANGAT SINGKAT, padat, tajam, dan menusuk. Maksimal 1-2 kalimat pendek saja per pertanyaan!
    2. DILARANG KERAS menggunakan kata pengantar/basa-basi (Contoh yang dilarang: "Anda menyebutkan...", "Berdasarkan draf...", "Di penelitian ini...").
    3. Langsung serang intinya! (Contoh yang BENAR: "Apa bukti empiris bahwa alat ukur kecerdasan emosional Anda valid?", "Kenapa pakai metode ini kalau metode klasik saja sudah cukup?").
    
    Topik Pertanyaan:
    - Pertanyaan 1: Serang validitas data atau alat ukur metodologinya.
    - Pertanyaan 2: Serang alasan pemilihan teori/metodenya.
    - Pertanyaan 3: Serang nilai guna / dampak asli dari penelitiannya.
    
    Format output HARUS murni berupa array JSON (TANPA MARKDOWN ```json, TANPA TEKS LAIN):
    [
        "pertanyaan 1 yang sangat singkat",
        "pertanyaan 2 yang sangat singkat",
        "pertanyaan 3 yang sangat singkat"
    ]
    """

    print("\nMeminta pertanyaan ke Gemini dengan teks hemat token...")
    
    # 4. SISTEM SAPU JAGAT (Otomatis cari model yang kuotanya masih ada)
    models_to_try = [
        "gemini-2.0-flash", 
        "gemini-2.5-flash", 
        "gemini-1.5-pro", 
        "gemini-1.5-flash", 
        "gemini-pro"
    ]
    
    jawaban_teks = None

    for nama_model in models_to_try:
        try:
            print(f"Mencoba model: {nama_model}...")
            response = client.models.generate_content(
                model=nama_model,
                contents=prompt,
            )
            jawaban_teks = response.text.strip()
            print(f"✅ Berhasil mendapatkan pertanyaan dari {nama_model}!")
            break 
        except Exception as e:
            print(f"[-] Gagal pakai {nama_model}: (Kemungkinan limit/tidak tersedia)")

    if not jawaban_teks:
        raise HTTPException(status_code=500, detail="Semua model AI Google gagal diakses. Cek kuota API Key.")

    # 5. PARSING JSON DARI AI
    try:
        if jawaban_teks.startswith("```json"):
            jawaban_teks = jawaban_teks[7:-3]
        elif jawaban_teks.startswith("```"):
            jawaban_teks = jawaban_teks[3:-3]

        daftar_pertanyaan = json.loads(jawaban_teks)

        return {
            "status": "success",
            "message": "Pertanyaan berhasil dibuat.",
            "questions": daftar_pertanyaan,
            "full_text": teks_skripsi_mentah 
        }

    except Exception as e:
        print("Error System Parsing JSON:", e)
        print("Teks mentah dari AI:", jawaban_teks)
        raise HTTPException(status_code=500, detail="Format balasan dari AI tidak sesuai.")


# =========================================================
# ENDPOINT BARU: EVALUASI JAWABAN QNA (FEEDBACK NATURAL)
# =========================================================
@app.post("/api/evaluasi-qna")
async def evaluasi_qna(
    pertanyaan_1: str = Form(""),
    jawaban_1: str = Form(""),
    pertanyaan_2: str = Form(""),
    jawaban_2: str = Form(""),
    pertanyaan_3: str = Form(""),
    jawaban_3: str = Form("")
):
    # Validasi awal: Jika tidak ada jawaban sama sekali, tolak
    if not jawaban_1 and not jawaban_2 and not jawaban_3:
        raise HTTPException(status_code=400, detail="Tidak ada jawaban yang dikirim.")

    prompt = f"""
    Anda adalah seorang Dosen Penguji Sidang Skripsi yang ahli, berwibawa, dan suportif.
    Tugas Anda adalah memvalidasi dan memberikan feedback atas 3 jawaban mahasiswa saat sesi tanya jawab (QnA).
    Berikan feedback selayaknya dosen yang sedang menasihati mahasiswanya secara langsung secara lisan (gunakan bahasa yang natural, mengalir, tidak kaku seperti robot, namun tetap akademis).
    
    Evaluasi data presentasi/tanya jawab berikut:
    [Pertanyaan 1]: {pertanyaan_1}
    [Jawaban Mahasiswa 1]: {jawaban_1}
    
    [Pertanyaan 2]: {pertanyaan_2}
    [Jawaban Mahasiswa 2]: {jawaban_2}
    
    [Pertanyaan 3]: {pertanyaan_3}
    [Jawaban Mahasiswa 3]: {jawaban_3}

    Kembalikan hasil HANYA dalam format JSON persis seperti struktur ini (tanpa markdown tambahan seperti ```json):
    {{
      "qna_summary": {{
        "skor_rata_rata": 85,
        "keunggulan": [
          "Poin keunggulan 1 dengan bahasa luwes (misal: 'Pemahaman teorimu di bagian X sudah sangat tajam.')", 
          "Poin keunggulan 2"
        ],
        "kelemahan": [
          "Poin kelemahan 1 yang konstruktif (misal: 'Sayangnya, kamu agak kehilangan fokus waktu menjelaskan Y.')", 
          "Poin kelemahan 2"
        ],
        "strategi": [
          "Saran perbaikan aplikatif (misal: 'Coba pelajari lagi referensi Z agar jawabanmu lebih solid.')", 
          "Saran perbaikan 2"
        ]
      }},
      "evaluasi_qna": [
        {{
          "soal": "Tulis ulang intisari pertanyaan 1 secara singkat",
          "status": "Benar / Kurang Tepat / Salah",
          "feedback": "Berikan 1-2 kalimat feedback selayaknya dosen berbicara langsung. Contoh: 'Jawaban kamu untuk pertanyaan ini sebenarnya sudah mengarah ke hal yang benar, tapi alangkah baiknya jika kamu tambahkan contoh kasusnya biar saya lebih yakin.'"
        }},
        {{
          "soal": "Tulis ulang intisari pertanyaan 2 secara singkat",
          "status": "Benar / Kurang Tepat / Salah",
          "feedback": "Berikan 1-2 kalimat feedback selayaknya dosen berbicara langsung."
        }},
        {{
          "soal": "Tulis ulang intisari pertanyaan 3 secara singkat",
          "status": "Benar / Kurang Tepat / Salah",
          "feedback": "Berikan 1-2 kalimat feedback selayaknya dosen berbicara langsung."
        }}
      ]
    }}
    Catatan Penting: 
    - Isi 'skor_rata_rata' dengan angka integer 0-100 (Berdasarkan ketepatan dan rasionalitas jawaban).
    - JANGAN PERNAH menyertakan teks apapun di luar JSON.
    """

    models_to_try = [
        "gemini-2.0-flash", 
        "gemini-2.5-flash", 
        "gemini-1.5-pro", 
        "gemini-1.5-flash"
    ]
    
    jawaban_teks = None

    print("\nMeminta evaluasi QnA ke Gemini...")

    for nama_model in models_to_try:
        try:
            print(f"Mencoba model untuk evaluasi: {nama_model}...")
            response = client.models.generate_content(
                model=nama_model,
                contents=prompt,
            )
            jawaban_teks = response.text.strip()
            print(f"✅ Berhasil mendapatkan evaluasi dari {nama_model}!")
            break 
        except Exception as e:
            print(f"[-] Gagal evaluasi pakai {nama_model}: {e}")

    if not jawaban_teks:
        raise HTTPException(status_code=500, detail="Gagal terhubung ke AI untuk evaluasi.")

    # Parsing JSON Evaluasi dari Gemini
    try:
        # Bersihkan spasi atau baris kosong di awal/akhir
        jawaban_teks = jawaban_teks.strip()
        
        # Ekstraksi paksa jika Gemini memberikan bungkus ```json atau ```
        if "```json" in jawaban_teks:
            jawaban_teks = jawaban_teks.split("```json")[1].split("```")[0].strip()
        elif "```" in jawaban_teks:
            jawaban_teks = jawaban_teks.split("```")[1].split("```")[0].strip()

        # Konversi string teks ke Object JSON Python
        hasil_evaluasi = json.loads(jawaban_teks)
        
        return {
            "status": "success",
            "message": "Evaluasi berhasil diselesaikan.",
            "data": hasil_evaluasi
        }

    except Exception as e:
        print("Error System Parsing JSON Evaluasi:", e)
        print("Teks mentah dari AI yang bikin crash:", jawaban_teks)
        raise HTTPException(status_code=500, detail=f"Format balasan evaluasi dari AI tidak sesuai: {str(e)}")