import React from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.svg'; // Importar el logo

function DashboardScreen({ onNavigateToAddSong, onNavigateToSongList, onNavigateToQuickPractice, onNavigateToExam }) {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-screen">
      <div className="dashboard-header">
        {user && user.username && (
          <h2 style={{ color: '#fff' }}>¡Hola, {user.username}!</h2>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button 
          onClick={logout} 
          style={{
            background: 'none',
            border: 'none',
            color: '#aaa',
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="dashboard-buttons-container" style={{ alignItems: 'center' }}>
        <button onClick={onNavigateToAddSong} className="btn">
          Agregar Canción +
        </button>
        <button onClick={onNavigateToQuickPractice} className="btn secondary-btn">
          Práctica Rápida ⚡
        </button>

        <img src={logo} alt="Lyric Flow Logo" style={{ width: '100px', margin: '0 15px' }} />

        <button onClick={onNavigateToSongList} className="btn">
          Ver Mi Biblioteca ➔
        </button>
        <button onClick={onNavigateToExam} className="btn secondary-btn">
          Examen 📝
        </button>
      </div>
    </div>
  );
}

export default DashboardScreen;