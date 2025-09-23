import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import songService from '../services/songService'; // Usar el servicio centralizado

// Añadir la nueva prop onNavigateToSongList
function DashboardScreen({ onNavigateToSongList, onNavigateToQuickPractice, onNavigateToExam }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const { user } = useAuth();
  const [addSuccess, setAddSuccess] = useState(false);

  const addSong = async (e) => {
    e.preventDefault();
    setAddSuccess(false);
    try {
      const songData = { title, artist, lyrics: lyrics.trim() };

      const isDuplicate = await songService.checkDuplicate(title, artist, user.token);
      if (isDuplicate) {
        const confirmAdd = window.confirm(
          `Ya existe una canción con el título "${title}" y artista "${artist}". ¿Deseas añadir una copia?`
        );
        if (!confirmAdd) {
          return;
        }
      }

      await songService.createSong(songData, user.token);
      
      setTitle('');
      setArtist('');
      setLyrics('');
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 3000);

    } catch (error) {
      console.error('Error al añadir canción:', error);
    }
  };

  return (
    <div className="dashboard-screen">
      {user && user.username && (
        <h2 style={{ marginBottom: '20px', color: '#fff' }}>¡Hola, {user.username}!</h2>
      )}

      {/* Contenedor para los botones de navegación/acción */}

      <div className="dashboard-buttons-container">
        <button onClick={onNavigateToSongList} className="btn">
          Ver Mi Biblioteca ➔
        </button>
        <button onClick={onNavigateToQuickPractice} className="btn secondary-btn">
          Práctica Rápida ⚡
        </button>
        <button onClick={onNavigateToExam} className="btn secondary-btn">
          Examen 📝
        </button>
      </div>

      <h2>Añadir Nueva Canción</h2>

      <form onSubmit={addSong} className="add-song-form">
        <input
          type="text"
          placeholder="Título de la canción"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Artista"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          required
        />
        <textarea
          placeholder="Pega la letra aquí..."
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          required
        ></textarea>
        {addSuccess && <p className="success-message">¡Canción añadida con éxito!</p>}
      </form>
    </div>
  );
}

export default DashboardScreen;