
import React, { useState, useRef } from 'react';
import transcriptionService from '../services/transcriptionService';

const VoiceTranscriber = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');

  // useRef is used to hold references to the MediaRecorder and audio chunks without causing re-renders.
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleStartRecording = async () => {
    // Reset states
    setTranscription('');
    setError('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('La API de Media Devices no es soportada en este navegador.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = []; // Clear previous recording chunks

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

        try {
          const result = await transcriptionService.uploadAudioForTranscription(audioBlob);
          if (result.success) {
            setTranscription(result.transcription);
          } else {
            setError(result.error || 'La transcripción falló.');
          }
        } catch (err) {
          setError(err.message || 'Ocurrió un error al subir el audio.');
        }
        setIsTranscribing(false);
        // Stop microphone tracks to turn off the recording indicator
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

    } catch (err) {
      setError('No se pudo acceder al micrófono. Por favor, otorga el permiso.');
      console.error("Error accessing microphone:", err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h2>Prueba de Transcripción en Tiempo Real</h2>
      <p>Presiona "Grabar", di algo, y luego "Detener".</p>
      <div>
        <button onClick={handleStartRecording} disabled={isRecording} style={{ padding: '10px 20px', fontSize: '16px', marginRight: '10px', cursor: 'pointer' }}>
          Grabar
        </button>
        <button onClick={handleStopRecording} disabled={!isRecording} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Detener
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        {isRecording && <p>Grabando...</p>}
        {isTranscribing && <p>Transcribiendo...</p>}
        {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}
        {transcription && (
          <div>
            <h3>Transcripción:</h3>
            <p style={{ border: '1px solid #ccc', padding: '10px', background: '#f9f9f9' }}>{transcription}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceTranscriber;
