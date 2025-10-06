// VaultPage.jsx (Button Removed)

import React, { useState, useEffect } from "react";
import {
  ShieldCheck, Image, FileText, FileArchive, UploadCloud, File,
  LogOut, MoreVertical, ArrowUpFromLine, FolderPlus,
  FileEdit, Folder, ArrowLeft, ShieldAlert
} from "lucide-react";
import CreateFolderModal from './CreateFolderModal';
import RenameModal from "./RenameModal";
import SecurityLogViewer from "../SecurityLogViewer";

const FilePreview = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPreview = async () => {
      setIsLoading(true);
      const isImage = file.type === 'file' && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(file.name.split('.').pop().toLowerCase());
      
      if (isImage) {
        const url = await window.api.getFileAsDataUrl(file.path);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
      setIsLoading(false);
    };
    loadPreview();
  }, [file]);

  if (isLoading) {
    return <div className="w-full h-24 bg-slate-800 rounded-md mb-4 animate-pulse"></div>;
  }
  
  if (previewUrl) {
    return <img src={previewUrl} alt={file.name} className="w-full h-24 object-cover rounded-md mb-4" />;
  }
  
  return (
    <div className="flex justify-between items-start mb-4">
      {file.type === 'folder'
        ? <Folder size={32} className="text-yellow-400" />
        : <File size={32} className="text-slate-400" />}
    </div>
  );
};

