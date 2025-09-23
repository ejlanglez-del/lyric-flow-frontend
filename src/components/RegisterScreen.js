import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function RegisterScreen({ onNavigateToLogin }) {
  const [username, setUsername] = useState(''); // Changed 'name' to 'username'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    register(username, email, password); // Pass 'username'
  };

  return (
    <div className="auth-screen">
      <h1>Registrarse</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre de Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
        />
        <button type="submit" className="btn">Registrarse</button>
      </form>
      <p>
        ¿Ya tienes una cuenta? <span className="link" onClick={onNavigateToLogin}>Inicia sesión aquí</span>
      </p>
    </div>
  );
}

export default RegisterScreen;