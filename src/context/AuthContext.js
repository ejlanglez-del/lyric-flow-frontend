import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('userInfo');
    setUser(null);
    window.location.reload(); // Forzar un refresco para limpiar todo el estado de la app
  }, []);

  // Load user from localStorage on initial render and set up Axios interceptor
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);

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
      setUser(response.data); // Set user state after successful registration
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

  const updateUsername = useCallback(async (newUsername) => {
    if (!user || !user.token) {
      console.error("User not authenticated to update username.");
      return;
    }
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      // Make the PUT request to backend
      await axios.put(API_URL + 'profile', { username: newUsername }, config);

      // Update local state and localStorage directly with newUsername
      setUser(prevUser => {
        const updatedUser = { ...prevUser, username: newUsername };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        return updatedUser;
      });
    } catch (error) {
      console.error("Error updating username on backend:", error);
      // Even if backend fails, we'll try to update locally for better UX
      setUser(prevUser => {
        const updatedUser = { ...prevUser, username: newUsername };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        return updatedUser;
      });
    }
  }, [user, API_URL, setUser]);

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateUsername,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};