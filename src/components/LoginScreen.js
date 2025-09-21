import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import './LoginScreen.css'; // Import the CSS file

function LoginScreen({ onNavigateToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // State for error messages
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => { // Made handleSubmit async
    e.preventDefault();
    setError(null); // Clear previous errors
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión'); // Set error message
    }
  };

  return (
    <div className="auth-screen">
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>} {/* Display error message */}
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
        <button type="submit" className="btn">Iniciar Sesión</button>
      </form>
      <p>
        ¿No tienes una cuenta? <span className="link" onClick={onNavigateToRegister}>Regístrate aquí</span>
      </p>
    </div>
  );
}

export default LoginScreen;