export default function VaultPage({ onLockVault }) {
  const [activeCategory, setActiveCategory] = useState("Photos");
  const [currentParentId, setCurrentParentId] = useState("Photos");
  const [files, setFiles] = useState({ Photos: [], PDFs: [], "Other Files": [] });
  const [itemsToDisplay, setItemsToDisplay] = useState([]);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState(null);

  const loadVaultData = async () => {
    const data = await window.api.getVaultData();
    if (data) setFiles(data);
  };

  useEffect(() => { loadVaultData(); }, []);
  useEffect(() => { setCurrentParentId(activeCategory); }, [activeCategory]);
  useEffect(() => {
    if (files && files[activeCategory]) {
        const filteredItems = files[activeCategory].filter(item => item.parentId === currentParentId);
        setItemsToDisplay(filteredItems);
    }
  }, [files, activeCategory, currentParentId]);

  const handleCreateFolder = async (folderName) => {
    const result = await window.api.createFolder({ category: activeCategory, folderName, parentId: currentParentId });
    if (result.success) {
      alert(`Folder "${folderName}" created!`);
      loadVaultData();
    } else {
      alert(`Error: ${result.message}`);
    }
    setIsCreateFolderModalOpen(false);
  };

  const handleBrowseClick = async () => {
    const result = await window.api.uploadFile({ 
        parentId: currentParentId,
        category: activeCategory
    });
    if (result.message) {
      alert(result.message);
    }
    if (result.success) {
      loadVaultData();
    }
  };

  const goBack = () => {
    if (currentParentId === activeCategory) return;
    const currentFolder = files[activeCategory].find(item => item.id === currentParentId);
    if (currentFolder && currentFolder.parentId) setCurrentParentId(currentFolder.parentId);
  };

  const handleItemClick = async (item) => {
    if (item.type === "folder") {
      setCurrentParentId(item.id);
    } else {
      const openResult = await window.api.openFile(item.path);
      if (!openResult.success) alert(`Could not open file: ${openResult.message}`);
    }
  };

  const handleMenuClick = (index, event) => {
    event.stopPropagation();
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const handleAction = async (action, item, event) => {
    event.stopPropagation();
    setOpenMenuIndex(null);
    if (action === 'rename') {
      setFileToRename(item);
      setIsRenameModalOpen(true);
      return;
    }
    if (action === 'export') {
        const result = await window.api.exportFile(item);
        if (result.success) {
          alert(`"${item.name}" has been exported and removed.`);
          loadVaultData(); 
        } else if (result.message) {
          alert(result.message);
        }
    }
  };

  const submitRename = async (newName) => {
    if (newName && fileToRename && newName.trim() !== "" && newName !== fileToRename.name) {
      const result = await window.api.renameFile(fileToRename, newName);
      if (result.success) {
        alert(`Item renamed to "${newName}"`);
        loadVaultData();
      } else {
        alert(`Error: ${result.message}`);
      }
    }
    setIsRenameModalOpen(false);
    setFileToRename(null);
  };
  
  const categories = [
    { name: "Photos", icon: Image, color: "text-blue-400" },
    { name: "PDFs", icon: FileText, color: "text-red-400" },
    { name: "Other Files", icon: FileArchive, color: "text-yellow-400" },
  ];

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-white font-sans overflow-hidden" onClick={() => setOpenMenuIndex(null)}>
      <CreateFolderModal isOpen={isCreateFolderModalOpen} onClose={() => setIsCreateFolderModalOpen(false)} onSubmit={handleCreateFolder} />
      <RenameModal isOpen={isRenameModalOpen} onClose={() => setIsRenameModalOpen(false)} onSubmit={submitRename} currentName={fileToRename?.name || ''} />
      
      <aside className="w-64 flex-shrink-0 bg-slate-900/70 border-r border-slate-800 p-6 flex-col hidden md:flex">
        <div className="flex items-center gap-3 mb-10"><ShieldCheck size={32} className="text-green-400" /><h1 className="text-2xl font-bold tracking-wide">FileRakshak</h1></div>
        <h3 className="text-sm uppercase text-slate-400 mb-4 tracking-wider">Categories</h3>
        <div className="flex flex-col gap-2">
          {categories.map(({ name, icon: Icon, color }) => (
            <button key={name} onClick={() => setActiveCategory(name)} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${activeCategory === name ? "bg-blue-600/30 text-white border border-blue-500 shadow-md" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"}`}><Icon size={20} className={color} /><span className="font-medium">{name}</span></button>
          ))}
        </div>
        <div className="mt-auto pt-4 border-t border-slate-700">
           <button onClick={() => setActiveCategory('Security')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${activeCategory === 'Security' ? "bg-yellow-600/30 text-white border border-yellow-500 shadow-md" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"}`}>
              <ShieldAlert size={20} className="text-yellow-400" />
              <span className="font-medium">Security Logs</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ✅ HEADER SECTION SE BUTTON HATA DIYA GAYA HAI */}
        {activeCategory === 'Security' ? (
          <SecurityLogViewer />
        ) : (
          <>
        <header className="flex items-center justify-between px-8 py-4 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="flex items-center gap-4">
            {currentParentId !== activeCategory && <button onClick={goBack} className="p-2 rounded-lg hover:bg-slate-800 transition-colors"><ArrowLeft size={20} className="text-slate-300" /></button>}
            <h2 className="text-xl font-semibold tracking-wide">{activeCategory}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsCreateFolderModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white transition-all font-semibold"><FolderPlus size={18} /> New Folder</button>
            <button onClick={onLockVault} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/80 text-white hover:bg-red-700/80 transition-all font-semibold"><LogOut size={18} /> Lock Vault</button>
          </div>
        </header>

        <section className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {itemsToDisplay.map((item, index) => (
              <div key={item.id} onClick={() => handleItemClick(item)} className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 hover:border-blue-500 transition-all group relative cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <FilePreview file={item} />
                  </div>
                  <div className="relative z-10">
                    <button onClick={(e) => handleMenuClick(index, e)} className="p-1 -mr-2 -mt-2 rounded-full text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"><MoreVertical size={18} /></button>
                    {openMenuIndex === index && (
                      <div className="absolute right-0 mt-2 w-44 rounded-lg bg-slate-800 shadow-lg border border-slate-700">
                        <button onClick={(e) => handleAction('rename', item, e)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-slate-300 hover:bg-slate-700/70 rounded-t-lg transition"><FileEdit size={16} className="text-blue-400" /><span>Rename</span></button>
                        {item.type !== 'folder' && 
                          <button onClick={(e) => handleAction('export', item, e)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-slate-300 hover:bg-slate-700/70 rounded-b-lg transition"><ArrowUpFromLine size={16} className="text-green-400" /><span>Export</span></button>
                        }
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-200 truncate" title={item.name}>{item.name}</p>
                {item.type !== "folder" && <p className="text-xs text-slate-500 mt-1">{item.size}</p>}
              </div>
            ))}
            <div onClick={handleBrowseClick} className="border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-slate-800/40 transition-all rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer group min-h-[200px]">
              <UploadCloud size={32} className="text-slate-500 mb-2 group-hover:text-blue-400" />
              <p className="text-slate-300 text-sm">Add files to this folder</p>
              <p className="text-blue-400 font-semibold text-sm">or Browse</p>
            </div>
          </div>
        </section>
        </> 
        )}
      </main>
    </div>
  );
}