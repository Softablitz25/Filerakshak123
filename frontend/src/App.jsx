import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.jsx';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import CreateVaultScreen from './components/CreateVaultScreen.jsx';
import OpenVaultScreen from './components/OpenVaultScreen.jsx';
import VaultPage from './components/voult/VaultPage.jsx';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [loading, setLoading] = useState(true); // For initial vault check

  const handleGoToCreate = () => setCurrentView('create');
  const handleGoToOpen = () => setCurrentView('open');
  const handleGoBackToWelcome = () => setCurrentView('welcome');
  const handleLockVault = () => setCurrentView('welcome');

  // 🔹 Auto-detect if vault exists
  useEffect(() => {
    const checkVault = async () => {
      const exists = await window.api.vaultExists?.();
      if (exists) setCurrentView('open');
      else setCurrentView('create');
      setLoading(false);
    };
    checkVault();
  }, []);

  // ✅ Create Vault
  const handleCreateVaultSubmit = (formData) => {
    // Only send password to backend for hashing
    window.api.savePassword(formData.password);
    console.log("Vault created (password saved).");
    setCurrentView('vault');
  };

  // ✅ Open Vault
  const handleOpenVaultSubmit = async (formData) => {
    const isMatch = await window.api.checkPassword(formData.password);
    if (isMatch) {
      console.log("Vault unlocked successfully!");
      setCurrentView('vault');
    } else {
      alert("❌ Incorrect password! Please try again.");
    }
  };

  // 🔹 Show nothing while checking vault existence
  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;

  // 🔹 Vault screen full page
  if (currentView === 'vault') {
    return <VaultPage onLockVault={handleLockVault} />;
  }

  // 🔹 Other screens inside Layout card
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
    </Layout>
  );
}

export default App;
