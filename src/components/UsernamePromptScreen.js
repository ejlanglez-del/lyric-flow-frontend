import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';

function UsernamePromptScreen({ onUsernameSet }) { // Accept prop
  const [username, setUsername] = useState('');
  const { updateUsername } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      updateUsername(username.trim());
      onUsernameSet(); // Call the prop to hide the screen
    }
  };

  return (
    <div className="auth-screen" style={{textAlign: 'center'}}>
      <h1>¡Bienvenido!</h1>
      <p>Parece que es tu primera vez aquí o tu nombre de usuario no está configurado.</p>
      <p>Por favor, ingresa un nombre de usuario para continuar:</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tu nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="auth-input"
        />
        <button type="submit" className="btn">Guardar Nombre de Usuario</button>
      </form>
    </div>
  );
}

export default UsernamePromptScreen;