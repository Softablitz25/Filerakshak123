import React, { useState, useRef } from "react"; // useRef ko import karein
import {
  ShieldCheck,
  Image,
  FileText,
  FileArchive,
  UploadCloud,
  File,
  X,
  Search,
  LayoutGrid,
} from "lucide-react";

export default function VaultPage() {
  const [activeCategory, setActiveCategory] = useState("Photos");
  
  // 1. File input ke liye ek ref banayein
  const fileInputRef = useRef(null);

  const categories = [
    { name: "Photos", icon: Image, color: "text-blue-400" },
    { name: "PDFs", icon: FileText, color: "text-red-400" },
    { name: "Other Files", icon: FileArchive, color: "text-yellow-400" },
  ];

  const files = {
    Photos: [
      { name: "Vacation-01.jpg", size: "4.2 MB" },
      { name: "Family-Reunion.png", size: "8.7 MB" },
      { name: "Beach-Sunset.jpeg", size: "3.1 MB" },
      { name: "Mountains.png", size: "6.5 MB" },
    ],
    PDFs: [
      { name: "My-Resume.pdf", size: "2.1 MB" },
      { name: "Project-Report-Final.pdf", size: "5.6 MB" },
    ],
    "Other Files": [
      { name: "Project-Assets.zip", size: "124 MB" },
      { name: "Personal-Notes.docx", size: "1.5 MB" },
    ],
  };

  const currentFiles = files[activeCategory] || [];

  // 2. 'Browse' par click hone par yeh function file input ko trigger karega
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  // 3. File select hone par yeh function chalega
  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles.length > 0) {
      console.log("Selected Files:", selectedFiles);
      // Yahan aap file upload karne ka logic likh sakte hain
      // Jaise ki files ko state mein save karna ya server par bhejna
      alert(`${selectedFiles.length} file(s) selected! Check the console.`);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* --- Sidebar for Navigation --- */}
      <aside className="w-64 flex-shrink-0 bg-slate-900/70 border-r border-slate-800 p-6 flex-col hidden md:flex">
        <div className="flex items-center gap-3 mb-10">
          <ShieldCheck size={32} className="text-green-400" />
          <h1 className="text-2xl font-bold tracking-wide">FileRakshak</h1>
        </div>
        
        <h3 className="text-sm uppercase text-slate-400 mb-4 tracking-wider">
          Categories
        </h3>
        <div className="flex flex-col gap-2">
          {categories.map(({ name, icon: Icon, color }) => (
            <button
              key={name}
              onClick={() => setActiveCategory(name)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                activeCategory === name
                  ? "bg-blue-600/30 text-white border border-blue-500 shadow-md"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Icon size={20} className={color} />
              <span className="font-medium">{name}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-8 py-4 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="flex items-center gap-3">
             <LayoutGrid size={20} className="text-slate-400" />
             <h2 className="text-xl font-semibold tracking-wide">
               {activeCategory}
             </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search files..."
                className="pl-10 pr-4 py-2 rounded-lg bg-slate-800/80 text-slate-200 text-sm outline-none border border-slate-700 focus:border-blue-500 w-64 transition-all"
              />
            </div>
            <button className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all font-semibold shadow-sm hover:shadow-lg hover:shadow-blue-600/30">
              Upload
            </button>
          </div>
        </header>

        {/* --- File Grid --- */}
        <section className="flex-1 p-8 overflow-y-auto">
          {/* Ek hidden file input add karein */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple // Ek se zyada file select karne ke liye
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            
            {currentFiles.map((file, index) => (
              <div
                key={index}
                className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all group relative"
              >
                <div className="flex justify-between items-center mb-4">
                  <File size={32} className="text-slate-400" />
                  <button className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity absolute top-4 right-4">
                    <X size={16} />
                  </button>
                </div>
                <p className="text-sm font-medium text-slate-200 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">{file.size}</p>
              </div>
            ))}

            {/* Upload Drop Area Card - onClick event add karein */}
            <div 
              onClick={handleBrowseClick}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-slate-800/40 transition-all rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer group"
            >
              <UploadCloud size={32} className="text-slate-500 mb-2 group-hover:text-blue-400 transition-colors" />
              <p className="text-slate-300 text-sm">Drop files here</p>
              <p className="text-blue-400 font-semibold text-sm">or Browse</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}