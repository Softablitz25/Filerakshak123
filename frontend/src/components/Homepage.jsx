import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, KeyRound, HelpCircle, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';

// A custom hook to track mouse position for the shine effect
const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (ev) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return mousePosition;
};

export default function Homepage() {
  // --- LOGIC (UNCHANGED) ---
  const [view, setView] = useState('welcome');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleCreateVaultClick = () => setView('create');
  const handleBackToWelcome = () => setView('welcome');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    alert("Form submitted! (Next step: IPC integration)");
  };
  
  // --- MOUSE TRACKING FOR UI EFFECT ---
  const { x, y } = useMousePosition();
  const cardRef = useRef(null);
  
  const cardStyle = cardRef.current ? {
      '--mouse-x': `${x - cardRef.current.getBoundingClientRect().left}px`,
      '--mouse-y': `${y - cardRef.current.getBoundingClientRect().top}px`,
  } : {};

  return (
    <main className="h-screen w-screen bg-[#111319] flex items-center justify-center p-4 overflow-hidden relative font-sans text-white">
      {/* --- Animated Grid Background --- */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>
      
      {/* --- Main Panel --- */}
      <div
        ref={cardRef}
        style={cardStyle}
        className="card-shine-effect relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-8 md:p-12 shadow-2xl transition-all duration-500"
      >
        {/* We add a `key` here to force React to re-render the div on view change, which re-triggers the CSS animation */}
        <div key={view} className="animate-fade-in">
          {/* == View 1: Welcome Screen == */}
          {view === 'welcome' && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600/10 ring-2 ring-blue-500/50">
                  <ShieldCheck size={40} className="text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-3">FileRakshak</h1>
              <p className="text-slate-400 text-lg mb-10">
                The last file vault you'll ever need. Secure, simple, and yours.
              </p>
              <div className="flex flex-col gap-4">
                  <button onClick={handleCreateVaultClick} className="action-button primary-button">
                      <span className="flex items-center justify-center gap-2">Create New Vault <ArrowRight size={18}/></span>
                  </button>
                  <button className="action-button secondary-button">
                      <span className="flex items-center justify-center gap-2">Open Existing Vault</span>
                  </button>
              </div>
            </div>
          )}

          {/* == View 2: Create Vault For == */}
          {view === 'create' && (
            <div>
              <h2 className="text-3xl font-bold text-center text-white mb-8">Create Your Vault</h2>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <InputWrapper icon={<Lock size={18} />}>
                  <input type={showPassword ? "text" : "password"} placeholder="Create Password" required className="input-field pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </InputWrapper>
                <InputWrapper icon={<Lock size={18} />}>
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" required className="input-field pr-10" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </InputWrapper>
                <InputWrapper icon={<HelpCircle size={18} />}>
                  <select required className="input-field appearance-none">
                    <option value="" className="bg-slate-800">Select a security question...</option>
                    <option value="pet" className="bg-slate-800">What was your first pet's name?</option>
                    <option value="city" className="bg-slate-800">In what city were you born?</option>
                    <option value="mother" className="bg-slate-800">What is your mother's maiden name?</option>
                  </select>
                </InputWrapper>
                <InputWrapper icon={<KeyRound size={18} />}>
                  <input type="text" placeholder="Your Answer" required className="input-field" />
                </InputWrapper>
                <div className="flex gap-4 pt-4">
                  <button onClick={handleBackToWelcome} className="action-button secondary-button">
                    <span className="flex items-center justify-center gap-2"><ArrowLeft size={18} /> Back</span>
                  </button>
                  <button type="submit" className="action-button primary-button">
                    <span className="flex items-center justify-center gap-2">Continue <ArrowRight size={18} /></span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* --- Inline CSS for effects --- */}
      <style jsx>{`
        .card-shine-effect::before {
            content: "";
            position: absolute; left: 0; top: 0;
            width: 100%; height: 100%;
            background: radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), rgba(0, 153, 255, 0.15), transparent 80%);
            border-radius: inherit;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .card-shine-effect:hover::before {
            opacity: 1;
        }
        .input-field {
          background-color: transparent; border: 0;
          border-bottom: 2px solid #334155; /* slate-700 */
          width: 100%; padding: 10px 0 10px 40px; /* space for icon */
          color: white;
          transition: border-color 0.3s;
        }
        .input-field:focus {
          outline: none;
          border-color: #0ea5e9; /* sky-500 */
        }
        
        .action-button {
          position: relative; width: 100%;
          border-radius: 0.5rem; padding-top: 0.75rem; padding-bottom: 0.75rem;
          font-size: 1.125rem; font-weight: 600;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .action-button:hover {
          transform: translateY(-2px);
        }
        .primary-button {
          background-color: #2563eb; /* blue-600 */
          color: white;
        }
        .primary-button:hover {
          box-shadow: 0 0 20px rgba(37, 99, 235, 0.7);
        }
        .secondary-button {
          background-color: #1e293b; /* slate-800 */
          color: #cbd5e1; /* slate-300 */
        }
        .secondary-button:hover {
          background-color: #334155; /* slate-700 */
        }
        
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </main>
  );
}

// Helper component for form inputs with icons
const InputWrapper = ({ children, icon }) => (
    <div className="relative flex items-center">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
        {children}
    </div>
);