import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import songService from '../services/songService';

function AddSongScreen({ onSongAdded, onBack }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [error, setError] = useState(null);
  const [addSuccess, setAddSuccess] = useState(false);
  const { user } = useAuth();

  const addSong = async (e) => {
    e.preventDefault();
    setError(null);
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
      setTimeout(() => {
        onSongAdded();
      }, 1500);

    } catch (err) {
      setError(err.message || 'Error al añadir la canción.');
      console.error('Error al añadir canción:', err);
    }
  };

  return (
    <div className="add-song-screen">
      <div style={{display: 'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>Añadir Nueva Canción</h2>
        <button onClick={onBack} className="btn secondary-btn">Volver</button>
      </div>
      {error && <p className="error-message">{error}</p>}
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
        <button type="submit" className="btn">Guardar Canción</button>
        {addSuccess && <p className="success-message">¡Canción añadida con éxito! Redirigiendo...</p>}
      </form>
    </div>
  );
}

export default AddSongScreen;