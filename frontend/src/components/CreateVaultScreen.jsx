  // CreateVaultScreen.jsx (Conflict Resolved)

  import React, { useState } from 'react';
  import { Lock, KeyRound, HelpCircle, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';

  // Helper component to keep the form inputs consistent
  const InputWrapper = ({ children, icon }) => (
    <div className="relative flex items-center">
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
      {children}
    </div>
  );

  // We are keeping the onFormSubmit prop to communicate with App.jsx
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

      // 1. Password is sent to the backend using the IPC call
      window.api.savePassword({
        password, securityQuestion, securityAnswer,
      });
      console.log("Password save request sent to the backend.");

      // 2. App.jsx is notified that the form submission is complete
      onFormSubmit({ password, securityQuestion, securityAnswer });
    };

    return (
      <div>
        <h2 className="text-3xl font-bold text-center text-white mb-8">Create Your Vault</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Create Password Input */}
          <InputWrapper icon={<Lock size={18} />}>
            <input 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"} 
              placeholder="Create Password" 
              required 
              className="input-field pr-10" 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </InputWrapper>

          {/* Confirm Password Input */}
          <InputWrapper icon={<Lock size={18} />}>
            <input 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Confirm Password" 
              required 
              className="input-field pr-10" 
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </InputWrapper>

          {/* Security Question Select */}
          <InputWrapper icon={<HelpCircle size={18} />}>
            <select 
              value={securityQuestion}
              onChange={(e) => setSecurityQuestion(e.target.value)}
              required 
              className="input-field appearance-none"
            >
              <option value="" className="bg-slate-800">Select a security question...</option>
              <option value="pet" className="bg-slate-800">What was your first pet's name?</option>
              <option value="city" className="bg-slate-800">In what city were you born?</option>
              <option value="mother" className="bg-slate-800">What is your mother's maiden name?</option>
            </select>
          </InputWrapper>

          {/* Security Answer Input */}
          <InputWrapper icon={<KeyRound size={18} />}>
            <input 
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              type="text" 
              placeholder="Your Answer" 
              required 
              className="input-field" 
            />
          </InputWrapper>
          
          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onBackClick} className="action-button secondary-button">
              <span className="flex items-center justify-center gap-2"><ArrowLeft size={18} /> Back</span>
            </button>
            <button type="submit" className="action-button primary-button">
              <span className="flex items-center justify-center gap-2">Continue <ArrowRight size={18} /></span>
            </button>
          </div>
        </form>
      </div>
    );
  }