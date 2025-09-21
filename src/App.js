import React, { useState, useEffect, useContext } from 'react';
import AuthContext from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import DashboardScreen from './components/DashboardScreen';
import MemorizeScreen from './components/MemorizeScreen';
import SongListScreen from './components/SongListScreen';
import QuickPracticeScreen from './components/QuickPracticeScreen'; // Import the new component
import EditSongScreen from './components/EditSongScreen'; // Import EditSongScreen
import UsernamePromptScreen from './components/UsernamePromptScreen'; // Import UsernamePromptScreen


import songService from './services/songService'; // Import songService
import './App.css';

function App() {
  const { user, loading, logout } = useContext(AuthContext);
  const [authScreen, setAuthScreen] = useState('login');
  const [selectedSong, setSelectedSong] = useState(null);
  const [mainView, setMainView] = useState('dashboard');
  const [screenMode, setScreenMode] = useState('practice'); // 'practice' or 'learn'
  const [songs, setSongs] = useState([]); // Initialize songs state
  const [editingSong, setEditingSong] = useState(null); // New state for editing song
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false); // New state for username prompt





  const handleNavigateToQuickPractice = () => {
    setMainView('quickPractice');
  };

  const handleNavigateToExam = () => {
    setMainView('examSongList');
  };

  const handleStartExam = (song) => {
    setScreenMode('exam');
    setSelectedSong(song);
  };

  const SRS_SCHEDULE_HOURS = [3, 24, 48, 120, 360, 720, 2160, 4320, 12960]; // In hours

  const calculateNextExamTime = (level, lastPassedTimestamp) => {
    if (level === 0) return Date.now(); // Level 0 is always available
    const hoursToWait = SRS_SCHEDULE_HOURS[level - 1] || SRS_SCHEDULE_HOURS[SRS_SCHEDULE_HOURS.length - 1];
    return lastPassedTimestamp + (hoursToWait * 60 * 60 * 1000);
  };

  const handleExamComplete = (songId) => {
    const key = 'lyricFlow_examLevels';
    const levels = JSON.parse(localStorage.getItem(key) || '{}');
    const songInfo = levels[songId] || { level: 0, lastPassed: 0 };
    
    songInfo.level += 1;
    songInfo.lastPassed = Date.now();
    levels[songId] = songInfo;
    localStorage.setItem(key, JSON.stringify(levels));

    setSongs(prevSongs =>
        prevSongs.map(song => {
            if (song._id === songId) {
                const nextExamTime = calculateNextExamTime(songInfo.level, songInfo.lastPassed);
                return { ...song, examLevel: songInfo.level, nextExamAvailableAt: nextExamTime };
            }
            return song;
        })
    );
  };

  const handleExamFailed = (songId) => {
    const key = 'lyricFlow_examLevels';
    const levels = JSON.parse(localStorage.getItem(key) || '{}');
    const songInfo = levels[songId] || { level: 0, lastPassed: 0 };

    if (songInfo.level > 0) {
        songInfo.level -= 1;
    }
    
    levels[songId] = songInfo;
    localStorage.setItem(key, JSON.stringify(levels));

    setSongs(prevSongs =>
        prevSongs.map(song => {
            if (song._id === songId) {
                // Recalculate next available time based on the new, lower level
                const nextExamTime = calculateNextExamTime(songInfo.level, songInfo.lastPassed);
                return { ...song, examLevel: songInfo.level, nextExamAvailableAt: nextExamTime };
            }
            return song;
        })
    );
  };

  // Fetch songs when user is available
  useEffect(() => {
    const fetchSongs = async () => {
      if (user && user.token) { // Ensure user is logged in and has a token
        // Check if username is missing for existing users
        if (!user.username) {
          setShowUsernamePrompt(true);
          return; // Don't load songs until username is set
        }

        try {
          const data = await songService.getSongs(user.token);
          const levels = JSON.parse(localStorage.getItem('lyricFlow_examLevels') || '{}');
          const songsWithData = data.map(song => {
            const songInfo = levels[song._id] || { level: 0, lastPassed: 0 };
            const nextExamTime = calculateNextExamTime(songInfo.level, songInfo.lastPassed);
            return {
                ...song,
                completedSessions: song.completedSessions || 0,
                examLevel: songInfo.level,
                nextExamAvailableAt: nextExamTime
            };
          });
          setSongs(songsWithData);
        } catch (error) {
          console.error('Error al obtener canciones:', error);
        }
      }
    };
    fetchSongs();
  }, [user]);

  const handleSelectSongForMode = (song, mode = 'practice') => {
    setScreenMode(mode);
    setSelectedSong(song);
  }

  const handleSelectForLearning = (song) => {
    setScreenMode('learn');
    setSelectedSong(song);
  }

  const handleFinish = () => {
    setSelectedSong(null); // Clear selected song first
    setMainView('songList'); // Then navigate to song list
  }

  const handleRepetitionComplete = async (songId) => {
    // Optimistically update local state
    setSongs(prevSongs =>
      prevSongs.map(song =>
        song._id === songId ? { ...song, completedSessions: (song.completedSessions || 0) + 1 } : song
      )
    );
    // Update backend
    try {
      if (user) {
        await songService.updateSongRepetitionCount(songId, user.token);
        // Re-fetch songs to ensure local state is in sync with backend
        const data = await songService.getSongs(user.token);
        setSongs(data.map(song => ({ ...song, completedSessions: song.completedSessions || 0 })));
      }
    } catch (error) {
      console.error('Error al actualizar el contador de repeticiones en el backend:', error);
      // Revert optimistic update if backend update fails
      setSongs(prevSongs =>
        prevSongs.map(song =>
          song._id === songId ? { ...song, completedSessions: (song.completedSessions || 0) - 1 } : song
        )
      );
    }
  };

  const handleUpdateSong = (updatedSong) => {
    setSongs(prevSongs => prevSongs.map(s => s._id === updatedSong._id ? updatedSong : s));
    setEditingSong(null); // Exit edit mode
  };

  const handleEditSong = (song) => {
    setEditingSong(song); // Enter edit mode with the selected song
  };

  const handleCancelEdit = () => {
    setEditingSong(null); // Exit edit mode
  };

  const handleDeleteSong = async (songId) => {
    try {
      if (user) {
        await songService.deleteSong(songId, user.token);
        setSongs(prevSongs => prevSongs.filter(song => song._id !== songId));
      }
    } catch (error) {
      console.error('Error al eliminar canción:', error);
    }
  };

  if (loading) {
    return <h1>Cargando...</h1>;
  }

  const renderContent = () => {
    if (!user) {
      return authScreen === 'login' ? 
        <LoginScreen onNavigateToRegister={() => setAuthScreen('register')} /> : 
        <RegisterScreen onNavigateToLogin={() => setAuthScreen('login')} />
    }

    if (showUsernamePrompt) {
      return <UsernamePromptScreen onUsernameSet={() => setShowUsernamePrompt(false)} />;
    }

    if (selectedSong) {
      return <MemorizeScreen 
               lyrics={selectedSong.lyrics} 
               songId={selectedSong._id} // Pasar el ID de la canción
               onFinish={handleFinish} 
               onBack={handleFinish} 
               mode={screenMode} // Pasar el modo actual
               onRepetitionComplete={handleRepetitionComplete} // Pasar la función de actualización
               onExamComplete={handleExamComplete}
               onExamFailed={handleExamFailed}
             />
    }

    if (editingSong) { // New condition for editing
      return <EditSongScreen 
               song={editingSong} 
               onUpdate={handleUpdateSong} 
               onCancel={handleCancelEdit} 
             />
    }

    if (mainView === 'dashboard') {
        return <DashboardScreen songs={songs} onNavigateToSongList={() => setMainView('songList')} onNavigateToQuickPractice={handleNavigateToQuickPractice} onNavigateToExam={handleNavigateToExam} />
    }

    if (mainView === 'examSongList') {
      return <SongListScreen 
               songs={songs}
               onSelectSong={handleStartExam}
               onBack={() => setMainView('dashboard')}
               isExamMode={true}
             />
    }

    if (mainView === 'quickPractice') {
      return <QuickPracticeScreen onBack={() => setMainView('dashboard')} />
    }

    if (mainView === 'songList') {
        return <SongListScreen 
                 songs={songs} // Pasar las canciones desde el estado de App
                 onSelectSong={handleSelectSongForMode} // Use the new generic handler
                 onSelectForLearning={handleSelectForLearning} // Pasar el nuevo handler
                 onBack={() => setMainView('dashboard')} 
                 onDeleteSong={handleDeleteSong} // Pasar la función para eliminar canciones
                 onEditSong={handleEditSong} // Pass the new handler for editing
               />
    }

    return <DashboardScreen onNavigateToSongList={() => setMainView('songList')} />
  }

  return (
    <div className="App">
      <header style={{display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'}}>
        <h1>Lyric-Flow</h1>
        {user && (
          <button onClick={() => { if (window.confirm('¿Seguro que quieres cerrar sesión?')) logout(); }} style={{position: 'absolute', top: '15px', right: '15px', color: '#6c757d', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}>
            Cerrar Sesión
          </button>
        )}
      </header>
                <main>
                  {renderContent()}
                </main>    </div>
  );
}

export default App;