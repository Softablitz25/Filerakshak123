import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function Homepage() {
  const handleStart = () => {
    alert("Moving to the main application...");
  };

  return (
    <main className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Floating animated blobs */}
      <div className="absolute top-[-120px] left-[-150px] w-[400px] h-[400px] bg-green-500/30 rounded-full animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] bg-blue-500/30 rounded-full animate-blob animation-delay-4000"></div>
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full animate-blob animation-delay-6000"></div>

      {/* Particle background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/20 rounded-full animate-pulse-slow"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 3}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 text-center p-12 bg-gray-800/40 rounded-3xl shadow-2xl border border-gray-700/50 backdrop-blur-xl max-w-lg mx-auto">
        
        {/* Animated App Icon */}
        <ShieldCheck 
          size={80} 
          className="mx-auto text-green-400 mb-6 animate-bounce-slow hover:scale-110 transition-transform duration-500"
        />

        {/* App Name with gradient animation */}
        <h1 className="text-5xl md:text-6xl font-bold tracking-wider font-serif bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-blue-400 to-purple-400 mb-4 animate-text-gradient">
          Filerakshak
        </h1>

        {/* Description */}
        <p className="text-gray-300 text-lg mb-10 animate-fade-in-up">
          Centralized, secure, and full-flex application to manage your files efficiently.
        </p>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="relative overflow-hidden bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-10 rounded-xl text-xl inline-flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/50 group"
        >
          <span className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300 rounded-xl"></span>
          <span className="relative z-10 flex items-center">
            Start <ArrowRight className="ml-3 w-6 h-6" />
          </span>
        </button>
      </div>

      {/* Tailwind keyframes */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-blob {
          animation: blob 8s infinite;
        }

        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animation-delay-6000 { animation-delay: 6s; }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite;
        }

        @keyframes text-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-text-gradient {
          background-size: 200% 200%;
          animation: text-gradient 5s ease infinite;
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.5s infinite;
        }
      `}</style>
    </main>
  );
}
