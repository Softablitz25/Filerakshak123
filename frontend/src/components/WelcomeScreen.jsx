import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function WelcomeScreen({ onCreateClick, onOpenClick }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600/10 ring-2 ring-blue-500/50">
          <ShieldCheck size={40} className="text-blue-400" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-3">FileRakshak</h1>
      <p className="text-slate-400 text-lg mb-10">
        The last file vault you'll ever need. Secure, simple, and yours.
      </p>
      <div className="flex flex-col gap-4">
          <button onClick={onCreateClick} className="action-button primary-button">
              <span className="flex items-center justify-center gap-2">Create New Vault <ArrowRight size={18}/></span>
          </button>
          <button onClick={onOpenClick} className="action-button secondary-button">
              <span className="flex items-center justify-center gap-2">Open Existing Vault</span>
          </button>
      </div>
    </div>
  );
}

