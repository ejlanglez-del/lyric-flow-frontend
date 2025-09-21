import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import songService from '../services/songService';

function EditSongScreen({ song, onUpdate, onCancel }) {
  const [title, setTitle] = useState(song.title || '');
  const [artist, setArtist] = useState(song.artist || '');
  const [lyrics, setLyrics] = useState(song.lyrics || '');
  const { user } = useContext(AuthContext);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    setTitle(song.title || '');
    setArtist(song.artist || '');
    setLyrics(song.lyrics || '');
  }, [song]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);
    try {
      const updatedSongData = {
        _id: song._id, // Pass the song ID for update
        title,
        artist,
        lyrics: lyrics.trim(),
      };
      await songService.updateSong(updatedSongData, user.token);
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
        onUpdate(updatedSongData); // Call onUpdate prop to refresh song list in App.js
      }, 1500);
    } catch (error) {
      console.error('Error al actualizar canción:', error);
    }
  };

  return (
    <div className="edit-song-screen">
      <h2>Editar Canción</h2>
      <form onSubmit={handleUpdate} className="add-song-form"> {/* Reusing add-song-form styles */}
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
        <button type="submit" className="btn">Actualizar Canción</button>
        <button type="button" onClick={onCancel} className="btn secondary-btn" style={{ marginLeft: '10px' }}>Cancelar</button>
      </form>
      {updateSuccess && <p style={{ color: 'green', marginTop: '10px' }}>¡Canción actualizada con éxito!</p>}
    </div>
  );
}

export default EditSongScreen;