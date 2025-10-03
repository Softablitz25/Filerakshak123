// VaultPage.jsx (FINAL CODE)

import React, { useState, useEffect } from "react";
import {
  ShieldCheck, Image, FileText, FileArchive, UploadCloud, File, X,
  Search, LayoutGrid, LogOut, MoreVertical, ArrowUpFromLine, FolderPlus
} from "lucide-react";
import CreateFolderModal from './CreateFolderModal';

export default function VaultPage({ onLockVault }) {
  const [activeCategory, setActiveCategory] = useState("Photos");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [files, setFiles] = useState({ Photos: [], PDFs: [], "Other Files": [] });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadVaultData = async () => {
      const data = await window.api.getVaultData();
      if (data) setFiles(data);
    };
    loadVaultData();
  }, []);

  const categories = [
    { name: "Photos", icon: Image, color: "text-blue-400" },
    { name: "PDFs", icon: FileText, color: "text-red-400" },
    { name: "Other Files", icon: FileArchive, color: "text-yellow-400" },
  ];

  const currentFiles = files[activeCategory] || [];

  const handleBrowseClick = async () => {
    const result = await window.api.uploadFile();
    if (result.success) {
      const data = await window.api.getVaultData();
      if (data) setFiles(data);
      alert("File(s) moved to vault successfully!");
    }
  };

  const handleFileClick = async (file) => {
    const openResult = await window.api.openFile(file.path);
    if (!openResult.success) alert(`Could not open file: ${openResult.message}`);
  };

  const handleMenuClick = (index, event) => {
    event.stopPropagation();
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };
  
  const handleExport = async (file, event) => {
    event.stopPropagation();
    setOpenMenuIndex(null);
    const result = await window.api.exportFile(file);
    if (result.success) {
      alert(`"${file.name}" has been exported and removed from the vault.`);
      const data = await window.api.getVaultData();
      if (data) setFiles(data);
    } else if (result.message) {
      alert(result.message);
    }
  };

  const handleDelete = async (file, event) => {
    event.stopPropagation();
    setOpenMenuIndex(null);
    const result = await window.api.deleteFile(file);
    if (result.success) {
      const data = await window.api.getVaultData();
      if (data) setFiles(data);
      alert(`"${file.name}" has been deleted.`);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-white font-sans overflow-hidden" onClick={() => setOpenMenuIndex(null)}>
      <CreateFolderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-900/70 border-r border-slate-800 p-6 flex-col hidden md:flex">
        <div className="flex items-center gap-3 mb-10"><ShieldCheck size={32} className="text-green-400" /><h1 className="text-2xl font-bold tracking-wide">FileRakshak</h1></div>
        <h3 className="text-sm uppercase text-slate-400 mb-4 tracking-wider">Categories</h3>
        <div className="flex flex-col gap-2">
          {categories.map(({ name, icon: Icon, color }) => (
            <button key={name} onClick={() => setActiveCategory(name)} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${ activeCategory === name ? "bg-blue-600/30 text-white border border-blue-500 shadow-md" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200" }`}><Icon size={20} className={color} /><span className="font-medium">{name}</span></button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-8 py-4 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="flex items-center gap-3"><LayoutGrid size={20} className="text-slate-400" /><h2 className="text-xl font-semibold tracking-wide">{activeCategory}</h2></div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block"><Search size={18} className="absolute left-3 top-2.5 text-slate-400" /><input type="text" placeholder="Search files..." className="pl-10 pr-4 py-2 rounded-lg bg-slate-800/80 text-slate-200 text-sm outline-none border border-slate-700 focus:border-blue-500 w-64 transition-all" /></div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white transition-all font-semibold"><FolderPlus size={18} /> New Folder</button>
            <button onClick={onLockVault} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/80 text-white hover:bg-red-700/80 transition-all font-semibold"><LogOut size={18} /> Lock Vault</button>
          </div>
        </header>

        {/* File Grid */}
        <section className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {currentFiles.map((file, index) => (
              <div key={file.path} onClick={() => handleFileClick(file)} className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all group relative cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <File size={32} className="text-slate-400" />
                  <div className="relative">
                    <button onClick={(e) => handleMenuClick(index, e)} className="p-1 rounded-full text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"><MoreVertical size={18} /></button>
                    {openMenuIndex === index && (
                      <div className="absolute top-8 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 w-40 overflow-hidden">
                        <button onClick={(e) => handleExport(file, e)} className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50"><ArrowUpFromLine size={16} /> Export File</button>
                        <button onClick={(e) => handleDelete(file, e)} className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700/50"><X size={16} /> Delete File</button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-200 truncate" title={file.name}>{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">{file.size}</p>
              </div>
            ))}
            <div onClick={handleBrowseClick} className="border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-slate-800/40 transition-all rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer group">
              <UploadCloud size={32} className="text-slate-500 mb-2 group-hover:text-blue-400" />
              <p className="text-slate-300 text-sm">Drop files here</p>
              <p className="text-blue-400 font-semibold text-sm">or Browse</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}