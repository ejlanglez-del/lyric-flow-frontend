import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Use useAuth hook

function UsernamePromptScreen({ onUsernameSet }) { // Accept prop
  const [username, setUsername] = useState('');
  const { updateUsername } = useAuth(); // Use useAuth hook

  const handleSubmit = async (e) => { // Make handleSubmit async
    e.preventDefault();
    if (username.trim()) {
      const success = await updateUsername(username.trim()); // Await the update
      if (success) {
        onUsernameSet(); // Call the prop to hide the screen only on success
      }
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