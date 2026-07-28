import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { loginUser, loginWithFace } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [authMethod, setAuthMethod] = useState('password');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // Liveness Detection States
  const [blinkCount, setBlinkCount] = useState(0);
  const [isLiveVerified, setIsLiveVerified] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraInstanceRef = useRef(null);
  const earHistoryRef = useRef({ eyeClosed: false });

  const REQUIRED_BLINKS = 3; // Updated required blinks limit

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Eye Aspect Ratio (EAR) Calculation function for Blink detection
  const calculateEAR = (landmarks, eyeIndices) => {
    const p1 = landmarks[eyeIndices[0]];
    const p2 = landmarks[eyeIndices[1]];
    const p3 = landmarks[eyeIndices[2]];
    const p4 = landmarks[eyeIndices[3]];
    const p5 = landmarks[eyeIndices[4]];
    const p6 = landmarks[eyeIndices[5]];

    const vertical1 = Math.hypot(p2.x - p6.x, p2.y - p6.y);
    const vertical2 = Math.hypot(p3.x - p5.x, p3.y - p5.y);
    const horizontal = Math.hypot(p1.x - p4.x, p1.y - p4.y);

    return (vertical1 + vertical2) / (2.0 * horizontal);
  };

  // Safely stop video feed and tracking engine
  const stopCamera = useCallback(() => {
    if (cameraInstanceRef.current) {
      cameraInstanceRef.current.stop();
      cameraInstanceRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setBlinkCount(0);
    setIsLiveVerified(false);
  }, []);

  // Start Webcam & initialize MediaPipe FaceMesh
  const startCamera = async () => {
    setError('');
    setBlinkCount(0);
    setIsLiveVerified(false);

    try {
      const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });

      // MediaPipe FaceMesh landmark indices for left and right eyes
      const LEFT_EYE = [362, 385, 387, 263, 373, 380];
      const RIGHT_EYE = [33, 160, 158, 133, 153, 144];

      faceMesh.onResults((results) => {
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
          return;
        }

        const landmarks = results.multiFaceLandmarks[0];
        const leftEAR = calculateEAR(landmarks, LEFT_EYE);
        const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
        const avgEAR = (leftEAR + rightEAR) / 2.0;

        // EAR Threshold < 0.21 indicates closed eye (blink state)
        if (avgEAR < 0.21) {
          earHistoryRef.current.eyeClosed = true;
        } else if (avgEAR > 0.25 && earHistoryRef.current.eyeClosed) {
          earHistoryRef.current.eyeClosed = false;

          setBlinkCount((prev) => {
            const updated = prev + 1;
            if (updated >= REQUIRED_BLINKS) {
              setIsLiveVerified(true);
            }
            return updated;
          });
        }
      });

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await faceMesh.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });

        cameraInstanceRef.current = camera;
        await camera.start();
        setCameraActive(true);
      }
    } catch (err) {
      setError('Unable to access camera or initialize liveness detector.');
    }
  };

  useEffect(() => {
    if (authMethod === 'face') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [authMethod, stopCamera]);

  const toggleAuthMethod = (method) => {
    if (method !== authMethod) {
      stopCamera();
      setAuthMethod(method);
      setError('');
    }
  };

  // 1. Password Login Handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(formData);
      if (data.success || data.token) {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        onLoginSuccess(data);
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  // 2. Face Login Handler (Requires Liveness Verification)
  const handleFaceScanAndSubmit = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    if (!isLiveVerified) {
      setError('Verification incomplete. Please make sure your face is visible and try again.');
      return;
    }

    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) {
      setError('Camera feed is initializing. Please wait a second and retry.');
      return;
    }

    setError('');
    setLoading(true);

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageBase64 = canvas.toDataURL('image/jpeg', 0.85);

    try {
      const data = await loginWithFace(imageBase64, isLiveVerified);
      if (data.success) {
        stopCamera();
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        onLoginSuccess(data);
      }
    } catch (err) {
      setError(err.message || 'Face recognition failed. Ensure clear lighting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm bg-slate-800/90 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-center mb-1 bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
          Welcome Back
        </h1>

        {/* Auth Toggle Buttons */}
        <div className="flex rounded-xl bg-slate-900/60 p-1 mb-4 mt-3 border border-slate-700/50">
          <button
            type="button"
            onClick={() => toggleAuthMethod('password')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              authMethod === 'password'
                ? 'bg-slate-700 text-slate-100 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => toggleAuthMethod('face')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              authMethod === 'face'
                ? 'bg-slate-700 text-slate-100 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Face ID
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center flex items-center justify-center gap-2">
            <span>🙈</span> {error}
          </div>
        )}

        {/* Password Form */}
        {authMethod === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-pink-500/60 rounded-xl text-sm focus:outline-none text-slate-100 transition-all placeholder:text-slate-600"
                placeholder="Username"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-3.5 pr-12 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-pink-500/60 rounded-xl text-sm focus:outline-none text-slate-100 transition-all placeholder:text-slate-600"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 px-2 py-1 text-lg hover:scale-110 active:scale-95 transition-transform rounded-lg select-none"
                >
                  {showPassword ? '🐵' : '🙈'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-pink-500/10 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In ✨'}
            </button>
          </form>
        ) : (
          /* Face ID View */
          <div className="space-y-4 text-center">
            <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />

              {/* Scanning HUD Overlay */}
              {cameraActive && (
                <div className="absolute inset-0 border-2 border-pink-500/30 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border border-dashed border-pink-400/60 animate-[spin_10s_linear_infinite]" />
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <button
              type="button"
              onClick={handleFaceScanAndSubmit}
              disabled={loading || !cameraActive}
              className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Verifying Face...' : 'Verify & Unlock 📸'}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-700/40 text-center">
          <p className="text-[11px] text-slate-500 italic">
            Built for growth, step by step ❤️
          </p>
        </div>
      </div>
    </div>
  );
}