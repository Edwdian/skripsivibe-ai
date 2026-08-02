import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  CameraOff,
  Loader2,
  Volume2,
  Maximize,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Info,
  Brain
} from "lucide-react";

// Import API Call dari apiService
import { sendToRenderModel, transcribeAudioWithGroq, evaluateQna } from '../utils/apiService';
import logoSkripsiVibe from '../assets/logo skripsivibe.png';

const AI_VIDEOS = {
  pembukaan: "https://res.cloudinary.com/doabehyrn/video/upload/v1778742813/Pembukaan_yuntgk.mp4",
  mendengarkan: "https://res.cloudinary.com/doabehyrn/video/upload/v1778894601/Model_berkedip_dan_bergerak_natural_202605160816_oiifoo.mp4",
  transisiQna: "https://res.cloudinary.com/doabehyrn/video/upload/v1778742814/SesiQNA_r6o99e.mp4", 
  waktuHabis: "https://res.cloudinary.com/doabehyrn/video/upload/v1778742819/WaktuHabis_gfnsvs.mp4",
  bertanya: "https://res.cloudinary.com/doabehyrn/video/upload/v1778894528/Pertanyaan_kq2wku.mp4", 
  selesai: "https://res.cloudinary.com/doabehyrn/video/upload/v1778742814/Selesai_t3thbp.mp4"
};

