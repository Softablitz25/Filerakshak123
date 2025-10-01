import React, { useState } from 'react';
import Layout from './components/Layout.jsx';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import CreateVaultScreen from './components/CreateVaultScreen.jsx';
import OpenVaultScreen from './components/OpenVaultScreen.jsx';
import './App.css';

function App() {
  // Yeh state batata hai ki kaun si screen dikhani hai
  const [currentView, setCurrentView] = useState('welcome');

  // --- Navigation Functions ---
  const handleGoToCreate = () => setCurrentView('create');
  const handleGoToOpen = () => setCurrentView('open');
  const handleGoBackToWelcome = () => setCurrentView('welcome');

  // --- Form Submission Handlers ---
  const handleCreateVaultSubmit = (formData) => {
    // Abhi ke liye, hum data ko alert karenge. Baad mein ise backend mein bhejenge.
    console.log("Creating new vault with data:", formData);
    alert("Creating new vault... (Next step: IPC integration)");
  };
  
  const handleOpenVaultSubmit = (formData) => {
    // Abhi ke liye, hum data ko alert karenge.
    console.log("Opening vault with data:", formData);
    alert("Opening vault... (Next step: IPC integration)");
  };

  return (
    // Layout component hamara common background aur card provide karta hai
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
    </Layout>
  );
}

export default App;

