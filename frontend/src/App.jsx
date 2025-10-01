// App.jsx (Conflict Resolved)

import React, { useState } from 'react';
import Layout from './components/Layout.jsx';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import CreateVaultScreen from './components/CreateVaultScreen.jsx';
import OpenVaultScreen from './components/OpenVaultScreen.jsx';
// VaultPage ko sahi path se import kiya gaya hai
import VaultPage from './components/vault/VaultPage.jsx'; 
import './App.css';

function App() {
  // 'vault' naam ka ek naya view add kiya gaya hai
  const [currentView, setCurrentView] = useState('welcome');

  const handleGoToCreate = () => setCurrentView('create');
  const handleGoToOpen = () => setCurrentView('open');
  const handleGoBackToWelcome = () => setCurrentView('welcome');

  // Yeh function ab vault page par navigate karega
  const handleCreateVaultSubmit = (formData) => {
    console.log("Creating new vault with data:", formData);
    // Password save ho gaya hai (CreateVaultScreen mein), ab bas view badalna hai
    setCurrentView('vault');
  };
  
  const handleOpenVaultSubmit = (formData) => {
    console.log("Opening vault with data:", formData);
    // Yahan hum password check karne ke baad vault par bhejenge (yeh future step hai)
    alert("Password check karne ka logic yahan aayega.");
  };

  return (
    <Layout viewKey={currentView}>
      {/* Conditional rendering: currentView ke hisaab se sahi component dikhayein */}
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
      {/* VaultPage ko dikhane ke liye yeh naya block add kiya gaya hai */}
      {currentView === 'vault' && (
        <VaultPage />
      )}
    </Layout>
  );
}

export default App;