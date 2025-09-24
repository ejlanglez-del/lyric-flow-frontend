import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Obtener todas las canciones del usuario
const getSongs = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axios.get(API_BASE_URL + '/api/songs/', config);
  return data;
};

// Crear una nueva canciÃ³n
const createSong = async (songData, token) => {
    const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.post(API_BASE_URL + '/api/songs/', songData, config);
      return data;
}

// Eliminar una canciÃ³n
const deleteSong = async (songId, token) => {
    const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.delete(API_BASE_URL + '/api/songs/' + songId, config);
      return data;
}

// Incrementar el contador de sesiones completadas
const updateSongRepetitionCount = async (songId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axios.put(API_BASE_URL + '/api/songs/' + songId + '/complete', {}, config);
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
  const { data } = await axios.put(API_BASE_URL + '/api/songs/' + songData._id, songData, config);
  return data;
};

const completeExam = async (songId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axios.put(API_BASE_URL + '/api/songs/' + songId + '/complete-exam', {}, config);
  return data;
};

const logParagraphError = async (songId, paragraphIndex, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axios.post(
    `${API_BASE_URL}/api/songs/${songId}/lyrics/${paragraphIndex}/error`,
    {},
    config
  );
  return data;
};

const clearParagraphErrors = async (songId, paragraphIndex, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axios.delete(
    `${API_BASE_URL}/api/songs/${songId}/lyrics/${paragraphIndex}/errors`,
    config
  );
  return data;
};

const songService = { getSongs, createSong, deleteSong, updateSongRepetitionCount, checkDuplicate, updateSong, completeExam, logParagraphError, clearParagraphErrors };
export default songService;
