import React from 'react';
import { X, FolderPlus } from 'lucide-react';

// 'isOpen' se pata chalega ki popup dikhana hai ya nahi.
// 'onClose' function popup ko band karega.
export default function CreateFolderModal({ isOpen, onClose }) {
  // Agar 'isOpen' false hai, toh kuch bhi nahi dikhega (null).
  if (!isOpen) {
    return null;
  }

  return (
    // Main container (yeh poori screen ko cover karega)
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      {/* Popup ka content box */}
      <div className="bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-700">
        
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FolderPlus className="text-blue-400" size={24} />
            <h3 className="text-xl font-semibold text-white">Create New Folder</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form to enter folder name */}
        <div className="mt-4">
          <label htmlFor="folderName" className="text-sm text-gray-300 mb-2 block">
            Folder Name
          </label>
          <input
            type="text"
            id="folderName"
            placeholder="e.g., Family Trip"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons (Cancel and Create) */}
        <div className="flex justify-end gap-4 mt-6">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors"
          >
            Cancel
          </button>
          <button className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}