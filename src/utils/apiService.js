export const fetchQuestionsFromPDF = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("https://skripsivibe-backend.onrender.com/api/gemini/generate-pertanyaan", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Gagal mengambil data dari server Express.");
    return await response.json(); 

  } catch (error) {
    console.error("Error API Gemini (Express):", error);
    throw error;
  }
};

export const sendToRenderModel = async (pdfFile, dataLengkap) => {
  try {
    const BACKEND_API_URL = "https://skripsivibe-backend.onrender.com/api/gemini/evaluasi-skripsi";
        
    const formData = new FormData();
    
    // 🔥 PERBAIKAN: Gunakan teks_full (Presentasi + QnA) agar TF-IDF/LSTM menilai semuanya
    const teks_mahasiswa = dataLengkap.teks_full ? dataLengkap.teks_full.trim() : dataLengkap.presentasi_transcript.trim();

    // Pastikan nama field 'file' sesuai dengan upload.single('file') di Express
    formData.append("file", pdfFile); 
    formData.append("teks_mahasiswa", teks_mahasiswa);

    const response = await fetch(BACKEND_API_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Status: ${response.status}. Detail: ${errorText}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error("Error Evaluasi Skripsi (Express -> Hugging Face):", error);
    throw error;
  }
};

export const transcribeAudioWithGroq = async (audioBlob) => {
  const formData = new FormData();
  // Kita hanya perlu mengirim file audio ke backend kita sendiri
  formData.append("file", audioBlob, "audio.webm");

  try {
    // 🔥 Menembak ke backend Render milikmu sendiri, BUKAN ke api.groq.com
    const response = await fetch("https://skripsivibe-backend.onrender.com/api/gemini/transcribe-audio", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Backend Groq error:", data);
      return ""; // Jika gagal, Frontend akan otomatis memakai Web Speech API (Fallback)
    }
    
    return data.text || "";
  } catch (error) {
    console.error("Error Fetch Backend Transkrip:", error);
    return "";
  }
};

export const evaluateQna = async (dataLengkap, questions = []) => {
  const formData = new FormData();
  
  // 🔥 PERBAIKAN: Kirim transkrip presentasi agar Gemini punya konteks cerita
  formData.append("presentasi_transcript", dataLengkap.presentasi_transcript || "");
  
  formData.append("pertanyaan_1", questions[0] || "");
  formData.append("jawaban_1", dataLengkap.jawaban_1 || "");
  
  formData.append("pertanyaan_2", questions[1] || "");
  formData.append("jawaban_2", dataLengkap.jawaban_2 || "");
  
  formData.append("pertanyaan_3", questions[2] || "");
  formData.append("jawaban_3", dataLengkap.jawaban_3 || "");

  try {
    const response = await fetch("https://skripsivibe-backend.onrender.com/api/gemini/evaluasi-qna", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Status: ${response.status}. Detail: ${errorText}`);
    }
    
    const result = await response.json();
    return result; 
  } catch (error) {
    console.error("Error Evaluasi QnA Express:", error);
    throw error;
  }
};