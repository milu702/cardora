import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck, Lock, UserCheck, VideoOff } from 'lucide-react';

const PersonVerificationScanner = ({ onCaptureConfirm, onCancel, initialPhoto = null }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(initialPhoto);
  const [capturedAt, setCapturedAt] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [startingCamera, setStartingCamera] = useState(false);

  // Initialize and start live camera stream
  const startCamera = async () => {
    setErrorMsg(null);
    setStartingCamera(true);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setCapturedPhoto(null);
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMsg('Unable to access live camera. Please allow camera permissions in your browser to complete person verification.');
      setCameraActive(false);
    } finally {
      setStartingCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!initialPhoto) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, []);

  // Capture snapshot from video canvas
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally for mirror camera feel
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const nowStr = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    });

    setCapturedPhoto(dataUrl);
    setCapturedAt(nowStr);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setCapturedAt(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (onCaptureConfirm && capturedPhoto) {
      onCaptureConfirm({
        photoUrl: capturedPhoto,
        capturedAt: capturedAt || new Date().toLocaleString(),
      });
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-900 dark:text-white">
      {/* Hidden canvas for taking snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#1B5E20] to-emerald-900 text-white border border-[#66BB6A]/40 shadow-lg flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
            <UserCheck className="w-6 h-6 text-[#66BB6A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-wide font-poppins text-white">
                PERSON VERIFICATION
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-300" /> LIVE CAMERA ONLY
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              Position your face inside the frame for mandatory plot owner identity capture.
            </p>
          </div>
        </div>
      </div>

      {/* Scanner Viewport Container */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border-2 border-[#2E7D32]/40 shadow-2xl min-h-[320px] flex flex-col items-center justify-center">

        {/* Live Camera View */}
        {cameraActive && !capturedPhoto && (
          <div className="relative w-full h-[360px] sm:h-[400px] bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />

            {/* Overlay Scanner Frame */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
              {/* Darkened Vignette Outside Frame */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

              {/* Face Guide Frame Oval / Box */}
              <div className="relative z-10 w-64 h-80 sm:w-72 sm:h-96 rounded-[50%/40%] border-4 border-emerald-400 border-dashed shadow-[0_0_40px_rgba(16,185,129,0.4)] flex flex-col items-center justify-between p-6">
                
                {/* Scanner Target Reticle Corners */}
                <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                {/* Animated Scan Line */}
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: [0, 240, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34D399]"
                />

                <div className="text-center bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-400/40 shadow-lg mt-auto mb-4">
                  <p className="text-xs font-black text-emerald-300 tracking-wide">
                    Position your face inside the frame
                  </p>
                </div>
              </div>

              {/* Live Status HUD Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-400/40 text-xs font-black text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-300">● Camera Active</span>
              </div>
            </div>
          </div>
        )}

        {/* Captured Photo Preview View */}
        {capturedPhoto && (
          <div className="relative w-full h-[360px] sm:h-[400px] bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="relative w-64 h-80 sm:w-72 sm:h-84 rounded-2xl overflow-hidden border-4 border-emerald-500 shadow-2xl">
              <img
                src={capturedPhoto}
                alt="Live Captured Person Verification"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 text-center">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-slate-950" /> Live Captured Photo
                </span>
                {capturedAt && (
                  <p className="text-[10px] text-emerald-200 mt-1 font-mono">{capturedAt}</p>
                )}
              </div>
            </div>

            <div className="mt-3 text-center space-y-1">
              <h4 className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Photo captured successfully
              </h4>
              <p className="text-xs text-slate-400">
                Confirm your live photo to attach it to your plot verification dossier.
              </p>
            </div>
          </div>
        )}

        {/* Error / Permission Denied State */}
        {errorMsg && !cameraActive && !capturedPhoto && (
          <div className="p-8 text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-400 mx-auto">
              <VideoOff className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-rose-400">Camera Access Required</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{errorMsg}</p>
            </div>
            <button
              type="button"
              onClick={startCamera}
              disabled={startingCamera}
              className="px-6 py-2.5 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw className={`w-4 h-4 ${startingCamera ? 'animate-spin' : ''}`} />
              <span>Retry Camera Stream</span>
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons Strip */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {!capturedPhoto && cameraActive && (
          <>
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-2xl border border-gray-300 dark:border-slate-700 font-bold text-xs hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCapture}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-[#1B5E20] text-white font-black text-xs shadow-xl hover:scale-105 transition-all flex items-center gap-2 border border-emerald-400/40"
            >
              <Camera className="w-4 h-4 text-amber-300" />
              <span>[ Capture Photo ]</span>
            </button>
          </>
        )}

        {capturedPhoto && (
          <div className="w-full flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleRetake}
              className="px-6 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>[ Retake ]</span>
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-emerald-600 text-white font-black text-xs shadow-xl hover:scale-105 transition-all flex items-center gap-2 border border-emerald-400/50"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>[ Use Photo & Attach to Verification ]</span>
            </button>
          </div>
        )}
      </div>

      {/* Security note */}
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Security Note:</strong> This photo will be securely stored as your plot listing identity verification record and reviewed by system supervisors alongside your Pattayam legal title.
        </span>
      </div>
    </div>
  );
};

export default PersonVerificationScanner;
