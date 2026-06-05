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
  Sparkles
} from "lucide-react";

// Import API Call dari apiService
import { sendToRenderModel, transcribeAudioWithGroq, evaluateQna } from '../utils/apiService';

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
  const [dataLengkap, setDataLengkap] = useState({
    presentasi_transcript: "",
    jawaban_1: "",
    jawaban_2: "",
    jawaban_3: ""
  });

  const micStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null); 
  const audioChunksRef = useRef([]);

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
        
        Promise.all([
          sendToRenderModel(selectedFile, dataLengkap), 
          evaluateQna(dataLengkap, generatedQuestions)  
        ])
          .then(([hasilPrediksi, hasilQna]) => {
            setIsEvaluating(false);
            navigate("/dashboard-hasil", { 
              state: { 
                hasilAI: hasilPrediksi, 
                hasilQna: hasilQna,     
                transkrip: dataLengkap,
                durasiTotal: time 
              } 
            });
          })
          .catch(err => {
            setIsEvaluating(false);
            alert("Yah, gagal mengirim data evaluasi ke server AI.");
          });
        break;
      default:
        break;
    }

    setActiveVideo(nextVideo);
  }, [phase, generatedQuestions, dataLengkap, selectedFile, navigate]);

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

  // =========================================================
  // 4. TRIGGER MANUAL SELESAI
  // =========================================================
  const handleManualNextPhase = () => {
    shouldListen.current = false;
    
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop(); 
    }
    
    setUserTranscript("Memproses transkripsi...");
  };

  // =========================================================
  // 5. HYBRID RECORDING LOGIC
  // =========================================================
  useEffect(() => {
    currentPhaseRef.current = phase; 
    let recognition = null;
    const isUserTurn = phase === 'presentation' || phase.startsWith('answering_');
    shouldListen.current = isUserTurn && isMicOn && !isAiSpeaking;

    if (shouldListen.current && micStreamRef.current && !mediaRecorderRef.current) {
      const mediaRecorder = new MediaRecorder(micStreamRef.current, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessingAudio(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const textDariGroq = await transcribeAudioWithGroq(audioBlob);
        const currentPhase = currentPhaseRef.current;
        
        const textHasil = textDariGroq.trim() !== "" ? textDariGroq : "Mahasiswa tidak memberikan jawaban verbal.";

        if (currentPhase === 'presentation') {
          setDataLengkap(prev => ({ ...prev, presentasi_transcript: textHasil }));
          setPhase('transisi_manual');
        } else if (currentPhase === 'answering_1') {
          setDataLengkap(prev => ({ ...prev, jawaban_1: textHasil }));
          setPhase('qna_2_ask');
        } else if (currentPhase === 'answering_2') {
          setDataLengkap(prev => ({ ...prev, jawaban_2: textHasil }));
          setPhase('qna_3_ask');
        } else if (currentPhase === 'answering_3') {
          setDataLengkap(prev => ({ ...prev, jawaban_3: textHasil }));
          setPhase('closing_video');
        }

        setIsProcessingAudio(false);
        mediaRecorderRef.current = null; 
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
          let detektorKata = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            detektorKata += event.results[i][0].transcript.toLowerCase() + " ";
          }
          
          const teksLengkap = detektorKata.trim();
          if (!isProcessingAudio) {
             setUserTranscript(teksLengkap); 
          }
          
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
    <div className="h-screen w-full flex flex-col p-4 md:p-6 font-sans text-slate-800 overflow-hidden relative" style={{ background: "linear-gradient(160deg, #f0f8ff 0%, #e1f0fd 25%, #dbeeff 55%, #edf6ff 100%)" }}>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(147,197,253,0.25) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(186,230,255,0.22) 0%, transparent 70%)" }} />
      </div>

      {/* LOADING SCREEN */}
      {phase === 'loading_data' && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white border border-blue-100 p-8 rounded-3xl text-center shadow-2xl flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-sky-500" />
            <h2 className="text-xl font-bold text-slate-800">Menyiapkan Ruang Sidang...</h2>
          </div>
        </div>
      )}

      {isEvaluating && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all duration-300">
          <div className="bg-white border border-blue-100 p-8 rounded-3xl text-center shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
            <Loader2 size={40} className="animate-spin text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-800">Menyusun Hasil Evaluasi AI...</h2>
            <p className="text-sm text-slate-500">Menganalisis presentasi dan sesi tanya jawab Anda.</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 relative z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(147,197,253,0.5)", backdropFilter: "blur(12px)" }}>
            <div className="w-4 h-4 rotate-45 rounded-sm bg-gradient-to-br from-blue-400 via-sky-400 to-cyan-300" />
          </div>
          <h1 className="font-bold text-lg text-slate-800">Skripsivibe AI</h1>
        </div>
        <button className="p-2 rounded-xl bg-white/60 border border-blue-200/50 backdrop-blur-xl text-slate-700 hover:bg-white/80 transition shadow-sm">
          <Maximize size={18} />
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 w-full flex flex-col md:flex-row gap-4 relative overflow-hidden pb-4 z-10">
        
        {/* DOSEN AI */}
        <div className="w-full md:w-[30%] lg:w-[25%] h-[30vh] md:h-full bg-slate-900 rounded-3xl border border-blue-200/50 shadow-[0_12px_32px_rgba(15,23,42,0.08)] relative overflow-hidden shrink-0 flex flex-col">
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
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/90 to-transparent pointer-events-none z-20"></div>

          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-blue-100 shadow-sm z-30">
            <Volume2 size={14} className={isAiSpeaking || (!videoRefs.current[activeVideo]?.muted && activeVideo) ? "text-blue-500" : "text-slate-400"} />
            {isAiSpeaking || (!videoRefs.current[activeVideo]?.muted && activeVideo) ? (
              <div className="flex gap-[2px] items-center h-3">
                <div className="w-[2px] bg-blue-500 rounded-full h-full animate-pulse"></div>
                <div className="w-[2px] bg-blue-500 rounded-full h-1/2 animate-pulse"></div>
                <div className="w-[2px] bg-blue-500 rounded-full h-3/4 animate-pulse"></div>
              </div>
            ) : <div className="w-4 h-[2px] bg-slate-400 rounded-full"></div>}
          </div>

          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-100 shadow-sm z-30">
            <span className="text-slate-700 text-sm font-bold">Prof. Budi (Dosen AI)</span>
          </div>
        </div>

        {/* USER CAMERA CARD */}
        <div className="flex-1 h-[50vh] md:h-full bg-white/60 rounded-3xl border border-blue-200/50 backdrop-blur-2xl shadow-[0_12px_32px_rgba(15,23,42,0.08)] relative overflow-hidden flex items-center justify-center">
          
          <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${isVideoOn && cameraStatus === "granted" ? "opacity-100 z-10" : "opacity-0 z-0"}`} />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent z-10 pointer-events-none"></div>

          <div className="absolute inset-0 flex items-center justify-center z-0">
            {cameraStatus === "loading" && isVideoOn && (
              <div className="flex flex-col items-center gap-3 text-slate-500"><Loader2 size={40} className="animate-spin text-blue-500" /><p className="text-sm font-medium">Meminta akses kamera...</p></div>
            )}
            {cameraStatus === "denied" && isVideoOn && (
              <div className="flex flex-col items-center gap-3 text-red-500 bg-red-500/10 p-6 rounded-2xl border border-red-500/20 text-center mx-4 max-w-md"><CameraOff size={40} /><p className="text-sm font-medium">Akses kamera ditolak</p></div>
            )}
            {!isVideoOn && (
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-24 h-24 rounded-full bg-white/50 border border-blue-100 flex items-center justify-center shadow-inner"><CameraOff size={32} className="text-slate-400" /></div>
                <p className="text-sm font-bold text-slate-500">Kamera Dimatikan</p>
              </div>
            )}
          </div>

          <div className="absolute top-4 left-4 flex flex-col gap-3 z-20">
            {/* INDIKATOR REC & TIMER (Timer disembunyikan saat QnA) */}
            <div className="flex items-center gap-3">
              <div className="bg-white/90 backdrop-blur-md border border-red-200 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-red-500 text-xs md:text-sm font-bold tracking-wider">REC</span>
              </div>
              {phase === 'presentation' && (
                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-2 border border-blue-100">
                  <span className="font-mono text-xs md:text-sm font-bold tracking-widest text-slate-700">
                    {formatTime(time)}
                    <span className="text-slate-400"> / 10:00</span>
                  </span>
                </div>
              )}
            </div>

            {/* BOX PETUNJUK USER */}
            {phase === 'presentation' && (
              <div className="bg-white/95 backdrop-blur-md border border-blue-200 px-4 py-3 rounded-2xl shadow-xl w-max flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 mt-1">
                <div className="flex items-center gap-2">
                  <Mic size={16} className={shouldListen.current ? "text-blue-500 animate-pulse" : "text-slate-400"} />
                  <span className="text-blue-600 text-xs font-bold tracking-wider uppercase">Petunjuk Presentasi:</span>
                </div>
                <p className="text-slate-600 text-xs pl-6 font-medium">
                  Ucapkan <span className="font-bold text-blue-600">"Sekian presentasi dari saya"</span> jika sudah selesai,<br/>
                  atau langsung klik tombol <span className="font-bold text-blue-600">Selesai Presentasi</span> di pojok bawah.
                </p>
              </div>
            )}

            {phase.startsWith('answering_') && (
              <div className="bg-white/95 backdrop-blur-md border border-sky-200 px-4 py-3 rounded-2xl shadow-xl w-max flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 mt-1">
                <div className="flex items-center gap-2">
                  <Mic size={16} className={shouldListen.current ? "text-sky-500 animate-pulse" : "text-slate-400"} />
                  <span className="text-sky-600 text-xs font-bold tracking-wider uppercase">Petunjuk Menjawab:</span>
                </div>
                <p className="text-slate-600 text-xs pl-6 font-medium">
                  Ucapkan <span className="font-bold text-sky-600">"Sekian jawaban saya"</span> jika sudah selesai,<br/>
                  atau langsung klik tombol <span className="font-bold text-sky-600">Selesai Menjawab</span> di pojok bawah.
                </p>
              </div>
            )}

            {/* POP-UP PERTANYAAN DOSEN AKTIF (GLASSMORPHISM LIGHT THEME) */}
            {activeQuestionIndex !== -1 && (
              <div className="bg-white/95 border border-blue-200 backdrop-blur-xl p-5 rounded-2xl shadow-xl max-w-sm mt-3 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={16} className="text-blue-500" />
                  <p className="text-blue-500 text-xs font-bold uppercase tracking-wider">Pertanyaan {activeQuestionIndex + 1}</p>
                </div>
                <p className="text-slate-800 text-sm leading-relaxed font-bold">
                  "{generatedQuestions[activeQuestionIndex]}"
                </p>
              </div>
            )}
          </div>

          {/* TOMBOL MANUAL INPUT POJOK KIRI BAWAH */}
          <div className="absolute bottom-6 left-6 z-50">
            {phase === "presentation" && (
              <button 
                onClick={handleManualNextPhase} 
                className="text-white px-5 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #2563eb, #0ea5e9)", boxShadow: "0 8px 20px rgba(59,130,246,0.3)" }}
              >
                <CheckCircle2 size={20} />
                Selesai Presentasi
              </button>
            )}
            {phase.startsWith('answering_') && (
              <button 
                onClick={handleManualNextPhase} 
                className="text-white px-5 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #2563eb, #0ea5e9)", boxShadow: "0 8px 20px rgba(59,130,246,0.3)" }}
              >
                <CheckCircle2 size={20} />
                Selesai Menjawab
              </button>
            )}
            {phase === "finished" && (
              <div className="bg-white/90 backdrop-blur-md border border-blue-200 px-4 py-2 rounded-xl shadow-sm">
                <span className="text-blue-600 text-xs font-bold tracking-wider">UJIAN SELESAI</span>
              </div>
            )}
          </div>

          {/* CONTROL CAMERA & MIC */}
          <div className="absolute bottom-5 right-5 md:bottom-6 md:right-6 z-50 flex items-center gap-3">
            <button onClick={() => setIsVideoOn(!isVideoOn)} className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all backdrop-blur-xl border shadow-[0_10px_30px_rgba(59,130,246,0.15)] ${isVideoOn ? "bg-white/90 border-blue-200 text-slate-700 hover:bg-white" : "bg-red-50 text-red-500 border-red-200"}`}>
              {isVideoOn ? <Video size={22} /> : <CameraOff size={22} />}
            </button>
            <button onClick={() => setIsMicOn(!isMicOn)} className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all backdrop-blur-xl border shadow-[0_10px_30px_rgba(59,130,246,0.15)] ${isMicOn ? "bg-white/90 border-blue-200 text-slate-700 hover:bg-white" : "bg-red-50 text-red-500 border-red-200"}`}>
              {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}