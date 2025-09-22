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

const API_URL = process.env.REACT_APP_API_URL + '/api/users/';

const register = async (userData) => {
  const response = await axios.post(API_URL + 'register', userData);
  if (response.data) {
    localStorage.setItem('userInfo', JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (userData) => {
  const response = await axios.post(
    API_URL + 'login',
    userData,
    { headers: { 'Content-Type': 'application/json' } }
  );
    localStorage.setItem('userInfo', JSON.stringify(response.data));
    setUser(response.data);
  return response.data;
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