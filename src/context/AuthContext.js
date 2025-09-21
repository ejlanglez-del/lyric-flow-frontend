import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('userInfo');
    setUser(null);
  }, []);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  const register = async (username, email, password) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const { data } = await axios.post(
        'http://localhost:5000/api/users/register',
        { username, email, password }, // Changed 'name' to 'username'
        config
      );
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
    } catch (error) {
      if (error.response) {
        console.error('Error en el registro:', error.response.data.message);
      } else if (error.request) {
        console.error('Error de red: No se pudo conectar al servidor. Asegúrate de que el backend esté corriendo.');
      } else {
        console.error('Error:', error.message);
      }
    }
  };

  const login = async (email, password) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const { data } = await axios.post(
        'http://localhost:5000/api/users/login',
        { email, password },
        config
      );
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
    } catch (error) {
      if (error.response) {
        console.error('Error en el inicio de sesión:', error.response.data.message);
      } else if (error.request) {
        console.error('Error de red: No se pudo conectar al servidor. Asegúrate de que el backend esté corriendo.');
      } else {
        console.error('Error:', error.message);
      }
    }
  };

  const updateUsername = (newUsername) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, username: newUsername };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUsername }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;