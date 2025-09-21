import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';

function SettingsScreen({ onClose, onThemeChange, currentTheme }) {
  const { user, updateUsername } = useContext(AuthContext);
  const [newUsername, setNewUsername] = useState(user.username || '');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newUsername.trim() && newUsername.trim() !== user.username) {
      updateUsername(newUsername.trim());
      setMessage('Nombre de usuario actualizado con éxito.');
    } else {
      setMessage('El nombre de usuario no ha cambiado o es inválido.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-button">
          ✕
        </button>
        <h2>Configuración</h2>
        <div style={{marginBottom: '20px'}}>
          <h3>Cambiar Nombre de Usuario</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nuevo nombre de usuario"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              className="auth-input"
            />
            <button type="submit" className="btn">Guardar</button>
          </form>
          {message && <p className={message.includes('éxito') ? 'success-message' : 'error-message'}>{message}</p>}
        </div>

        <div style={{marginBottom: '20px'}}>
          <h3>Modo Oscuro/Claro</h3>
          <button onClick={() => onThemeChange('dark')} style={{marginRight: '10px', padding: '8px 15px', borderRadius: '5px', border: currentTheme === 'dark' ? '2px solid #90caf9' : '1px solid #444', backgroundColor: currentTheme === 'dark' ? '#333' : '#222', color: currentTheme === 'dark' ? '#90caf9' : '#eee', cursor: 'pointer'}}>
            Oscuro
          </button>
          <button onClick={() => onThemeChange('light')} style={{padding: '8px 15px', borderRadius: '5px', border: currentTheme === 'light' ? '2px solid #90caf9' : '1px solid #444', backgroundColor: currentTheme === 'light' ? '#eee' : '#fff', color: currentTheme === 'light' ? '#222' : '#333', cursor: 'pointer'}}>
            Claro
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsScreen;