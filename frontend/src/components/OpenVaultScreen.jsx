// OpenVaultScreen.jsx (FINAL CODE)

import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';

const InputWrapper = ({ children, icon }) => (
  <div className="relative flex items-center">
    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
    {children}
  </div>
);

export default function OpenVaultScreen({ onBackClick, onFormSubmit }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    let timer;
    if (isLocked && lockoutTimer > 0) {
      timer = setInterval(() => setLockoutTimer(t => t - 1), 1000);
    } else if (lockoutTimer === 0 && isLocked) {
      setIsLocked(false);
      setAttempts(0);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockoutTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    const isMatch = await window.api.checkPassword(password);

    if (isMatch) {
      onFormSubmit({ password });
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPassword('');

      if (newAttempts >= MAX_ATTEMPTS) {
        alert("❌ Bahut baar galat password daal diya! 30 second wait karein.");
        setIsLocked(true);
        setLockoutTimer(30);
      } else {
        alert(`❌ Galat password! Aapke paas ${MAX_ATTEMPTS - newAttempts} attempt(s) bache hain.`);
      }
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-white mb-8">Open Your Vault</h2>
      {isLocked ? (
        <div className="text-center p-4 rounded-lg bg-red-900/50 border border-red-500">
          <ShieldAlert className="mx-auto mb-2 text-red-400" size={32} />
          <p className="font-bold text-lg text-white">Bahut baar galat koshish ki</p>
          <p className="text-red-300">Please <span className="font-bold text-xl">{lockoutTimer}</span> seconds ke baad try karein.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputWrapper icon={<Lock size={18} />}>
            <input 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password" 
              required
              className="input-field pr-10"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </InputWrapper>
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