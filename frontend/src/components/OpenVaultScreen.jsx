// frontend/src/components/OpenVaultScreen.jsx

import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';

const InputWrapper = ({ children, icon }) => (
  <div className="relative flex items-center">
    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
    {children}
  </div>
);

export default function OpenVaultScreen({ onBackClick, onFormSubmit, onForgotPasswordClick }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [error, setError] = useState('');
  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    let timer;
    if (isLocked && lockoutTimer > 0) {
      timer = setInterval(() => setLockoutTimer(t => t - 1), 1000);
    } else if (lockoutTimer === 0 && isLocked) {
      setIsLocked(false);
      setAttempts(0);
      setError('');
    }
    return () => clearInterval(timer);
  }, [isLocked, lockoutTimer]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) {
      setError('');
    }
  };

  // YAHAN BADLAV KIYA GAYA HAI - YEH FINAL CODE HAI
  const handleIntrusion = async () => {
    try {
      // 1. Webcam access ka request karein
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  
      const video = document.createElement('video');
      video.srcObject = stream;
      
      // Jab video SACH MEIN chalna shuru ho, tab image capture karein
      video.onplaying = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Canvas par video ka current frame draw karein
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Image ko backend mein save karne ke liye bhejein
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        window.api.saveIntruderImage(imageDataUrl);
        
        // Turant camera ko band karein
        stream.getTracks().forEach(track => track.stop());
        console.log('Intruder image captured and camera stopped.');
      };
      
      // Video play karein, jisse 'onplaying' event trigger hoga
      video.play();

    } catch (err) {
      console.error("Webcam access denied or failed:", err);
      // User ko batayein ki camera access nahi ho paya
      toast.error("Could not access the camera. Please ensure you have a webcam and have granted permission to this app.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    const isMatch = await window.api.checkPassword(password);

    if (isMatch) {
      onFormSubmit(password);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPassword('');

      if (newAttempts >= MAX_ATTEMPTS) {
        handleIntrusion(); // function call to capture  image
        setError(`Too many wrong password attempts! Wait for ${30} seconds.`);
        setIsLocked(true);
        setLockoutTimer(30);
      } else {
        setError(`Wrong Password! You have ${MAX_ATTEMPTS - newAttempts} attempts left.`);
      }
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-white mb-8">Open Your Vault</h2>
      {isLocked ? (
        <div className="text-center p-4 rounded-lg bg-red-900/50 border border-red-500">
          <ShieldAlert className="mx-auto mb-2 text-red-400" size={32} />
          <p className="font-bold text-lg text-white">Too Many Failed Attempts</p>
          <p className="text-red-300">Please try again in <span className="font-bold text-xl">{lockoutTimer}</span> seconds.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <InputWrapper icon={<Lock size={18} />}>
              <input
                value={password}
                onChange={handlePasswordChange}
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                required
                className="input-field pr-10"
                autoFocus
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </InputWrapper>
            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
          </div>
          {!isLocked && (
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={onForgotPasswordClick}
                className="relative text-sm font-medium text-slate-400 
                 hover:text-blue-400 transition-colors 
                 after:content-[''] after:block after:w-0 after:h-[1.5px] 
                 after:bg-blue-400 after:transition-all after:duration-300 
                 hover:after:w-full after:mx-auto"
              >
                Forgot Password ?
              </button>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onBackClick} className="action-button secondary-button">
              <span className="flex items-center justify-center gap-2"><ArrowLeft size={18} /> Back</span>
            </button>
            <button type="submit" className="action-button primary-button">
              <span className="flex items-center justify-center gap-2">Unlock Vault <ArrowRight size={18} /></span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}