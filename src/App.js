import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import songService from './services/songService';
import SongListScreen from './components/SongListScreen';
import DashboardScreen from './components/DashboardScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import MemorizeScreen from './components/MemorizeScreen';
import QuickPracticeScreen from './components/QuickPracticeScreen';
import AddSongScreen from './components/AddSongScreen';
import EditSongScreen from './components/EditSongScreen'; // Importar EditSongScreen

export default function App() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState('dashboard');
  const [authScreen, setAuthScreen] = useState('login');
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);

  const [selectedSong, setSelectedSong] = useState(null);
  const [practiceMode, setPracticeMode] = useState('practice');
  const [isExamMode, setIsExamMode] = useState(false);

  const fetchSongs = useCallback(async () => {
    if (user && user.token) {
      try {
        setError(null);
        const userSongs = await songService.getSongs(user.token);
        setSongs(userSongs);
      } catch (err) {
        setError('No se pudieron cargar las canciones.');
        console.error(err);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const navigateTo = (screenName) => setScreen(screenName);
  const backToDashboard = () => {
    setSelectedSong(null);
    setIsExamMode(false);
    navigateTo('dashboard');
  };

  const handleSelectSong = (song, mode = 'practice') => {
    setSelectedSong(song);
    setPracticeMode(mode);
    navigateTo('memorize');
  };

  const handleSongAdded = () => {
    fetchSongs();
    backToDashboard();
  };

  const handleSongUpdated = () => {
    fetchSongs();
    navigateTo('library');
  };

  const handleExamComplete = async (songId) => {
    try {
      await songService.completeExam(songId, user.token);
    } catch (error) {
      console.error('Error al completar el examen (backend puede no tener esta función aún):', error);
    }
    await fetchSongs();
  };

  const handleRepetitionComplete = async (songId) => {
    try {
      await songService.updateSongRepetitionCount(songId, user.token);
      await fetchSongs();
    } catch (error) {
      console.error('Error al actualizar las repeticiones:', error);
    }
    backToDashboard();
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return authScreen === 'login' ? (
      <LoginScreen onNavigateToRegister={() => setAuthScreen('register')} />
    ) : (
      <RegisterScreen onNavigateToLogin={() => setAuthScreen('login')} />
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return (
          <DashboardScreen
            onNavigateToAddSong={() => navigateTo('addSong')}
            onNavigateToSongList={() => {
              setIsExamMode(false);
              navigateTo('library');
            }}
            onNavigateToQuickPractice={() => navigateTo('quickPractice')}
            onNavigateToExam={() => {
              setIsExamMode(true);
              navigateTo('library');
            }}
          />
        );
      case 'addSong':
        return <AddSongScreen onSongAdded={handleSongAdded} onBack={backToDashboard} />;
      case 'editSong': // Añadir caso para la pantalla de edición
        return (
          <EditSongScreen
            song={selectedSong}
            onSongUpdated={handleSongUpdated}
            onBack={() => navigateTo('library')}
          />
        );
      case 'library':
        return (
          <SongListScreen
            songs={songs}
            onBack={backToDashboard}
            onSelectForLearning={(song) => handleSelectSong(song, 'learn')}
            onSelectSong={(song, mode) => {
              const finalMode = isExamMode ? 'exam' : mode || 'practice';
              handleSelectSong(song, finalMode);
            }}
            onEditSong={(song) => { // Implementar la navegación a la pantalla de edición
              setSelectedSong(song);
              navigateTo('editSong');
            }}
            onDeleteSong={async (id) => {
              await songService.deleteSong(id, user.token);
              fetchSongs();
            }}
            isExamMode={isExamMode}
          />
        );
      case 'quickPractice':
        return <QuickPracticeScreen onBack={backToDashboard} />;
      case 'memorize':
        if (!selectedSong) return null;
        return (
          <MemorizeScreen
            lyrics={selectedSong.lyrics}
            songId={selectedSong._id}
            mode={practiceMode}
            onFinish={backToDashboard}
            onBack={backToDashboard}
            onRepetitionComplete={handleRepetitionComplete}
            onExamComplete={handleExamComplete}
            onExamFailed={() => console.log('Examen fallido')}
          />
        );
      default:
        return (
          <div>
            <h1>Error</h1><p>Pantalla no encontrada.</p>
            <button onClick={backToDashboard}>Volver</button>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {error && <div className="error-message">{error}</div>}
      {renderScreen()}
    </div>
  );
}