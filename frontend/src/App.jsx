// App.jsx (Corrected)

import React, { useState } from 'react';
import Layout from './components/Layout.jsx';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import CreateVaultScreen from './components/CreateVaultScreen.jsx';
import OpenVaultScreen from './components/OpenVaultScreen.jsx';
import VaultPage from './components/voult/VaultPage.jsx';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('welcome');

  const handleGoToCreate = () => setCurrentView('create');
  const handleGoToOpen = () => setCurrentView('open');
  const handleGoBackToWelcome = () => setCurrentView('welcome');

  const handleCreateVaultSubmit = (formData) => {
    console.log("Creating new vault with data:", formData);
    setCurrentView('vault');
  };
  
  const handleOpenVaultSubmit = (formData) => {
    console.log("Opening vault with data:", formData);
    alert("Password check karne ka logic yahan aayega.");
    // Testing ke liye, password submit karne par vault khol dete hain
    setCurrentView('vault'); 
  };

  // --- YAHAN HAI SABSE IMPORTANT CHANGE ---
  // Agar current view 'vault' hai, to VaultPage ko seedhe return karo, bina Layout ke.
  if (currentView === 'vault') {
    return <VaultPage />;
  }

  // Baaki sabhi views ('welcome', 'create', 'open') ke liye, Layout ka istemal karo.
  return (
    <Layout viewKey={currentView}>
      {currentView === 'welcome' && (
        <WelcomeScreen 
          onCreateClick={handleGoToCreate}
          onOpenClick={handleGoToOpen} 
        />
      )}
      {currentView === 'create' && (
        <CreateVaultScreen 
          onBackClick={handleGoBackToWelcome}
          onFormSubmit={handleCreateVaultSubmit}
        />
      )}
      {currentView === 'open' && (
        <OpenVaultScreen 
          onBackClick={handleGoBackToWelcome}
          onFormSubmit={handleOpenVaultSubmit}
        />
      )}
      {/* VaultPage wala block yahan se hata diya gaya hai */}
    </Layout>
  );
}

export default App;