import React, { useState, useEffect, useRef } from 'react';

// Mouse ki position track karne ke liye custom hook
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

// Layout component
export default function Layout({ children, viewKey }) {
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
        {/* 'key' se hum view change par animation ko dobara trigger karte hain */}
        <div key={viewKey} className="animate-fade-in">
          {children}
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

