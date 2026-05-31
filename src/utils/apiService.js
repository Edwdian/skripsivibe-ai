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
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model", "whisper-large-v3");
  formData.append("language", "id"); 
  
  // 🚀 PROMPT KETAT: Perintahkan AI untuk tidak mengoreksi apapun!
  formData.append("prompt", "Transkripsi verbatim mutlak. Tuliskan semua kata apa adanya persis sesuai audio asli. Jangan merubah pola kalimat, jangan memperbaiki tata bahasa, dan tuliskan segala jeda atau ucapan persis seperti yang terdengar.");
  formData.append("temperature", "0.2"); 

  try {
    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`, 
      },
      body: formData
    });

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error Groq:", error);
    return "";
  }
};

// =========================================================
// 4. FUNGSI EVALUASI TANYA JAWAB (QnA) KE FASTAPI LOKAL
// =========================================================
export const evaluateQna = async (dataLengkap, questions = []) => {
  const formData = new FormData();
  
  // Masukkan pertanyaan dan jawaban ke dalam form data
  formData.append("pertanyaan_1", questions[0] || "");
  formData.append("jawaban_1", dataLengkap.jawaban_1 || "");
  
  formData.append("pertanyaan_2", questions[1] || "");
  formData.append("jawaban_2", dataLengkap.jawaban_2 || "");
  
  formData.append("pertanyaan_3", questions[2] || "");
  formData.append("jawaban_3", dataLengkap.jawaban_3 || "");

  try {
    // Menembak ke endpoint /api/evaluasi-qna di FastAPI lokal kamu
    const response = await fetch("http://127.0.0.1:8000/api/evaluasi-qna", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Status: ${response.status}. Detail: ${errorText}`);
    }
    
    const result = await response.json();
    console.log("Berhasil! Hasil Evaluasi QnA dari FastAPI:", result);
    
    return result; 
  } catch (error) {
    console.error("Error Evaluasi QnA FastAPI:", error);
    throw error;
  }
};