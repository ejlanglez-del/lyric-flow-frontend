
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/songs/transcribe-audio';

/**
 * Uploads audio file for transcription.
 * @param {Blob} audioBlob The audio data as a Blob.
 * @returns {Promise<Object>} The transcription result from the API.
 */
const uploadAudioForTranscription = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.wav');

  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading audio for transcription:', error);
    // Propagate a more user-friendly error message
    throw new Error(error.response?.data?.error || 'Failed to transcribe audio.');
  }
};

const transcriptionService = {
  uploadAudioForTranscription,
};

export default transcriptionService;
