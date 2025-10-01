// CreateVaultScreen.jsx (Updated to match App.jsx logic)

import React, { useState } from 'react';
// Humne useNavigate ko hata diya hai, kyunki App.jsx iska istemal nahi kar raha
import { Lock, KeyRound, HelpCircle, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';

const InputWrapper = ({ children, icon }) => (
  <div className="relative flex items-center">
    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
    {children}
  </div>
);

// Humne 'onFormSubmit' prop ko wapas le liya hai
export default function CreateVaultScreen({ onBackClick, onFormSubmit }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // --- YAHAN BADLAV HUA HAI ---

    // 1. Password ko backend mein save karwayein
    window.api.savePassword(password);
    console.log("Password save karne ki request backend ko bhej di gayi hai.");

    // 2. Ab App.jsx ko batayein ki form submit ho gaya hai
    // Yeh App.jsx ke handleCreateVaultSubmit function ko call karega
    onFormSubmit({ password, securityQuestion, securityAnswer });
  };

  // Neeche ka JSX code bilkul same rahega
  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-white mb-8">Create Your Vault</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ... baaki ka form ... */}
        <InputWrapper icon={<Lock size={18} />}><input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Create Password" required className="input-field pr-10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></InputWrapper>
        <InputWrapper icon={<Lock size={18} />}><input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" required className="input-field pr-10" /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></InputWrapper>
        <InputWrapper icon={<HelpCircle size={18} />}><select value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)} required className="input-field appearance-none"><option value="" className="bg-slate-800">Select a security question...</option><option value="pet" className="bg-slate-800">What was your first pet's name?</option><option value="city" className="bg-slate-800">In what city were you born?</option><option value="mother" className="bg-slate-800">What is your mother's maiden name?</option></select></InputWrapper>
        <InputWrapper icon={<KeyRound size={18} />}><input value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} type="text" placeholder="Your Answer" required className="input-field" /></InputWrapper>
        <div className="flex gap-4 pt-4"><button type="button" onClick={onBackClick} className="action-button secondary-button"><span className="flex items-center justify-center gap-2"><ArrowLeft size={18} /> Back</span></button><button type="submit" className="action-button primary-button"><span className="flex items-center justify-center gap-2">Continue <ArrowRight size={18} /></span></button></div>
      </form>
    </div>
  );
}