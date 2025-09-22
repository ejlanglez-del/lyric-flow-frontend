import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL + '/api/songs/';

// Obtener todas las canciones del usuario
const getSongs = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axios.get(API_URL, config);
  return data;
};

// Crear una nueva canción
const createSong = async (songData, token) => {
    const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.post(API_URL, songData, config);
      return data;
}

// Eliminar una canción
const deleteSong = async (songId, token) => {
    const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.delete(API_URL + songId, config);
      return data;
}

// Incrementar el contador de sesiones completadas
const updateSongRepetitionCount = async (songId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axios.put(API_URL + songId + '/complete', {}, config);
  return data;
};

const checkDuplicate = async (title, artist, token) => {
  const allSongs = await getSongs(token); // Reuse getSongs to fetch all user's songs
  const normalizedTitle = title.toLowerCase().trim();
  const normalizedArtist = artist.toLowerCase().trim();

  return allSongs.some(song =>
    song.title.toLowerCase().trim() === normalizedTitle &&
    song.artist.toLowerCase().trim() === normalizedArtist
  );
};

const updateSong = async (songData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axios.put(API_URL + songData._id, songData, config);
  return data;
};

const songService = { getSongs, createSong, deleteSong, updateSongRepetitionCount, checkDuplicate, updateSong };
export default songService;
