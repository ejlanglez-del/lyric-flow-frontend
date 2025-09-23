import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function SettingsMenu({ onClose }) {
  const { user, updateUsername } = useAuth();
  const [newUsername, setNewUsername] = useState(user?.name || '');
  const [message, setMessage] = useState('');

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    setMessage('');
    if (newUsername.trim() === user.name) {
      setMessage('El nuevo nombre de usuario es el mismo que el actual.');
      return;
    }
    if (newUsername.trim()) {
      const success = await updateUsername(newUsername.trim());
      if (success) {
        setMessage('Nombre de usuario actualizado con éxito.');
        // Optionally close the menu after successful update
        // onClose();
      } else {
        setMessage('Error al actualizar el nombre de usuario.');
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: '#282828',
        padding: '20px',
        borderRadius: '8px',
        width: '300px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '1.2rem',
            cursor: 'pointer',
          }}
        >
          ✖
        </button>
        <h2>Configuración</h2>

        <div style={{ marginBottom: '15px' }}>
          <h3>Cambiar Nombre de Usuario</h3>
          <form onSubmit={handleUsernameChange}>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Nuevo nombre de usuario"
              style={{
                width: 'calc(100% - 20px)',
                padding: '8px',
                marginRight: '10px',
                borderRadius: '4px',
                border: '1px solid #555',
                backgroundColor: '#333',
                color: '#eee',
              }}
              required
            />
            <button type="submit" className="btn" style={{ marginTop: '10px' }}>Guardar</button>
          </form>
          {message && <p style={{ marginTop: '10px', color: message.includes('éxito') ? 'lightgreen' : 'red' }}>{message}</p>}
        </div>

        {/* Más opciones de configuración aquí */}

      </div>
    </div>
  );
}

export default SettingsMenu;