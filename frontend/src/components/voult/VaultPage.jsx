import React from 'react';
import { ShieldCheck, Image, FileText, FileArchive } from 'lucide-react';

// Yeh line humne add ki hai (engine ko import kiya)
import FileCategory from './FileCategory';

export default function VaultPage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      {/* Page ka Header */}
      <header className="flex items-center justify-between pb-6 border-b border-gray-700/50 mb-8">
        <div className="flex items-center gap-3">
          <ShieldCheck size={40} className="text-green-400" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider font-serif bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-blue-400 to-purple-400">
            Filerakshak Vault
          </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="space-y-12">
        {/* Photos Section */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <Image size={32} className="text-blue-400" />
            <h2 className="text-2xl font-semibold">Photos</h2>
          </div>
          <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700/50 min-h-[200px]">
            {/* Purane text ki jagah humne yeh component daal diya */}
            <FileCategory categoryName="photos" />
          </div>
        </section>

        {/* PDFs Section */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <FileText size={32} className="text-red-400" />
            <h2 className="text-2xl font-semibold">PDFs</h2>
          </div>
          <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700/50 min-h-[200px]">
            {/* Yahan bhi */}
            <FileCategory categoryName="PDFs" />
          </div>
        </section>

        {/* Other Files Section */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <FileArchive size={32} className="text-yellow-400" />
            <h2 className="text-2xl font-semibold">Other Files</h2>
          </div>
          <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700/50 min-h-[200px]">
            {/* Aur yahan bhi */}
            <FileCategory categoryName="files" />
          </div>
        </section>
      </div>
    </main>
  );
}