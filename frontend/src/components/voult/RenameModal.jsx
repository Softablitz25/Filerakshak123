import React, { useState, useEffect } from "react";
import { FileEdit } from "lucide-react";

export default function RenameModal({ isOpen, onClose, onSubmit, currentName }) {
  const [newName, setNewName] = useState(currentName);
  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
    }
  }, [isOpen, currentName]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newName && newName.trim() !== "") {
      onSubmit(newName);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl p-8 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()} // Modal ke andar click karne se band na ho
      >
        <div className="flex items-center gap-3 mb-6">
            <FileEdit size={24} className="text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Rename File</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="fileName" className="text-sm text-slate-400 mb-2 block">
            Enter new name for the file
          </label>
          <input
            id="fileName"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 text-slate-200 outline-none border-2 border-slate-700 focus:border-blue-500 transition-all"
            autoFocus
          />
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-slate-700/80 text-slate-300 hover:bg-slate-600/80 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-lg shadow-blue-600/20 transition-all"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}