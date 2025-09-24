import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import songService from '../services/songService';
import CountdownTimer from './CountdownTimer';

function SongListScreen({
  songs = [],
  onSelectSong,
  onBack,
  onSelectForLearning,
  onDeleteSong,
  onEditSong,
  isExamMode = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // asc = Menor a Mayor
  const [showPracticeModeSelection, setShowPracticeModeSelection] = useState(null);
  const { user } = useAuth();

  // ======== WRAPPERS (Respaldo si la prop no está conectada) ========
  const safe = (fn, name) => (...args) => {
    if (typeof fn === 'function') {
      console.log(`[OK] ${name}`, args);
      return fn(...args);
    }
    console.log(`[NOOP] ${name} sin implementar`, args);
    alert(`(demo) Acción: ${name}`);
  };

  const handleBack = safe(onBack, 'Volver al Panel');
  const handleSelectSong = safe(onSelectSong, 'Comenzar Examen / Abrir canción');
  const handleSelectForLearningSafe = safe(onSelectForLearning, 'Aprender');
  const handleEditSong = safe(onEditSong, 'Editar');

  // ======== Eliminar canción (con fallback si onDeleteSong no existe) ========
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta canción?')) return;
    try {
      await songService.deleteSong(id, user?.token);
      if (typeof onDeleteSong === 'function') {
        onDeleteSong(id);
      } else {
        console.log('[NOOP] onDeleteSong sin implementar. ID a borrar:', id);
        alert(`(demo) Eliminado ID: ${id}`);
      }
    } catch (error) {
      console.error('Error al eliminar canción:', error);
      alert('No se pudo eliminar la canción. Revisa consola.');
    }
  };

  const handleSelectPracticeMode = (song, mode) => {
    console.log('Seleccionaste modo de práctica:', mode, 'para', song?.title);
    handleSelectSong(song, mode);
    setShowPracticeModeSelection(null);
  };

  // ======== Búsqueda y orden ========
  const filteredAndSortedSongs = Array.isArray(songs)
    ? songs
        .filter((song) => {
          const t = (song?.title || '').toLowerCase();
          const a = (song?.artist || '').toLowerCase();
          const q = searchTerm.toLowerCase();
          return t.includes(q) || a.includes(q);
        })
        .sort((a, b) => {
          if (sortOrder === 'asc') {
            return (a.completedSessions || 0) - (b.completedSessions || 0);
          } else if (sortOrder === 'desc') {
            return (b.completedSessions || 0) - (a.completedSessions || 0);
          } else if (sortOrder === 'newest') {
            // si _id es ObjectId, primeros 8 chars son timestamp hex
            const timestampA = parseInt(b?._id?.substring(0, 8) || '0', 16);
            const timestampB = parseInt(a?._id?.substring(0, 8) || '0', 16);
            return timestampA - timestampB;
          } else if (sortOrder === 'oldest') {
            const timestampA = parseInt(a?._id?.substring(0, 8) || '0', 16);
            const timestampB = parseInt(b?._id?.substring(0, 8) || '0', 16);
            return timestampA - timestampB;
          }
          return 0;
        })
    : [];

  return (
    <div className="song-list-screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Tu Biblioteca de Canciones ({filteredAndSortedSongs.length})</h2>
        <button className="btn secondary-btn" type="button" onClick={handleBack}>
          Volver al Panel
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}
      >
        <input
          type="text"
          placeholder="Buscar por título o artista..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="sort-controls">
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
          <p>
            {songs.length > 0
              ? 'No se encontraron canciones que coincidan con la búsqueda.'
              : 'No tienes canciones guardadas.'}
          </p>
        ) : (
          filteredAndSortedSongs.map((song) => {
            const isExamAvailable =
              !song?.nextExamAvailableAt || Date.now() >= song.nextExamAvailableAt; // defensivo
            return (
              <div
                key={song?._id || song?.title}
                className="song-item"
                style={{ position: 'relative' /* hace que el modal interno se posicione bien */ }}
              >
                <h3>
                  {(song?.title || '[Título Desconocido]')} - {(song?.artist || '[Artista Desconocido]')}
                </h3>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginTop: '0px',
                    alignItems: 'center'
                  }}
                >
                  {isExamMode ? (
                    isExamAvailable ? (
                      <button className="btn" type="button" onClick={() => handleSelectSong(song)}>
                        Comenzar Examen
                      </button>
                    ) : (
                      <CountdownTimer targetDate={song?.nextExamAvailableAt} />
                    )
                  ) : (
                    <>
                      <button
                        className="btn secondary-btn"
                        type="button"
                        onClick={() => handleSelectForLearningSafe(song)}
                      >
                        Aprender
                      </button>

                      <button
                        className="btn"
                        type="button"
                        onClick={() => setShowPracticeModeSelection(song)}
                      >
                        Practicar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditSong(song)}
                        style={{
                          color: '#bbb',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '0.85rem'
                        }}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(song?._id)}
                        style={{
                          color: '#dc3545',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '0.85rem'
                        }}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>

                {showPracticeModeSelection && showPracticeModeSelection._id === song._id && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: '#282828',
                      padding: '10px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
                      display: 'flex',
                      gap: '10px',
                      zIndex: 100
                    }}
                  >
                    <button
                      className="btn secondary-btn"
                      type="button"
                      onClick={() => handleSelectPracticeMode(song, 'practice')}
                    >
                      Práctica Normal
                    </button>

                    <button
                      className="btn"
                      type="button"
                      onClick={() => handleSelectPracticeMode(song, 'deepPractice')}
                    >
                      Práctica Profunda
                    </button>
                  </div>
                )}

                <p>Repasos completados: {song?.completedSessions || 0}</p>
                <p style={{ color: '#FFD700', fontWeight: 'bold' }}>Nivel de Examen: {song?.examLevel || 0}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default SongListScreen;
