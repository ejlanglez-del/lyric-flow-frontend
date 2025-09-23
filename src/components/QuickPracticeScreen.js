import React, { useState, useEffect } from 'react';
import { getErrors, clearParagraphErrors } from '../services/localStorageService';
import songService from '../services/songService';
import { useAuth } from '../context/AuthContext';
import MemorizeScreen from './MemorizeScreen'; // Reutilizar MemorizeScreen para la práctica

const QUICK_PRACTICE_LIMIT = 5; // Número de párrafos a practicar en una sesión rápida

const calculatePriorityScore = (errorCount, lastAttemptTimestamp) => {
    const now = new Date();
    const lastAttempt = new Date(lastAttemptTimestamp);
    const timeSinceLastAttemptHours = (now.getTime() - lastAttempt.getTime()) / (1000 * 60 * 60);

    const WEIGHT_ERRORS = 5; // Cada error suma 5
    const WEIGHT_TIME = 1;   // Cada hora sin repasar suma 1

    // El usuario quiere una relación lineal para el tiempo
    const score = (WEIGHT_TIME * timeSinceLastAttemptHours) + (WEIGHT_ERRORS * errorCount);
    return score;
};

function QuickPracticeScreen({ onBack }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quickPracticeSongs, setQuickPracticeSongs] = useState([]);
    const [currentPracticeSongIndex, setCurrentPracticeSongIndex] = useState(0);

        const fetchQuickPracticeContent = React.useCallback(async () => {
            console.log('fetchQuickPracticeContent iniciado.');
            if (!user) {
                console.log('Usuario no autenticado, deteniendo fetchQuickPracticeContent.');
                setError('Usuario no autenticado.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                console.log('Obteniendo errores de localStorage...');
                const allErrors = getErrors();
                console.log('Errores obtenidos:', allErrors);

                console.log('Obteniendo canciones del servicio...');
                const allSongs = await songService.getSongs(user.token);
                console.log('Canciones obtenidas:', allSongs);
                const songMap = new Map(allSongs.map(s => [s._id, s]));

                const prioritizedParagraphs = [];

                for (const songId in allErrors) {
                    if (songMap.has(songId)) { // Asegurarse de que la canción existe
                        const songErrors = allErrors[songId];
                        const originalLyrics = songMap.get(songId).lyrics;
                        const paragraphsInSong = originalLyrics.split(/\n\s*\n/).filter(p => p.trim() !== '');

                        for (const paragraphId in songErrors) {
                            const pIdNum = parseInt(paragraphId, 10);
                            if (paragraphsInSong[pIdNum]) { // Asegurarse de que el párrafo existe
                                const { errorCount, lastAttemptTimestamp } = songErrors[paragraphId];
                                const precedingParagraphText = pIdNum > 0 ? paragraphsInSong[pIdNum - 1] : null;
                                if (errorCount > 0) { // Solo si hay errores
                                    const score = calculatePriorityScore(errorCount, lastAttemptTimestamp);
                                    prioritizedParagraphs.push({
                                        songId,
                                        paragraphId: pIdNum,
                                        text: paragraphsInSong[pIdNum],
                                        precedingParagraphText,
                                        score,
                                        errorCount,
                                        lastAttemptTimestamp
                                    });
                                }
                            }
                        }
                    }
                }

                console.log('Párrafos priorizados (antes de ordenar):', prioritizedParagraphs);
                // Ordenar por puntuación de mayor a menor
                prioritizedParagraphs.sort((a, b) => b.score - a.score);
                console.log('Párrafos priorizados (después de ordenar):', prioritizedParagraphs);

                // Seleccionar los N párrafos más difíciles
                const selectedParagraphs = prioritizedParagraphs.slice(0, QUICK_PRACTICE_LIMIT);
                console.log('Párrafos seleccionados:', selectedParagraphs);

                // Agrupar por canción para pasarlos a MemorizeScreen
                const songsForPractice = selectedParagraphs.map(p => ({
                    _id: p.songId,
                    lyrics: p.text, // Solo el párrafo específico
                    originalParagraphIndex: p.paragraphId, // El índice original del párrafo en la canción
                    precedingParagraphText: p.precedingParagraphText, // Texto del párrafo anterior
                    title: songMap.get(p.songId)?.title || 'Canción Desconocida',
                    artist: songMap.get(p.songId)?.artist || 'Artista Desconocido',
                }));
            
                console.log('Canciones para práctica rápida (final):', songsForPractice);
                setQuickPracticeSongs(songsForPractice);
                setLoading(false);

            } catch (err) {
                console.error('Error al cargar contenido para práctica rápida:', err);
                setError('No se pudo cargar el contenido para la práctica rápida.');
                setLoading(false);
            }
        }, [user]);

    const handleMarkAsMastered = () => {
        if (currentSongForPractice) {
            clearParagraphErrors(currentSongForPractice._id, currentSongForPractice.originalParagraphIndex);
            
            // Filter out the mastered paragraph from the current list
            const updatedQuickPracticeSongs = quickPracticeSongs.filter(
                (song, index) => index !== currentPracticeSongIndex
            );

            if (updatedQuickPracticeSongs.length === 0) {
                onBack(); // All paragraphs in this session are mastered
            } else {
                setQuickPracticeSongs(updatedQuickPracticeSongs);
                // If the removed item was the last one, and there are still items, adjust index to the new last item
                if (currentPracticeSongIndex >= updatedQuickPracticeSongs.length) {
                    setCurrentPracticeSongIndex(updatedQuickPracticeSongs.length - 1);
                }
                // No manual advancement of currentPracticeSongIndex here. It will naturally point to the next item.
            }
        }
    };

    useEffect(() => {
        console.log('useEffect en QuickPracticeScreen disparado. Llamando a fetchQuickPracticeContent.');
        fetchQuickPracticeContent();
    }, [user, fetchQuickPracticeContent]);

    const handleFinishPracticeParagraph = () => {
        // When a paragraph is finished (correctly typed), advance to the next one
        if (currentPracticeSongIndex < quickPracticeSongs.length - 1) {
            setCurrentPracticeSongIndex(prevIndex => prevIndex + 1);
        } else {
            // All paragraphs in the current session are completed
            onBack(); // Go back to dashboard
        }
    };

    if (loading) {
        return <div className="quick-practice-screen">Cargando párrafos para práctica rápida...</div>;
    }

    if (error) {
        return <div className="quick-practice-screen" style={{ color: 'red' }}>{error}</div>;
    }

    if (quickPracticeSongs.length === 0) {
        return (
            <div className="quick-practice-screen">
                <h2>Práctica Rápida</h2>
                <p>¡Excelente! No tienes párrafos con errores o pendientes de repasar.</p>
                <button onClick={onBack} className="btn">Volver al Dashboard</button>
            </div>
        );
    }

    const currentSongForPractice = quickPracticeSongs[currentPracticeSongIndex];

    // Add this check to prevent rendering errors if currentSongForPractice is undefined
    if (!currentSongForPractice) {
        return (
            <div className="quick-practice-screen">
                <h2>Práctica Rápida</h2>
                <p>Cargando siguiente párrafo o finalizando sesión...</p>
                <button onClick={onBack} className="btn">Volver al Dashboard</button>
            </div>
        );
    }

    return (
        <div className="quick-practice-screen" style={{ textAlign: 'center' }}>
            <h2>Práctica Rápida</h2>
            <h3>{currentSongForPractice.title} - {currentSongForPractice.artist}</h3>
            <p>Párrafo {currentPracticeSongIndex + 1} de {quickPracticeSongs.length}</p>
            {currentSongForPractice.originalParagraphIndex === 0 ? (
                <p className="quick-practice-cue" style={{ color: '#6c757d' }}>Empieza la canción</p>
            ) : (
                <p className="quick-practice-cue" style={{ color: '#6c757d', fontSize: '0.9em', marginBottom: '0.5em' }}>
                    ... {currentSongForPractice.precedingParagraphText}
                </p>
            )}
            <MemorizeScreen
                lyrics={currentSongForPractice.lyrics}
                songId={currentSongForPractice._id}
                onFinish={handleFinishPracticeParagraph}
                onBack={handleFinishPracticeParagraph} // Usar la misma función para volver/siguiente
                mode="quickPractice" // Siempre en modo práctica rápida
                originalParagraphIndexForTracking={currentSongForPractice.originalParagraphIndex} // Pasar el índice original para el tracking
                // onRepetitionComplete no es necesario aquí, ya que el seguimiento de errores es más granular
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={onBack} className="btn secondary-btn">Volver al Dashboard</button>
                <button onClick={handleMarkAsMastered} style={{ color: '#6c757d', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Marcar como Dominado</button>
            </div>
        </div>
    );
}

export default QuickPracticeScreen;