export default function DashboardUjian() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [cameraStatus, setCameraStatus] = useState("loading");
  
  const [phase, setPhase] = useState("loading_data"); 
  const [time, setTime] = useState(0); 

  const [selectedFile, setSelectedFile] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]); 
  const payloadAPI = useRef({
    presentasi_transcript: "",
    jawaban_1: "",
    jawaban_2: "",
    jawaban_3: ""
  });

  const micStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null); 
  const audioChunksRef = useRef([]);
  const liveTranscriptRef = useRef("");
  const cumulativeTranscriptRef = useRef("");

  const [isProcessingAudio, setIsProcessingAudio] = useState(false); 
  const [isEvaluating, setIsEvaluating] = useState(false); 
  const currentPhaseRef = useRef(""); 

  const [activeVideo, setActiveVideo] = useState(null); 
  const videoRefs = useRef({}); 
  const [isAiSpeaking, setIsAiSpeaking] = useState(false); 

  const [userTranscript, setUserTranscript] = useState(""); 
  const shouldListen = useRef(false);
  const videoRef = useRef(null);

  // =========================================================
  // 1. INISIALISASI DATA & AKSES MIKROFON SEJAK AWAL
  // =========================================================
  useEffect(() => {
    const fileDariUser = window.fileSkripsiTitipan;
    const pertanyaanDariUser = location.state?.pertanyaan;

    if (fileDariUser && pertanyaanDariUser) {
      setSelectedFile(fileDariUser);
      setGeneratedQuestions(pertanyaanDariUser);
      
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          micStreamRef.current = stream;
          setPhase("intro"); 
        })
        .catch((err) => {
          alert("Aplikasi membutuhkan izin mikrofon yang aktif agar dapat melakukan transkripsi.");
          navigate("/dashboard-user");
        });

      const unlockAudio = new Audio();
      unlockAudio.play().catch(() => {});
    } else {
      alert("Data skripsi tidak ditemukan. Silakan upload terlebih dahulu.");
      navigate("/dashboard-user"); 
    }

    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [location, navigate]);

  // =========================
  // FUNGSI TTS AI
  // =========================
  const speakAiTTS = (text, onEndCallback) => {
    setIsAiSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID'; 
    utterance.rate = 0.9;     
    utterance.pitch = 0.8; 
    
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoices = voices.filter(voice => voice.lang.includes('id'));
    if (indonesianVoices.length > 0) utterance.voice = indonesianVoices[0]; 

    utterance.onend = () => {
      setIsAiSpeaking(false); 
      if (onEndCallback) onEndCallback(); 
    };
    window.speechSynthesis.speak(utterance);
  };

  // =========================================================
  // 2. LOGIKA ALUR FASE (MANAJEMEN VIDEO & PEMANGGILAN EVALUASI)
  // =========================================================
  useEffect(() => {
    if (phase === 'loading_data') return;

    window.speechSynthesis.cancel(); 
    let nextVideo = null;

    switch(phase) {
      case 'intro':
        nextVideo = 'pembukaan'; 
        break;
      case 'presentation':
        nextVideo = 'mendengarkan'; 
        break;
      case 'time_up':
        nextVideo = 'waktuHabis'; 
        break;
      case 'transisi_manual':
        nextVideo = 'transisiQna';
        break;
      case 'qna_1_ask':
        nextVideo = 'bertanya'; 
        speakAiTTS("Pertanyaan ke-1. " + (generatedQuestions[0] || "Tidak ada pertanyaan."), () => setPhase('answering_1'));
        break;
      case 'answering_1':
        nextVideo = 'mendengarkan'; 
        break;
      case 'qna_2_ask':
        nextVideo = 'bertanya'; 
        speakAiTTS("Pertanyaan ke-2. " + (generatedQuestions[1] || "Tidak ada pertanyaan."), () => setPhase('answering_2'));
        break;
      case 'answering_2':
        nextVideo = 'mendengarkan'; 
        break;
      case 'qna_3_ask':
        nextVideo = 'bertanya'; 
        speakAiTTS("Pertanyaan ke-3. " + (generatedQuestions[2] || "Tidak ada pertanyaan."), () => setPhase('answering_3'));
        break;
      case 'answering_3':
        nextVideo = 'mendengarkan'; 
        break;
      case 'closing_video':
        nextVideo = 'selesai'; 
        break;
        case 'finished':
        nextVideo = 'mendengarkan'; 
        setIsEvaluating(true); 

        const teksPresentasi = payloadAPI.current.presentasi_transcript || "Mahasiswa diam.";
        const jawab1 = payloadAPI.current.jawaban_1 || "";
        const jawab2 = payloadAPI.current.jawaban_2 || "";
        const jawab3 = payloadAPI.current.jawaban_3 || "";

        const teksKeseluruhan = `${teksPresentasi} ${jawab1} ${jawab2} ${jawab3}`.trim();

        const finalPayload = {
          presentasi_transcript: teksPresentasi,
          jawaban_1: jawab1 || "-",
          jawaban_2: jawab2 || "-",
          jawaban_3: jawab3 || "-",
          teks_full: teksKeseluruhan
        };

        console.log("MENGIRIM PAYLOAD KE RENDER & GEMINI...", finalPayload);

        Promise.all([
          sendToRenderModel(selectedFile, finalPayload),
          evaluateQna(finalPayload, generatedQuestions)
        ])
        .then(([hasilPrediksi, hasilQnaGemini]) => {
          setIsEvaluating(false);

          navigate("/dashboard-hasil", { 
            state: { 
              hasilAI: hasilPrediksi,          // Data murni LSTM & TF-IDF
              hasilQna: hasilQnaGemini,        // Data murni Teks Evaluasi Gemini
              transkrip: payloadAPI.current, 
              durasiTotal: time 
            } 
          });
        })
        .catch(err => {
          setIsEvaluating(false);
          console.error("Error API:", err);
          alert("Yah, gagal mengirim data evaluasi ke server.");
        });
        break;
      default:
        break;
    }

    setActiveVideo(nextVideo);
  }, [phase, generatedQuestions, selectedFile, navigate]);

  // =========================
  // TRIGGER PLAY/PAUSE VIDEO
  // =========================
  useEffect(() => {
    if (activeVideo && videoRefs.current[activeVideo]) {
      const playPromise = videoRefs.current[activeVideo].play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {}); 
      }

      Object.keys(videoRefs.current).forEach(key => {
        if (key !== activeVideo && videoRefs.current[key]) {
          videoRefs.current[key].pause();
          if (key !== 'mendengarkan' && key !== 'bertanya') {
            videoRefs.current[key].currentTime = 0; 
          }
        }
      });
    }
  }, [activeVideo]);

  // 🔥 STATE UNTUK PENGINGAT SEMENTARA
  const [showReminder, setShowReminder] = useState(false);
  const [reminderText, setReminderText] = useState("");

  useEffect(() => {
    // Tampilkan pengingat hanya selama 6 detik saat pindah fase
    if (phase === 'presentation') {
      setReminderText('Ucapkan "Sekian presentasi dari saya" atau klik Akhiri Presentasi jika sudah selesai.');
      setShowReminder(true);
      const timer = setTimeout(() => setShowReminder(false), 6000);
      return () => clearTimeout(timer);
    } else if (phase.startsWith('answering_')) {
      setReminderText('Ucapkan "Sekian jawaban saya" atau klik Selesai Menjawab jika sudah selesai.');
      setShowReminder(true);
      const timer = setTimeout(() => setShowReminder(false), 6000);
      return () => clearTimeout(timer);
    } else {
      setShowReminder(false);
    }
  }, [phase]);

  const handleVideoEnded = (vidKey) => {
    if (vidKey !== activeVideo) return;
    
    if (phase === 'intro') setPhase('presentation'); 
    else if (phase === 'time_up') setPhase('qna_1_ask'); 
    else if (phase === 'transisi_manual') setPhase('qna_1_ask'); 
    else if (phase === 'closing_video') setPhase('finished'); 
  };

  // =========================================================
  // 3. TIMER TOTAL AKUMULATIF (JALAN TERUS DI LATAR BELAKANG)
  // =========================================================
  useEffect(() => {
    let timer;
    
    // Timer terus berjalan selama sesi masih aktif (termasuk saat QnA)
    const isSessionActive = 
      phase === 'presentation' || 
      phase === 'transisi_manual' ||
      phase.startsWith('qna_') || 
      phase.startsWith('answering_') ||
      phase === 'closing_video';

    if (isSessionActive) {
      timer = setInterval(() => {
        setTime((prev) => {
          if (prev >= MAX_TIME - 1) {
            clearInterval(timer);
            // Otomatis pindah hanya jika waktu presentasi habis
            if (phase === 'presentation') handleManualNextPhase(); 
            return MAX_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase]);

  const MAX_TIME = 10 * 60;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleManualNextPhase = () => {
    shouldListen.current = false;
    
    // 1. Matikan Voice Recognition (Detektor teks live)
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    
    // 2. Hentikan MediaRecorder dan biarkan dia memproses di latar belakang
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      const currentRecorder = mediaRecorderRef.current;
      currentRecorder.targetPhase = phase; // Titipkan status phase saat ini ke recorder
      currentRecorder.stop();
      
      // Kosongkan ref segera agar siap digunakan untuk pertanyaan berikutnya
      mediaRecorderRef.current = null; 
    }
    
    setUserTranscript("Menyimpan jawaban...");

    // 3. LANGSUNG PINDAH FASE UI TANPA MENUNGGU GROQ
    if (phase === 'presentation') {
      setPhase('transisi_manual');
    } else if (phase === 'answering_1') {
      setPhase('qna_2_ask');
    } else if (phase === 'answering_2') {
      setPhase('qna_3_ask');
    } else if (phase === 'answering_3') {
      setPhase('closing_video');
    }
  };

  useEffect(() => {
      currentPhaseRef.current = phase; 
      let recognition = null;
      const isUserTurn = phase === 'presentation' || phase.startsWith('answering_');
      shouldListen.current = isUserTurn && isMicOn && !isAiSpeaking;

      if (shouldListen.current && micStreamRef.current && !mediaRecorderRef.current) {
        const mediaRecorder = new MediaRecorder(micStreamRef.current, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        
        // Gunakan array LOKAL agar tidak bertabrakan jika user nge-klik cepat
        let localChunks = []; 

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            localChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = async (event) => {
          setIsProcessingAudio(true);
          const audioBlob = new Blob(localChunks, { type: 'audio/webm' });
          const targetPhase = event.target.targetPhase || currentPhaseRef.current;
          
          // 1. Ambil cadangan teks kuat dari Web Speech API
          let teksWebSpeech = cumulativeTranscriptRef.current || liveTranscriptRef.current || "";
          let textHasil = teksWebSpeech.trim() !== "" ? teksWebSpeech : "Mahasiswa tidak memberikan jawaban verbal.";

          if (audioBlob.size > 15000) { 
            try {
              const textDariGroq = await transcribeAudioWithGroq(audioBlob);
              
              if (textDariGroq && textDariGroq.trim() !== "") {
                 // 🔥 FILTER HALUSINASI WHISPER GROQ
                 const textLower = textDariGroq.toLowerCase();
                 const isHalusinasi = textLower.includes("terima kasih telah menonton") || 
                                      textLower.includes("thanks for watching") || 
                                      textLower.includes("subtitles by");
                 
                 if (isHalusinasi) {
                    console.warn("⚠️ Groq berhalusinasi 'Terima kasih telah menonton'. Memakai Web Speech.");
                    textHasil = teksWebSpeech; // Buang hasil Groq, pakai cadangan browser
                 } 
                 else if (teksWebSpeech.length > textDariGroq.length + 50) {
                    console.warn("⚠️ Groq memotong terlalu banyak teks. Menggunakan teks cadangan browser.");
                    textHasil = teksWebSpeech;
                 } else {
                    textHasil = textDariGroq; 
                 }
              }
            } catch (error) {
              console.error("Gagal transkrip di background:", error);
            }
          }

          // 3. RADAR DEBUGGING: Munculkan di Console untuk dipantau
          console.log(`[RADAR TEKS - ${targetPhase.toUpperCase()}] Teks final yang dikirim ke Server:`, textHasil);

          // Kosongkan kembali memori
          liveTranscriptRef.current = "";
          cumulativeTranscriptRef.current = "";

          // SIMPAN HASIL LANGSUNG KE MEMORI API (Anti Hilang)
          if (targetPhase === 'presentation') {
            payloadAPI.current.presentasi_transcript = textHasil;
          } else if (targetPhase === 'answering_1') {
            payloadAPI.current.jawaban_1 = textHasil;
          } else if (targetPhase === 'answering_2') {
            payloadAPI.current.jawaban_2 = textHasil;
          } else if (targetPhase === 'answering_3') {
            payloadAPI.current.jawaban_3 = textHasil;
          }

          setIsProcessingAudio(false);
        };

        try {
          if (mediaRecorder.state === "inactive") {
            mediaRecorder.start(1000); 
          }
        } catch (error) {}
      }

      if (shouldListen.current) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          recognition = new SpeechRecognition();
          recognitionRef.current = recognition;
          
          recognition.continuous = true;     
          recognition.interimResults = true; 
          recognition.lang = 'id-ID';

          recognition.onresult = (event) => {
            let finalWords = "";
            let interimWords = "";
            
            // 🔥 PERBAIKAN: Pisahkan kata yang sudah final dan yang masih diproses
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalWords += event.results[i][0].transcript + " ";
              } else {
                interimWords += event.results[i][0].transcript + " ";
              }
            }
            
            // Simpan kata final secara permanen agar tidak hilang saat Chrome restart
            if (finalWords !== "") {
              cumulativeTranscriptRef.current += finalWords;
            }
            
            const teksLengkap = (cumulativeTranscriptRef.current + interimWords).trim().toLowerCase();
            if (!isProcessingAudio) {
              setUserTranscript(teksLengkap); 
            }

            liveTranscriptRef.current = teksLengkap;
            
            if (
              (phase === 'presentation' && (teksLengkap.includes('sekian presentasi') || teksLengkap.includes('presentasi dari saya'))) ||
              (phase.startsWith('answering_') && (teksLengkap.includes('sekian jawaban') || teksLengkap.includes('jawaban saya')))
            ) {
              handleManualNextPhase();
            }
          };

          recognition.onend = () => { 
            if (shouldListen.current) { 
                try { recognition.start(); } catch(e){} 
            }
          };
          recognition.onerror = (e) => {
            if (e.preventDefault) e.preventDefault();
          };

          try { recognition.start(); } catch(e){}
        }
      }
      
      return () => {
        shouldListen.current = false;
        if (recognition) { try { recognition.stop(); } catch(e){} }
      };
  }, [phase, isMicOn, isAiSpeaking]);

  // =========================
  // CAMERA STREAM
  // =========================
  useEffect(() => {
    let mediaStream = null;
    const startCamera = async () => {
      try {
        setCameraStatus("loading");
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraStatus("granted");
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        setCameraStatus("denied");
      }
    };
    if (isVideoOn) startCamera();
    return () => {
      if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    };
  }, [isVideoOn]);

  let activeQuestionIndex = -1;
  if (phase.includes('_1') || phase === 'answering_1') activeQuestionIndex = 0;
  if (phase.includes('_2') || phase === 'answering_2') activeQuestionIndex = 1;
  if (phase.includes('_3') || phase === 'answering_3') activeQuestionIndex = 2;

return (
    <div className="h-screen w-full flex flex-col bg-slate-50 font-sans text-slate-800 overflow-hidden relative selection:bg-blue-200">
      
      {/* LOADING SCREEN */}
      {phase === "loading_data" && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white border border-blue-100 p-8 rounded-3xl text-center shadow-2xl flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-sky-500" />
            <h2 className="text-xl font-bold text-slate-800">
              Menyiapkan Ruang Sidang...
            </h2>
          </div>
        </div>
      )}

      {isEvaluating && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-all duration-300">
          <div className="bg-white border border-blue-100 p-10 rounded-3xl text-center shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 max-w-md">
            <div className="relative w-28 h-28 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[6px] border-blue-100 animate-ping opacity-75"></div>
              <div className="absolute inset-2 rounded-full border-4 border-blue-200 animate-pulse"></div>
              <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-blue-500 to-sky-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40">
                <Brain size={36} className="text-white animate-bounce" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">
              Menyusun Hasil Evaluasi AI
            </h2>
            <p className="text-sm text-slate-500 font-medium animate-pulse leading-relaxed px-4">
              Menganalisis presentasi dan sesi tanya jawab Anda. Mohon tunggu
              sebentar...
            </p>
          </div>
        </div>
      )}

      {isEvaluating && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all duration-300">
          <div className="bg-white p-8 rounded-3xl text-center shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 border border-slate-100">
            <Loader2 size={40} className="animate-spin text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-800">Menyusun Hasil Evaluasi AI...</h2>
            <p className="text-sm text-slate-500">Menganalisis presentasi dan sesi tanya jawab Anda.</p>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          {/* LOGO BARU MENGGUNAKAN IMAGE DARI ASSETS */}
          <img 
            src={logoSkripsiVibe} 
            alt="Logo SkripsiVibe AI" 
            className="w-8 h-8 rounded-lg object-contain"
          />
          <h1 className="font-bold text-lg text-slate-800 tracking-wide">SkripsiVibe AI</h1>
        </div>
        
        {/* TIMER DI HEADER */}
        {phase === 'presentation' && (
          <div className="bg-slate-100 px-4 py-1.5 rounded-full flex items-center gap-3 border border-slate-200">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            <span className="font-mono text-sm font-bold text-slate-700">
              {formatTime(time)} <span className="text-slate-400 font-medium">/ 10:00</span>
            </span>
          </div>
        )}

        <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition">
          <Maximize size={18} />
        </button>
      </div>

      {/* MAIN LAYOUT (STAGE) */}
      <div className="flex-1 w-full p-4 lg:p-6 flex flex-col lg:flex-row gap-4 relative overflow-hidden z-10">
        
        {/* =======================================
            VIDEO DOSEN AI (KIRI / ATAS) 
            ======================================= */}
        <div className="w-full lg:w-1/3 h-[35vh] lg:h-full bg-slate-900 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden shrink-0 group">
          
          <div className="absolute inset-0 w-full h-full bg-slate-900">
            {Object.entries(AI_VIDEOS).map(([key, src]) => {
              const isLooping = key === 'mendengarkan' || key === 'bertanya';
              const isMuted = key === 'mendengarkan' || key === 'bertanya';
              return (
                <video 
                  key={key}
                  ref={(el) => (videoRefs.current[key] = el)}
                  src={src}
                  preload="metadata" 
                  playsInline 
                  loop={isLooping} 
                  muted={isMuted} 
                  onEnded={() => handleVideoEnded(key)} 
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${activeVideo === key ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                />
              );
            })}
          </div>

          {/* GRADIENT SHADOW BAWAH UNTUK NAMA DOSEN */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none z-20"></div>

          {/* INDIKATOR SUARA AI */}
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10 z-30">
            <Volume2 size={14} className={isAiSpeaking || (!videoRefs.current[activeVideo]?.muted && activeVideo) ? "text-blue-400" : "text-white/50"} />
            {isAiSpeaking || (!videoRefs.current[activeVideo]?.muted && activeVideo) ? (
              <div className="flex gap-[2px] items-center h-3">
                <div className="w-[2px] bg-blue-400 rounded-full h-full animate-pulse"></div>
                <div className="w-[2px] bg-blue-400 rounded-full h-1/2 animate-pulse"></div>
                <div className="w-[2px] bg-blue-400 rounded-full h-3/4 animate-pulse"></div>
              </div>
            ) : <div className="w-4 h-[2px] bg-white/30 rounded-full"></div>}
          </div>

          {/* NAMA DOSEN */}
          <div className="absolute bottom-4 left-4 z-30">
            <span className="bg-black/40 backdrop-blur-md border border-white/10 text-white/90 text-xs px-3 py-1.5 rounded-lg font-medium tracking-wide">
              Prof. Budi (Dosen Penguji AI)
            </span>
          </div>

          {/* POP-UP PERTANYAAN (Tampil di area Dosen agar seolah dosen yang bicara) */}
          {activeQuestionIndex !== -1 && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-slate-200 max-w-[200px] lg:max-w-[280px] z-40 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={14} className="text-blue-600" />
                <p className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">Pertanyaan {activeQuestionIndex + 1}</p>
              </div>
              <p className="text-slate-800 text-xs lg:text-sm leading-relaxed font-semibold">
                "{generatedQuestions[activeQuestionIndex]}"
              </p>
            </div>
          )}
        </div>

        {/* =======================================
            USER CAMERA (KANAN / BAWAH UTAMA) 
            ======================================= */}
        <div className="flex-1 h-[45vh] lg:h-full bg-slate-900 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden flex items-center justify-center">
          
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${isVideoOn && cameraStatus === "granted" ? "opacity-100 z-10" : "opacity-0 z-0"}`} 
          />

          {/* STATE: KAMERA LOADING / MATI */}
          <div className="absolute inset-0 flex items-center justify-center z-0 bg-slate-900">
            {cameraStatus === "loading" && isVideoOn && (
              <div className="flex flex-col items-center gap-3 text-white/60">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-xs font-medium">Meminta akses kamera...</p>
              </div>
            )}
            {cameraStatus === "denied" && isVideoOn && (
              <div className="flex flex-col items-center gap-3 text-red-400 bg-red-950/40 p-6 rounded-2xl border border-red-900/50">
                <CameraOff size={32} />
                <p className="text-xs font-medium">Akses kamera ditolak browser</p>
              </div>
            )}
            {!isVideoOn && (
              <div className="flex flex-col items-center gap-3 text-white/40">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <CameraOff size={28} />
                </div>
                <p className="text-xs font-medium tracking-wide">Kamera Dimatikan</p>
              </div>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/90 to-transparent pointer-events-none z-20"></div>

          {/* IDENTITAS MAHASISWA */}
          <div className="absolute bottom-4 left-4 z-30">
            <span className="bg-black/40 backdrop-blur-md border border-white/10 text-white/90 text-xs px-3 py-1.5 rounded-lg font-medium tracking-wide">
              Anda (Mahasiswa)
            </span>
          </div>

          {/* PETUNJUK USER (Dipindah ke pojok kiri atas Kamera User) */}
          <div className="absolute top-4 left-4 z-30">
            {(phase === 'presentation' || phase.startsWith('answering_')) && (
              <div className="bg-black/50 backdrop-blur-md border border-white/10 px-3 py-2 rounded-lg flex items-center gap-2">
                <Mic size={14} className={shouldListen.current ? "text-emerald-400 animate-pulse" : "text-white/50"} />
                <span className="text-white/90 text-xs font-medium">
                  {phase === 'presentation' ? "Silakan presentasi..." : "Silakan menjawab..."}
                </span>
              </div>
            )}
          </div>

          {/* 🔥 FITUR BARU: LIVE SUBTITLE (CC) 🔥 */}
          {userTranscript && (phase === 'presentation' || phase.startsWith('answering_')) && (
            <div className="absolute bottom-16 left-0 right-0 flex justify-center px-8 z-40">
              <div className="bg-black/60 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-white/10 shadow-lg max-w-xl text-center transition-all duration-300">
                <p className="text-white/95 text-sm lg:text-base font-medium leading-relaxed drop-shadow-md">
                  {/* Logika Jendela Geser: Hanya tampilkan 12-15 kata terakhir */}
                  {userTranscript.split(' ').length > 12 
                    ? `... ${userTranscript.split(' ').slice(-12).join(' ')}` 
                    : userTranscript}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* =======================================
          BOTTOM CONTROL BAR (Alat Navigasi Utama)
          ======================================= */}
      <div className="h-20 bg-white border-t border-slate-200 flex items-center justify-center gap-4 px-6 shrink-0 z-20">
        
        {/* Tombol Toggle Mic */}
        <button 
          onClick={() => setIsMicOn(!isMicOn)} 
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm border ${isMicOn ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700" : "bg-red-50 hover:bg-red-100 border-red-200 text-red-500"}`}
          title={isMicOn ? "Matikan Mikrofon" : "Nyalakan Mikrofon"}
        >
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {/* Tombol Toggle Kamera */}
        <button 
          onClick={() => setIsVideoOn(!isVideoOn)} 
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm border ${isVideoOn ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700" : "bg-red-50 hover:bg-red-100 border-red-200 text-red-500"}`}
          title={isVideoOn ? "Matikan Kamera" : "Nyalakan Kamera"}
        >
          {isVideoOn ? <Video size={20} /> : <CameraOff size={20} />}
        </button>

        <div className="w-px h-8 bg-slate-300 mx-2"></div>

        {/* Tombol Selesai (Call To Action Utama) */}
        {phase === "presentation" && (
          <button 
            onClick={handleManualNextPhase} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.4)]"
          >
            <CheckCircle2 size={18} />
            Akhiri Presentasi
          </button>
        )}
        
        {phase.startsWith('answering_') && (
          <button 
            onClick={handleManualNextPhase} 
            className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold transition-all shadow-[0_4px_12px_rgba(2,132,199,0.3)] hover:shadow-[0_6px_16px_rgba(2,132,199,0.4)]"
          >
            <CheckCircle2 size={18} />
            Selesai Menjawab
          </button>
        )}

        {phase === "finished" && (
          <div className="bg-slate-100 text-slate-500 border border-slate-200 px-6 py-2.5 rounded-full font-semibold cursor-not-allowed">
            Ujian Selesai
          </div>
        )}
      </div>

    </div>
  );
}