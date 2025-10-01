import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';

// Helper component to keep the form inputs consistent
const InputWrapper = ({ children, icon }) => (
  <div className="relative flex items-center">
    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
    {children}
  </div>
);

export default function OpenVaultScreen({ onBackClick, onFormSubmit }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass the collected password up to the App.jsx component
    onFormSubmit({ password });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-white mb-8">Open Your Vault</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Password Input */}
        <InputWrapper icon={<Lock size={18} />}>
          <input 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"} 
            placeholder="Enter Password" 
            required 
            className="input-field pr-10" 
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </InputWrapper>
        
        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onBackClick} className="action-button secondary-button">
            <span className="flex items-center justify-center gap-2"><ArrowLeft size={18} /> Back</span>
          </button>
          <button type="submit" className="action-button primary-button">
            <span className="flex items-center justify-center gap-2">Unlock Vault <ArrowRight size={18} /></span>
          </button>
        </div>
      </form>
    </div>
  );
}

