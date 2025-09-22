import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import songService from '../services/songService';



function SongListScreen({ songs, onSelectSong, onBack, onSelectForLearning, onDeleteSong, onEditSong, isExamMode = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // Default to Repasos (Menor a Mayor)
  const [showPracticeModeSelection, setShowPracticeModeSelection] = useState(null); // Stores the song for which to show mode selection
  const { user } = useContext(AuthContext);

  // Handler to delete a song
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta canción?')) {
        try {
            await songService.deleteSong(id, user.token);
            onDeleteSong(id); // Call the prop function to update songs in App.js
        } catch (error) {
            console.error('Error al eliminar canción:', error);
        }
    }
  };

  const handleSelectPracticeMode = (song, mode) => {
    onSelectSong(song, mode); // Pass the mode to onSelectSong
    setShowPracticeModeSelection(null); // Hide the mode selection buttons
  };

  // Filter songs based on search term
  const filteredAndSortedSongs = Array.isArray(songs) ? songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortOrder === 'asc') {
      return (a.completedSessions || 0) - (b.completedSessions || 0);
    } else if (sortOrder === 'desc') {
      return (b.completedSessions || 0) - (a.completedSessions || 0);
    } else if (sortOrder === 'newest') {
      // Assuming _id is a MongoDB ObjectId string, first 8 chars are timestamp
      const timestampA = parseInt(b._id.substring(0, 8), 16);
      const timestampB = parseInt(a._id.substring(0, 8), 16);
      return timestampA - timestampB;
    } else if (sortOrder === 'oldest') {
      const timestampA = parseInt(a._id.substring(0, 8), 16);
      const timestampB = parseInt(b._id.substring(0, 8), 16);
      return timestampA - timestampB;
    }
    return 0; // No sorting or default case
  }) : [];

  return (
    <div className="song-list-screen">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2>Tu Biblioteca de Canciones</h2>
            <button className="btn secondary-btn" onClick={onBack}>Volver al Panel</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <input
                type="text"
                placeholder="Buscar por título o artista..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="sort-controls"> {/* Removed inline marginBottom as it's now on the flex container */}
                <label htmlFor="sort-by">Ordenar por:</label>
                <select
                    id="sort-by"
                    className="sort-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{ marginLeft: '10px', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                >
                    <option value="desc">Repasos (Mayor a Menor)</option>
                    <option value="asc">Repasos (Menor a Mayor)</option>
                    <option value="newest">Agregados (Más reciente a más antiguo)</option>
                    <option value="oldest">Agregados (Más antiguo a más reciente)</option>
                </select>
            </div>
        </div>

      <div className="song-list">
        {filteredAndSortedSongs.length === 0 ? (
          <p>{songs.length > 0 && filteredAndSortedSongs.length === 0 ? 'No se encontraron canciones que coincidan con la búsqueda.' : 'No tienes canciones guardadas.'}</p>
        ) : (
          filteredAndSortedSongs.map((song) => {
            // Removed unused isExamAvailable variable
            return (
            <div key={song._id} className="song-item">
              <h3>{(song.title || '[Título Desconocido]')} - {(song.artist || '[Artista Desconocido]')}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '0px', alignItems: 'center' }}>
                {isExamMode ? (
                  <button className="btn" onClick={() => onSelectSong(song)}>Comenzar Examen</button>
                ) : (
                  <>
                    <button className="btn secondary-btn" onClick={() => onSelectForLearning(song)}>Aprender</button>
                    <button className="btn" onClick={() => setShowPracticeModeSelection(song)}>Practicar</button>
                    <button onClick={() => onEditSong(song)} style={{ color: '#bbb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}>Editar</button>
                    <button onClick={() => handleDelete(song._id)} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}>Eliminar</button>
                  </>
                )}
              </div>
              {showPracticeModeSelection && showPracticeModeSelection._id === song._id && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#282828', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.5)', display: 'flex', gap: '10px', zIndex: '100' }}>
                  <button className="btn secondary-btn" onClick={() => handleSelectPracticeMode(song, 'practice')}>Práctica Normal</button>
                  <button className="btn" onClick={() => handleSelectPracticeMode(song, 'deepPractice')}>Práctica Profunda</button>
                </div>
              )}
              <p>Repasos completados: {(song.completedSessions || 0)}</p>
              <p style={{color: '#FFD700', fontWeight: 'bold'}}>Nivel de Examen: {song.examLevel || 0}</p>
            </div>
          )})
        )}
      </div>
    </div>
  );
}

export default SongListScreen;
