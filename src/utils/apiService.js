// File: src/utils/apiService.js

// 1. FUNGSI MINTA PERTANYAAN KE LOKAL (GEMINI)
export const fetchQuestionsFromPDF = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://127.0.0.1:8000/api/generate-pertanyaan", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Gagal mengambil data dari server lokal.");
    return await response.json(); 

  } catch (error) {
    console.error("Error API Gemini:", error);
    throw error;
  }
};

// 2. FUNGSI KIRIM PDF & TRANSKRIP KE HUGGING FACE AI KAMU
export const sendToRenderModel = async (pdfFile, dataLengkap) => {
  try {
    const HF_API_URL = "https://frameszans-skripsivibe-ai.hf.space/api/prediksi"; 
    
    const formData = new FormData();
    const teks_mahasiswa = dataLengkap.presentasi_transcript.trim();

    // =======================================================
    // 🕵️ RADAR PENGECEKAN DATA (PENTING!)
    // =======================================================
    console.log("🕵️ CEK DATA SEBELUM TERBANG KE AI:");
    console.log("1. Object File:", pdfFile);
    console.log("2. Ukuran File PDF:", pdfFile ? (pdfFile.size / 1024).toFixed(2) + " KB" : "0 KB (RUSAK!)");
    console.log("3. Teks Presentasi:", teks_mahasiswa !== "" ? teks_mahasiswa : "⚠️ KOSONG!");
    // =======================================================

    formData.append("file_skripsi", pdfFile); 
    formData.append("teks_mahasiswa", teks_mahasiswa);

    const response = await fetch(HF_API_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Status: ${response.status}. Detail: ${errorText}`);
    }

    const result = await response.json();
    console.log("Berhasil! Hasil Prediksi dari Hugging Face:", result);
    
    return result;

  } catch (error) {
    console.error("Error API Hugging Face:", error);
    throw error;
  }
};

// =========================================================
// 3. FUNGSI TRANSCRIBE AUDIO MENGGUNAKAN GROQ (WHISPER AI)
// =========================================================
export const transcribeAudioWithGroq = async (audioBlob) => {
  try {
    // ⚠️ GANTI DENGAN API KEY GROQ KAMU:
    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    
    // Siapkan koper FormData untuk mengirim file audio
    const formData = new FormData();
    // Kita namakan filenya 'audio.webm'
    formData.append("file", audioBlob, "audio.webm"); 
    formData.append("model", "whisper-large-v3"); // Model STT terbaik saat ini
    formData.append("response_format", "json");
    formData.append("language", "id"); // Paksa bahasa Indonesia

    console.log("🚀 Menerbangkan rekaman audio ke Groq Cloud...");

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API Error: ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Groq berhasil mencatat:", result.text);
    
    return result.text; // Ini adalah teks utuh tanpa cacat
  } catch (error) {
    console.error("Gagal memproses audio di Groq:", error);
    return "Maaf, sistem gagal memproses suara Anda.";
  }
};