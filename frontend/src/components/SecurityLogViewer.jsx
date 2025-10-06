import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

// This component is designed to be embedded directly into your main vault screen.
export default function SecurityLogViewer() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the security logs from the backend when the component loads.
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const fetchedLogs = await window.api.getSecurityLogs();
        setLogs(fetchedLogs);
      } catch (error) {
        console.error("Failed to fetch security logs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []); // The empty dependency array ensures this runs only once.

  return (
    <div className="p-6 h-full flex flex-col bg-slate-900 text-white">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
        <ShieldAlert className="text-yellow-400" size={28} />
        <h2 className="text-2xl font-bold">Security Alerts</h2>
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-slate-400 text-lg">Loading security logs...</p>
          </div>
        ) : logs.length === 0 ? (
          // Displayed when no intrusion attempts have been logged.
          <div className="text-center flex flex-col items-center justify-center h-full text-slate-400">
            <ShieldAlert className="mx-auto text-green-500 mb-4" size={52} />
            <p className="text-xl font-semibold text-slate-300">No Unauthorized Attempts Found</p>
            <p>Your vault appears to be secure.</p>
          </div>
        ) : (
          // Grid to display all the captured intruder images.
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden transform hover:-translate-y-1 transition-transform duration-200 shadow-lg"
              >
                <img
                  src={`data:image/jpeg;base64,${log.imageData}`}
                  alt={`Intrusion attempt at ${log.timestamp}`}
                  className="w-full h-48 object-cover bg-slate-700"
                />
                <div className="p-3 bg-slate-800/50">
                  <p className="text-sm font-semibold text-white">Attempt Detected</p>
                  <p className="text-xs text-slate-400">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

