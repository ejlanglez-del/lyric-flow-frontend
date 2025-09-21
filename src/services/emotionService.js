import axios from 'axios';

const API_URL = 'http://localhost:5000/api/emotion';

/**
 * Analiza la letra completa de una canción para obtener su contexto emocional.
 * @param {string} fullText La letra completa de la canción.
 * @returns {Promise<string[]>} Un array con las emociones dominantes (ej. ['Desamor', 'Nostalgia']).
 */
const analyzeSongContext = async (fullText) => {
    try {
        const { data } = await axios.post(`${API_URL}/context`, { text: fullText });
        return data.context;
    } catch (error) {
        console.error('Error al analizar el contexto de la canción:', error);
        return []; // Devolver array vacío en caso de error
    }
};

/**
 * Analiza un párrafo de texto para detectar su emoción, usando un contexto opcional.
 * @param {string} text El texto del párrafo.
 * @param {string[]} [context] Un array de emociones que sirven de contexto.
 * @returns {Promise<string>} La emoción detectada.
 */
const analyzeEmotion = async (text, context = []) => {
  try {
    const { data } = await axios.post(API_URL, { text, context });
    return data.emotion;
  } catch (error) {
    console.error('Error al analizar la emoción del párrafo:', error);
    return 'Neutral'; // Devolver neutral en caso de error
  }
};

const emotionService = { analyzeEmotion, analyzeSongContext };

export default emotionService;
