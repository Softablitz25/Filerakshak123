// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.jsx';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import CreateVaultScreen from './components/CreateVaultScreen.jsx';
import OpenVaultScreen from './components/OpenVaultScreen.jsx';
import VaultPage from './components/voult/VaultPage.jsx';
import ReauthScreen from './components/ReauthScreen.jsx';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [loading, setLoading] = useState(true);

  const handleGoToCreate = () => setCurrentView('create');
  const handleGoToOpen = () => setCurrentView('open');
  const handleGoBackToWelcome = () => setCurrentView('welcome');
  const handleLockVault = () => setCurrentView('reauth'); 
  const handleFullLock = () => setCurrentView('welcome');

  useEffect(() => {
    const checkVault = async () => {
      const exists = await window.api.vaultExists?.();
      if (exists) {
        setCurrentView('open');
      } else {
        setCurrentView('create');
      }
      setLoading(false);
    };
    checkVault();
  }, []);

  const handleCreateVaultSubmit = (formData) => {
    window.api.savePassword({ password: formData.password });
    console.log("Vault created (password saved).");
    setCurrentView('vault');
  };

  // ✅ FIX: Ab yeh function sirf vault kholne ka kaam karega
  // Password check ki zimmedari OpenVaultScreen ki hogi
  const handleOpenVaultSubmit = () => {
    console.log("Vault unlocked successfully!");
    setCurrentView('vault');
  };

  const handleReauthSubmit = async (formData) => {
    const isMatch = await window.api.checkPassword(formData.password);
    if (isMatch) {
      console.log("Re-authenticated successfully!");
      setCurrentView('vault');
    } else {
      alert("❌ Incorrect password! Please try again.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  }

  if (currentView === 'vault') {
    return <VaultPage onLockVault={handleLockVault} />;
  }

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
      {currentView === 'reauth' && (
        <ReauthScreen 
          onFormSubmit={handleReauthSubmit}
          onFullLock={handleFullLock}
        />
      )}
    </Layout>
  );
}

export default App;