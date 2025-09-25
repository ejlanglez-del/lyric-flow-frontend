import axios from 'axios';

const API_BASE_URL = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');

const buildUrl = (path) => `${API_BASE_URL}${path}`;

const withAuth = (token) => {
  if (!token) {
    throw new Error('Se requiere un token de autenticación para completar esta acción.');
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const request = async (method, path, token, payload) => {
  const url = buildUrl(path);
  const config = withAuth(token);

  try {
    let response;

    if (method === 'get' || method === 'delete') {
      response = await axios[method](url, config);
    } else {
      response = await axios[method](url, payload ?? {}, config);
    }

    return response.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Ocurrió un error al comunicarse con el servicio de canciones.';

    const normalizedError = new Error(message);
    normalizedError.status = error?.response?.status;
    throw normalizedError;
  }
};

// Obtener todas las canciones del usuario
const getSongs = (token) => request('get', '/api/songs/', token);

// Crear una nueva canción
const createSong = (songData, token) => request('post', '/api/songs/', token, songData);

// Eliminar una canción
const deleteSong = (songId, token) => request('delete', `/api/songs/${songId}`, token);

// Incrementar el contador de sesiones completadas
const updateSongRepetitionCount = (songId, token) =>
  request('put', `/api/songs/${songId}/complete`, token);

const checkDuplicate = async (title, artist, token) => {
  const allSongs = await getSongs(token); // Reuse getSongs to fetch all user's songs
  const normalizedTitle = title.toLowerCase().trim();
  const normalizedArtist = artist.toLowerCase().trim();

  return allSongs.some(
    (song) =>
      song.title.toLowerCase().trim() === normalizedTitle &&
      song.artist.toLowerCase().trim() === normalizedArtist
  );
};

const updateSong = (songData, token) => request('put', `/api/songs/${songData._id}`, token, songData);

const completeExam = (songId, token) => request('put', `/api/songs/${songId}/complete-exam`, token);

const logParagraphError = (songId, paragraphIndex, token) =>
  request('post', `/api/songs/${songId}/lyrics/${paragraphIndex}/error`, token, {});

const clearParagraphErrors = (songId, paragraphIndex, token) =>
  request('delete', `/api/songs/${songId}/lyrics/${paragraphIndex}/errors`, token);

const songService = {
  getSongs,
  createSong,
  deleteSong,
  updateSongRepetitionCount,
  checkDuplicate,
  updateSong,
  completeExam,
  logParagraphError,
  clearParagraphErrors,
};
export default songService;
