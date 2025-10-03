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
  const handleLockVault = () => setCurrentView('welcome');

  const handleCreateVaultSubmit = (formData) => {
    // This is where you will eventually call the backend
    console.log("Creating new vault with data:", formData);
    // For now, we go directly to the vault page on submission
    setCurrentView('vault');
  };
  
  const handleOpenVaultSubmit = (formData) => {
    // This is where you will eventually call the backend to check the password
    console.log("Attempting to open vault with data:", formData);
    // For now, we go directly to the vault page on submission
    setCurrentView('vault'); 
  };

  // If the current view is the main vault, render it directly (full-screen)
  if (currentView === 'vault') {
    return <VaultPage onLockVault={handleLockVault} />;
  }

  // For all other views ('welcome', 'create', 'open'), use the centered card Layout
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

