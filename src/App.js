import React, { useState } from 'react';
import { useAuth } from './context/AuthContext'; // Use useAuth hook
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import DashboardScreen from './components/DashboardScreen';
import MemorizeScreen from './components/MemorizeScreen';
import SongListScreen from './components/SongListScreen';
import QuickPracticeScreen from './components/QuickPracticeScreen'; // Import the new component
import EditSongScreen from './components/EditSongScreen'; // Import EditSongScreen
import UsernamePromptScreen from './components/UsernamePromptScreen'; // Import UsernamePromptScreen
import SettingsMenu from './components/SettingsMenu'; // Import SettingsMenu


import './App.css';


function App() {
  const { user, logout } = useAuth(); // Use useAuth hook
  const [authScreen, setAuthScreen] = useState('login');
  const [selectedSong, setSelectedSong] = useState(null);
  const [mainView, setMainView] = useState('dashboard');


  const [editingSong, setEditingSong] = useState(null); // New state for editing song
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(false); // New state for username prompt
    const [showSettingsMenu, setShowSettingsMenu] = useState(false); // New state for settings menu
  
    // Spaced Repetition Schedule in hours. L1: 3h, L2: 1d, L3: 2d, L4: 5d, L5: 15d, L6: 1m, L7: 3m, L8: 6m, L9: 1.5y

  
    const toggleSettingsMenu = () => {
      setShowSettingsMenu(prev => !prev);
    };

    const renderContent = () => {
      switch (mainView) {
        case 'dashboard':
          return <DashboardScreen setMainView={setMainView} setSelectedSong={setSelectedSong} setEditingSong={setEditingSong} />;
        case 'memorize':
          return <MemorizeScreen song={selectedSong} setMainView={setMainView} />;
        case 'songList':
          return <SongListScreen setSelectedSong={setSelectedSong} setMainView={setMainView} setEditingSong={setEditingSong} />;
        case 'quickPractice':
          return <QuickPracticeScreen setMainView={setMainView} />;
        case 'editSong':
          return <EditSongScreen song={editingSong} setMainView={setMainView} />;
        case 'login':
          return <LoginScreen setAuthScreen={setAuthScreen} setShowUsernamePrompt={setShowUsernamePrompt} />;
        case 'register':
          return <RegisterScreen setAuthScreen={setAuthScreen} setShowUsernamePrompt={setShowUsernamePrompt} />;
        default:
          return <DashboardScreen setMainView={setMainView} setSelectedSong={setSelectedSong} setEditingSong={setEditingSong} />;
      }
    };
  
    // ... (rest of the code)
  
    return (
      <div className="App">
        <header style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '15px 0', position: 'relative'}}>
          {user && (
            <button onClick={toggleSettingsMenu} style={{position: 'absolute', top: '15px', left: '15px', color: '#6c757d', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem'}}>
              ⚙️
            </button>
          )}
          <h1>Lyric-Flow</h1>
          {user && user.name && (
            <span style={{color: '#6c757d', marginTop: '5px'}}>Hola {user.name}!</span>
          )}
          {user && (
            <button onClick={() => { if (window.confirm('¿Seguro que quieres cerrar sesión?')) logout(); }} style={{position: 'absolute', top: '15px', right: '15px', color: '#6c757d', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}>
              Cerrar Sesión
            </button>
          )}
        </header>
        <main>
          {showSettingsMenu && user && (
            <SettingsMenu onClose={toggleSettingsMenu} onUpdateUsername={user.name} /> // Pass user.name for initial value
          )}
          {renderContent()}
        </main>
      </div>
    );
  }
  
  export default App;