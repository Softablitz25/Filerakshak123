<<<<<<< Updated upstream
import React from 'react';
import HomePage from './components/Homepage';
function App() {
  return (
    <div className="w-screen h-screen">
      <HomePage />
    </div>
=======
// App.jsx (Updated with Vault Navigation)

import React, { useState } from 'react';
import Layout from './components/Layout.jsx';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import CreateVaultScreen from './components/CreateVaultScreen.jsx';
import OpenVaultScreen from './components/OpenVaultScreen.jsx';
// Step 2.1: VaultPage ko import karein
import VaultPage from './components/voult/VaultPage.jsx';
import './App.css';

function App() {
  // 'vault' naam ka ek naya view add karein
  const [currentView, setCurrentView] = useState('welcome');

  const handleGoToCreate = () => setCurrentView('create');
  const handleGoToOpen = () => setCurrentView('open');
  const handleGoBackToWelcome = () => setCurrentView('welcome');

  // Step 2.2: Is function ko update karein
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
      {/* Step 2.3: VaultPage ko dikhane ke liye yeh naya block add karein */}
      {currentView === 'vault' && (
        <VaultPage />
      )}
    </Layout>
>>>>>>> Stashed changes
  );
}

export default App;