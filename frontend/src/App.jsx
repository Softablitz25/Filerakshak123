// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.jsx';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import CreateVaultScreen from './components/CreateVaultScreen.jsx';
import OpenVaultScreen from './components/OpenVaultScreen.jsx';
import VaultPage from './components/voult/VaultPage.jsx';
import ReauthScreen from './components/ReauthScreen.jsx';
import ForgotPasswordScreen from './components/ForgotPasswordScreen.jsx';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [loading, setLoading] = useState(true);
  
  // YEH EK COUNTER HAI JO LOGIN SCREEN KO REFRESH KAREGA
  const [viewKey, setViewKey] = useState(0);

  // YEH FUNCTION HAR BAAR LOGIN SCREEN KO NAYE SIRE SE BANAYEGA
  const navigateToOpen = () => {
    setViewKey(prevKey => prevKey + 1); // Counter ko badhao
    setCurrentView('open');
  };
  
  const handleGoToCreate = () => setCurrentView('create');
  const handleGoBackToWelcome = () => setCurrentView('welcome');
  const handleGoToForgotPassword = () => setCurrentView('forgotPassword');

  const handleLockVault = () => {
    window.api.clearSessionPassword();
    setCurrentView('reauth');
  };
  const handleFullLock = () => {
    window.api.clearSessionPassword();
    setCurrentView('welcome');
  };

  useEffect(() => {
    const checkVault = async () => {
      const exists = await window.api.vaultExists?.();
      window.api.clearSessionPassword();
      if (exists) {
        navigateToOpen(); // Naye function ka istemaal karein
      } else {
        setCurrentView('create');
      }
      setLoading(false);
    };
    checkVault();
  }, []);

  const handleCreateVaultSubmit = (formData) => {
    window.api.savePassword(formData);
    window.api.setSessionPassword(formData.password);
    setCurrentView('vault');
  };

  const handleOpenVaultSubmit = (password) => {
    window.api.setSessionPassword(password);
    setCurrentView('vault');
  };

  const handleReauthSubmit = (password) => {
    window.api.setSessionPassword(password);
    setCurrentView('vault');
  };


  if (loading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  }

  if (currentView === 'vault') {
    return <VaultPage onLockVault={handleLockVault} />;
  }

  return (
    // YAHA BHI KEY KA ISTEMAAL HO RAHA HAI
    <Layout viewKey={`${currentView}-${viewKey}`}>
      {currentView === 'welcome' && (
        <WelcomeScreen
          onCreateClick={handleGoToCreate}
          onOpenClick={navigateToOpen} // Naye function ka istemaal karein
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
          onForgotPasswordClick={handleGoToForgotPassword}
        />
      )}

      {currentView === 'reauth' && (
        <ReauthScreen
          onFormSubmit={handleReauthSubmit}
          onFullLock={handleFullLock}
        />
      )}
      {currentView === 'forgotPassword' && (
        <ForgotPasswordScreen
          onResetSuccess={navigateToOpen} // Naye function ka istemaal karein
          onBackClick={navigateToOpen}    // Naye function ka istemaal karein
        />
      )}
    </Layout>
  );
}

export default App;