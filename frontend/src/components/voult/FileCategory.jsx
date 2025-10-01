import React, { useState } from 'react'; // useState ko import karein
import { Plus, FolderPlus } from 'lucide-react';

// Naye modal ko import karein
import CreateFolderModal from './CreateFolderModal';

export default function FileCategory({ categoryName }) {
  // Step 1: Ek state banayein jo yaad rakhega ki modal khula hai ya band
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Naye modal ko yahan daalein */}
      <CreateFolderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* Top bar with buttons */}
      <div className="flex items-center justify-end mb-4 gap-3">
        {/* Step 2: Button ke click par modal ko open karein */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition-colors duration-200"
        >
          <FolderPlus size={18} />
          Create Folder
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-semibold transition-colors duration-200">
          <Plus size={18} />
          Upload File
        </button>
      </div>

      {/* Grid jahan files aur folders dikhenge */}
      <div className="flex-grow p-4 bg-gray-900/50 rounded-lg">
        <p className="text-gray-500 text-center mt-10">
          No {categoryName} found. Upload a file or create a new folder.
        </p>
      </div>
    </div>
  );
}