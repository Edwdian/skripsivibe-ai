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
    const HF_API_URL = "https://frameszans-skripsivibe-ai.hf.space/api/prediksi"; 
    
    const formData = new FormData();
    const teks_mahasiswa = dataLengkap.presentasi_transcript.trim();

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
    
    return result;

  } catch (error) {
    console.error("Error API Hugging Face:", error);
    throw error;
  }
};

export const transcribeAudioWithGroq = async (audioBlob) => {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model", "whisper-large-v3");
  formData.append("language", "id"); 

  formData.append("prompt", "Berikut adalah presentasi formal simulasi tanya jawab sidang skripsi.");
  formData.append("temperature", "0");

  try {
    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`, 
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error response:", data);
      return "";
    }
    return data.text || "";
  } catch (error) {
    console.error("Error Groq:", error);
    return "";
  }
};

export const evaluateQna = async (dataLengkap, questions = []) => {
  const formData = new FormData();
  
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