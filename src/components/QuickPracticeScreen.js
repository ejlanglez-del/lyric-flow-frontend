import React, { useState, useEffect } from 'react';
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
            console.log('Obteniendo canciones del servicio...');
            const allSongs = await songService.getSongs(user.token);
            console.log('Canciones obtenidas:', allSongs);

            const prioritizedParagraphs = [];

            allSongs.forEach(song => {
                if (song.lyrics && Array.isArray(song.lyrics)) {
                    song.lyrics.forEach((lyricItem, paragraphIndex) => {
                        if (lyricItem.errorHistory && lyricItem.errorHistory.length > 0) {
                            const errorCount = lyricItem.errorHistory.length;
                            const lastAttemptTimestamp = lyricItem.errorHistory[errorCount - 1];
                            
                            const score = calculatePriorityScore(errorCount, lastAttemptTimestamp);
                            
                            const precedingParagraphText = paragraphIndex > 0 ? song.lyrics[paragraphIndex - 1].paragraph : null;

                            prioritizedParagraphs.push({
                                songId: song._id,
                                paragraphId: paragraphIndex,
                                text: lyricItem.paragraph,
                                precedingParagraphText,
                                score,
                                errorCount,
                                lastAttemptTimestamp,
                                title: song.title,
                                artist: song.artist
                            });
                        }
                    });
                }
            });

            console.log('Párrafos priorizados (antes de ordenar):', prioritizedParagraphs);
            prioritizedParagraphs.sort((a, b) => b.score - a.score);
            console.log('Párrafos priorizados (después de ordenar):', prioritizedParagraphs);

            const selectedParagraphs = prioritizedParagraphs.slice(0, QUICK_PRACTICE_LIMIT);
            console.log('Párrafos seleccionados:', selectedParagraphs);

            const songsForPractice = selectedParagraphs.map(p => ({
                _id: p.songId,
                lyrics: p.text,
                originalParagraphIndex: p.paragraphId,
                precedingParagraphText: p.precedingParagraphText,
                title: p.title,
                artist: p.artist,
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

    const handleMarkAsMastered = async () => {
        const songToMark = quickPracticeSongs[currentPracticeSongIndex];
        if (songToMark) {
            try {
                await songService.clearParagraphErrors(
                    songToMark._id,
                    songToMark.originalParagraphIndex,
                    user.token
                );
    
                const updatedQuickPracticeSongs = quickPracticeSongs.filter(
                    (song, index) => index !== currentPracticeSongIndex
                );
    
                if (updatedQuickPracticeSongs.length === 0) {
                    onBack();
                } else {
                    setQuickPracticeSongs(updatedQuickPracticeSongs);
                    if (currentPracticeSongIndex >= updatedQuickPracticeSongs.length) {
                        setCurrentPracticeSongIndex(updatedQuickPracticeSongs.length - 1);
                    }
                }
            } catch (error) {
                console.error("Failed to mark as mastered:", error);
                alert("No se pudo marcar como dominado. Inténtalo de nuevo.");
            }
        }
    };

    useEffect(() => {
        console.log('useEffect en QuickPracticeScreen disparado. Llamando a fetchQuickPracticeContent.');
        fetchQuickPracticeContent();
    }, [user, fetchQuickPracticeContent]);

    const handleFinishPracticeParagraph = () => {
        if (currentPracticeSongIndex < quickPracticeSongs.length - 1) {
            setCurrentPracticeSongIndex(prevIndex => prevIndex + 1);
        } else {
            onBack();
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
                onBack={handleFinishPracticeParagraph}
                mode="quickPractice"
                originalParagraphIndexForTracking={currentSongForPractice.originalParagraphIndex}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={onBack} className="btn secondary-btn">Volver al Dashboard</button>
                <button onClick={handleMarkAsMastered} style={{ color: '#6c757d', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Marcar como Dominado</button>
            </div>
        </div>
    );
}

export default QuickPracticeScreen;
