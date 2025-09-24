import React, { useState, useEffect, useMemo } from 'react';
import { diffWords } from 'diff';
import ProgressBar from './ProgressBar';
import emotionService from '../services/emotionService';
import { trackParagraphAttempt, trackParagraphError, trackParagraphCorrect } from '../services/localStorageService';

const SPANISH_STOP_WORDS = new Set([
    "el", "la", "los", "las", "un", "una", "unos", "unas", "y", "o", "pero", "mas", "más",
    "a", "ante", "bajo", "cabe", "con", "contra", "de", "desde", "durante", "en", "entre",
    "hacia", "hasta", "mediante", "para", "por", "según", "sin", "so", "sobre", "tras",
    "durante", "mediante", "versus", "vía", "que", "qué", "quien", "quién", "quienes", "quiénes",
    "cuyo", "cuya", "cuyos", "cuyas", "donde", "dónde", "cuando", "cuándo", "como", "cómo",
    "cual", "cuál", "cuales", "cuáles", "mi", "tu", "su", "nuestro", "vuestro", "sus", "mis",
    "te", "se", "me", "nos", "os", "lo", "le", "les", "este", "esta", "estos", "estas",
    "ese", "esa", "esos", "esas", "aquel", "aquella", "aquellos", "aquellas", "todo", "toda",
    "todos", "todas", "mucho", "mucha", "muchos", "muchas", "poco", "poca", "pocos", "pocas",
    "otro", "otra", "otros", "otras", "mismo", "misma", "mismos", "mismas", "tal", "tales",
    "cada", "demás", "ambos", "ambas", "uno", "una", "alguno", "alguna", "algunos", "algunas",
    "ninguno", "ninguna", "ningunos", "ningunas", "varios", "varias", "tanto", "tanta", "tantos",
    "tantas", "cierto", "cierta", "ciertos", "ciertas", "sendos", "sendas", "casi", "apenas",
    "siempre", "nunca", "jamás", "quizá", "quizás", "acaso", "tal vez", "aun", "aún", "ya",
    "todavía", "aún", "si", "sí", "no", "ni", "también", "tampoco", "además", "incluso",
    "sólo", "solo", "justo", "apenas", "antes", "después", "luego", "pronto", "tarde", "ayer",
    "hoy", "mañana", "siempre", "nunca", "jamás", "aquí", "allí", "ahí", "cerca", "lejos",
    "arriba", "abajo", "dentro", "fuera", "delante", "detrás", "encima", "debajo", "enfrente",
    "detrás", "bien", "mal", "así", "deprisa", "despacio", "mucho", "muy", "poco", "casi",
    "más", "menos", "tan", "tanto", "bastante", "demasiado", "apenas", "solo", "solamente",
    "incluso", "excepto", "salvo", "menos", "se", "es", "está", "estoy", "estás", "estamos", "estáis", "están",
    "ser", "soy", "eres", "es", "somos", "sois", "son", "ha", "he", "has", "hemos", "habéis",
    "han", "haber", "había", "habías", "habíamos", "habíais", "habían", "hube", "hubiste",
    "hubo", "hubimos", "hubisteis", "hubieron", "habré", "habrás", "habrá", "habremos",
    "habréis", "habrán", "tendré", "tendrás", "tendrá", "tendremos", "tendréis", "tendrán",
    "tengo", "tienes", "tiene", "tenemos", "tenéis", "tienen", "tener", "tuve", "tuviste",
    "tuvo", "tuvimos", "tuvisteis", "tuvieron", "estuve", "estuviste", "estuvo", "estuvimos",
    "estuvisteis", "estuvieron", "fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron",
    "ir", "voy", "vas", "va", "vamos", "vais", "van", "estar", "estoy", "estás", "está",
    "estamos", "estáis", "están", "era", "eras", "éramos", "erais", "eran", "fuese", "fueses",
    "fuéramos", "fueseis", "fuesen", "hubiera", "hubieras", "hubiéramos", "hubierais",
    "hubieran", "tendría", "tendrías", "tendríamos", "tendríais", "tendrían", "estaría",
    "estarías", "estaríamos", "estaríais", "estarían", "habría", "habrías", "habríamos",
    "habríais", "habrían", "haciendo", "hecho", "dicho", "diciendo", "ido", "yendo", "estado",
    "siendo", "habiendo", "teniendo", "estando", "va", "van", "ir", "voy", "vas", "vamos",
    "vais", "van", "estoy", "estás", "está", "estamos", "estáis", "están", "ser", "soy",
    "eres", "es", "somos", "sois", "son", "ha", "he", "has", "hemos", "habéis", "han",
    "haber", "había", "habías", "habíamos", "habíais", "habían", "hube", "hubiste", "hubo",
    "hubimos", "hubisteis", "hubieron", "habré", "habrás", "habrá", "habremos", "habréis",
    "habrán", "tendré", "tendrás", "tendrá", "tendremos", "tendréis", "tendrán", "tengo",
    "tienes", "tiene", "tenemos", "tenéis", "tienen", "tener", "tuve", "tuviste", "tuvo",
    "tuvimos", "tuvisteis", "tuvieron", "estuve", "estuviste", "estuvo", "estuvimos",
    "estuvisteis", "estuvieron", "fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron",
    "ir", "voy", "vas", "va", "vamos", "vais", "van", "estar", "estoy", "estás", "está",
    "estamos", "estáis", "están", "era", "eras", "éramos", "erais", "eran", "fuese", "fueses",
    "fuéramos", "fueseis", "fuesen", "hubiera", "hubieras", "hubiéramos", "hubierais",
    "hubieran", "tendría", "tendrías", "tendríamos", "tendríais", "tendrían", "estaría",
    "estarías", "estaríamos", "estaríais", "estarían", "habría", "habrías", "habríamos",
    "habríais", "habrían", "haciendo", "hecho", "dicho", "diciendo", "ido", "yendo", "estado",
    "siendo", "habiendo", "teniendo", "estando"
]);

const highlightKeyWord = (line) => {
    const words = line.split(/(\s+)/); // Split by spaces, keeping spaces as separate elements
    let bestWord = '';
    let bestWordIndex = -1;

    // Find the longest non-stop word
    words.forEach((word, index) => {
        const cleanedWord = word.toLowerCase().replace(/[^a-zñáéíóúü]/g, ''); // Remove punctuation and normalize
        if (cleanedWord.length > bestWord.length && !SPANISH_STOP_WORDS.has(cleanedWord)) {
            bestWord = cleanedWord;
            bestWordIndex = index;
        }
    });

    if (bestWordIndex !== -1) {
        return words.map((word, index) => {
            if (index === bestWordIndex) {
                return <span key={index} className="highlighted-keyword">{word}</span>; // Highlighted style
            }
            return <span key={index}>{word}</span>;
        });
    }
    return words.map((word, index) => <span key={index}>{word}</span>); // No highlight
};

const normalizeText = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Corrección del regex de acentos
        .replace(/[.,¡!¿?]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const getEmotionColor = (emotion) => {
    if (!emotion) return '#6c757d';
    let hash = 0;
    for (let i = 0; i < emotion.length; i++) {
        hash = emotion.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
};

function MemorizeScreen({ lyrics, onFinish, onBack, mode = 'practice', songId, onRepetitionComplete, originalParagraphIndexForTracking = null, onExamComplete, onExamFailed }) {
    console.log('MemorizeScreen renderizando. Modo:', mode, 'Lyrics:', lyrics);
    // Core state
    const [paragraphs, setParagraphs] = useState([]); // Ahora será un array de objetos {id, text}
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false); // Estado de finalización
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState('');
    const [diffResult, setDiffResult] = useState([]);
    // Removed unused hintUsed state to fix ESLint error
    const [practiceDirection, setPracticeDirection] = useState('forward'); // 'forward' or 'reverse'
    const [showAllLyrics, setShowAllLyrics] = useState(true); // New state to control showing all lyrics or paginated
    const [editingEmojiParagraphIndex, setEditingEmojiParagraphIndex] = useState(null);
    const [editingEmojiType, setEditingEmojiType] = useState(null); // 'start' or 'end'

    const [layoutMode, setLayoutMode] = useState('single'); // Default to single column

    // Emotion analysis state
    const [emotions, setEmotions] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Practice mode specific state
    const [inputMode, setInputMode] = useState('text');

    // Parse lyrics on load, now with unique IDs and emoji placeholders
    useEffect(() => {
        const splitResult = lyrics.split(/\n\s*\n/);
        const filteredResult = splitResult.filter(paragraph => paragraph.trim() !== '');
        const paragraphsWithId = filteredResult.map((p, index) => ({
            id: index,
            text: p,
            startEmoji: '', // Initialize start emoji
            endEmoji: ''    // Initialize end emoji
        }));
        setParagraphs(paragraphsWithId);
        
        // Resetear estados
        setCurrentIndex(0);
        setIsComplete(false); // Resetear finalización
        setUserInput('');
        setFeedback('');
        setDiffResult([]);
    // setHintUsed(false); // removed, no longer used
        setEmotions([]);
        setPracticeDirection('forward'); // Reset practice direction
        setShowAllLyrics(true); // Reset showAllLyrics to true
    }, [lyrics]);

    const paragraphRenderInfo = useMemo(() => {
        if (paragraphs.length === 0) return new Map();

        const SIMILARITY_THRESHOLD = 0.8;
        const colors = ['#90CAF9', '#F48FB1', '#A5D6A7', '#FFF59D', '#9FA8DA', '#FFCC80', '#80DEEA', '#E6EE9C'];
        let nextColorIndex = 0;
        let nextLabelChar = 'A';

        const textInfoMap = new Map(); // normText -> { color, originalText, label }
        const idToRenderInfo = new Map(); // p.id -> { color, diff, label }

        // Part 1: Similarity Grouping & Initial Labeling
        for (const p of paragraphs) {
            const normText = normalizeText(p.text);
            let foundMatch = false;

            for (const [baseNormText, baseInfo] of textInfoMap.entries()) {
                const changes = diffWords(baseNormText, normText, { ignoreWhitespace: true });
                const totalLength = Math.max(baseNormText.length, normText.length);
                if (totalLength === 0) continue;

                let commonLength = 0;
                changes.forEach(part => {
                    if (!part.added && !part.removed) commonLength += part.value.length;
                });
                const similarity = commonLength / totalLength;

                if (similarity >= SIMILARITY_THRESHOLD) {
                    const diffResult = diffWords(baseInfo.originalText, p.text, { ignoreWhitespace: true });
                    const isVariation = diffResult.some(part => part.added || part.removed);
                    const finalLabel = isVariation ? `${baseInfo.label} (variación)` : baseInfo.label;

                    idToRenderInfo.set(p.id, {
                        color: baseInfo.color,
                        diff: isVariation ? diffResult : null,
                        label: finalLabel
                    });
                    foundMatch = true;
                    break;
                }
            }

            if (!foundMatch) {
                const newColor = colors[nextColorIndex % colors.length];
                const newLabel = `Parte ${nextLabelChar}`;
                nextColorIndex++;
                nextLabelChar = String.fromCharCode(nextLabelChar.charCodeAt(0) + 1);

                textInfoMap.set(normText, { color: newColor, originalText: p.text, label: newLabel });
                idToRenderInfo.set(p.id, { color: newColor, diff: null, label: newLabel });
            }
        }

        // Part 2: Sequence Unification
        const locations = new Map();
        paragraphs.forEach((p, index) => {
            const info = idToRenderInfo.get(p.id);
            if (!info) return;
            const baseLabel = info.label.replace(/ \(.*\)/, '');
            if (!locations.has(baseLabel)) {
                locations.set(baseLabel, []);
            }
            locations.get(baseLabel).push(index);
        });

        for (let i = 0; i < paragraphs.length - 1; i++) {
            const info1 = idToRenderInfo.get(i);
            const info2 = idToRenderInfo.get(i + 1);
            if (!info1 || !info2) continue;

            const baseLabel1 = info1.label.replace(/ \(.*\)/, '');
            const baseLabel2 = info2.label.replace(/ \(.*\)/, '');

            const indices1 = locations.get(baseLabel1);
            const indices2 = locations.get(baseLabel2);

            if (indices1 && indices2 && indices1.length > 1 && indices2.length > 1) {
                const isSequence = indices1.some(idx => indices2.includes(idx + 1));

                if (isSequence && baseLabel1 !== baseLabel2) {
                    const color1 = info1.color; // The color of the dominant part

                    idToRenderInfo.forEach((currentInfo, id) => {
                        const currentBaseLabel = currentInfo.label.replace(/ \(.*\)/, '');
                        if (currentBaseLabel === baseLabel2) {
                            currentInfo.label = currentInfo.label.replace(baseLabel2, baseLabel1);
                            currentInfo.color = color1;
                        }
                    });

                    const mergedIndices = [...(locations.get(baseLabel1) || []), ...(locations.get(baseLabel2) || [])].sort((a, b) => a - b);
                    locations.set(baseLabel1, mergedIndices);
                    locations.delete(baseLabel2);
                }
            }
        }

        return idToRenderInfo;
    }, [paragraphs]);

    const [paragraphEmojis, setParagraphEmojis] = useState({});

    // Load paragraph emojis from localStorage
    useEffect(() => {
        if (!songId) return;
        const storedEmojis = localStorage.getItem(`lyricFlow_paragraphEmojis_${songId}`);
        if (storedEmojis) {
            setParagraphEmojis(JSON.parse(storedEmojis));
        } else {
            setParagraphEmojis({}); // Reset if no emojis for this song
        }
    }, [songId]); // Only depend on songId for loading

    // Save paragraph emojis to localStorage whenever they change
    useEffect(() => {
        if (!songId || Object.keys(paragraphEmojis).length === 0) return; // Only save if there's something to save
        localStorage.setItem(`lyricFlow_paragraphEmojis_${songId}`, JSON.stringify(paragraphEmojis));
    }, [songId, paragraphEmojis]); // Depend on songId and paragraphEmojis for saving

    // Analyze emotions with two-step contextual process

    // Analyze emotions with two-step contextual process
    useEffect(() => {
        const contextualAnalysis = async () => {
            if (paragraphs.length === 0 || !lyrics) return;
            setIsAnalyzing(true);
            const songContext = await emotionService.analyzeSongContext(lyrics);
            const analysisPromises = paragraphs.map(p => emotionService.analyzeEmotion(p.text, songContext));
            const emotionResults = await Promise.all(analysisPromises);
            setEmotions(emotionResults);
            setIsAnalyzing(false);
        };
        contextualAnalysis();
    }, [paragraphs, lyrics]);

    // --- Handlers for navigation in 'learn' mode ---
    const handleNext = () => {
        if (currentIndex < paragraphs.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    // --- Handlers for 'practice' mode ---
    const handleTextSubmit = (e) => {
        e.preventDefault();
        if (!userInput) return;

        const paragraphIdToTrack = mode === 'quickPractice' && originalParagraphIndexForTracking !== null
            ? originalParagraphIndexForTracking
            : paragraphs[currentIndex].id;

        trackParagraphAttempt(songId, paragraphIdToTrack); // Track every attempt

        const normalizedUserInput = normalizeText(userInput);
        const normalizedTarget = normalizeText(paragraphs[currentIndex].text);

        if (normalizedUserInput === normalizedTarget) {
            trackParagraphCorrect(songId, paragraphIdToTrack); // Track correct attempt
            setFeedback('correct');
            setDiffResult([]);
            // setHintUsed(false); // removed, no longer used
            setTimeout(() => {
                if (mode === 'quickPractice') {
                    onFinish(); // In quick practice, finish after one correct paragraph
                } else if (mode === 'deepPractice') {
                    if (paragraphs.length === 1) {
                        // For single paragraph, deep practice is just completing it once
                        setIsComplete(true);
                    } else if (practiceDirection === 'forward') {
                        if (currentIndex < paragraphs.length - 1) {
                            setCurrentIndex(currentIndex + 1);
                            setUserInput('');
                            setFeedback('');
                        } else {
                            // End of forward pass, start reverse pass
                            setPracticeDirection('reverse');
                            setCurrentIndex(currentIndex - 1); // Move to the second-to-last paragraph to skip re-typing the last one
                            setUserInput('');
                            setFeedback('');
                        }
                    } else { // practiceDirection === 'reverse'
                        // Check if this is the very last paragraph of the reverse pass (paragraph 0)
                        if (currentIndex === 0) {
                            setIsComplete(true); // Deep practice complete
                        } else {
                            setCurrentIndex(currentIndex - 1);
                            setUserInput('');
                            setFeedback('');
                        }
                    }
                } else { // Normal practice mode
                    if (currentIndex < paragraphs.length - 1) {
                        setCurrentIndex(currentIndex + 1);
                        setUserInput('');
                        setFeedback('');
                    } else {
                        setIsComplete(true); // Normal practice complete
                    }
                }
            }, 1000);
        } else {
            trackParagraphError(songId, paragraphIdToTrack); // Track incorrect attempt
            setFeedback('incorrect');
            setDiffResult(diffWords(normalizedTarget, normalizedUserInput));
        }
    };

    const handleHint = () => {
        const normalizedTarget = normalizeText(paragraphs[currentIndex].text);
        const normalizedUserInput = normalizeText(userInput);
        const targetWords = normalizedTarget.split(' ');
        const inputWords = normalizedUserInput.split(' ');
        let hintWord = '';
        for (let i = 0; i < targetWords.length; i++) {
            if (i >= inputWords.length || targetWords[i] !== inputWords[i]) {
                hintWord = targetWords[i];
                break;
            }
        }
        if (hintWord) {
            const newUserInput = userInput.length > 0 && !userInput.endsWith(' ') ? userInput + ' ' + hintWord : userInput + hintWord;
            setUserInput(newUserInput);
            setFeedback('');
            setDiffResult([]);
        }
    };

    const handleExamSubmit = (e) => {
        e.preventDefault();
        if (!userInput) return;

        const fullLyrics = paragraphs.map(p => p.text).join('\n\n');
        const normalizedUserInput = normalizeText(userInput);
        const normalizedTarget = normalizeText(fullLyrics);

        if (normalizedUserInput === normalizedTarget) {
            setFeedback('correct');
            setDiffResult([]);
            if (onExamComplete) onExamComplete(songId);
            setIsComplete(true); 
        } else {
            setFeedback('incorrect');
            setDiffResult(diffWords(normalizedTarget, normalizedUserInput));
            if (onExamFailed) onExamFailed(songId);
            setIsComplete(true); // Show results even if incorrect
        }
    };

    if (paragraphs.length === 0) {
        return <div>Cargando letra...</div>;
    }

    // --- Pantalla de Finalización ---
    if (isComplete) {
        return (
            <div className="completion-screen">
                <h2>¡Felicidades!</h2>
                <p>Has completado la sesión de {mode === 'learn' ? 'aprendizaje' : 'práctica'}.</p>
                <button onClick={() => {
                    if ((mode === 'practice' || mode === 'deepPractice') && onRepetitionComplete && songId) {
                        onRepetitionComplete(songId);
                    }
                    onFinish();
                }} className="btn">Volver a la Lista</button>
            </div>
        );
    }

    if (mode === 'exam') {
        if (isComplete) {
            return (
                <div className="completion-screen">
                    <h2>¡Examen Completado!</h2>
                    <p>Este es tu resultado:</p>
                    {feedback === 'incorrect' && diffResult.length > 0 && (
                         <div className="diff-view" style={{textAlign: 'left', whiteSpace: 'pre-wrap', padding: '10px', border: '1px solid #444', maxHeight: '400px', overflowY: 'auto', backgroundColor: '#222', borderRadius: '8px'}}>
                            {diffResult.map((part, index) => {
                                const style = part.added ? { color: '#f48fb1', backgroundColor: '#4a1425' } : // Pinkish for user's additions
                                              part.removed ? { color: '#888', textDecoration: 'line-through' } : // Greyed out for missing parts
                                              { color: '#7cb342', opacity: 0.8 }; // Greenish for correct parts
                                return <span key={index} style={style}>{part.value}</span>;
                            })}
                        </div>
                    )}
                     {feedback === 'correct' && <p style={{color: '#7cb342'}}>¡Perfecto! Has escrito la canción sin errores.</p>}
                    <button onClick={onFinish} className="btn" style={{marginTop: '20px'}}>Volver</button>
                </div>
            );
        }

        return (
            <div className="memorize-screen exam-mode">
                <h1>Examen de Letra</h1>
                <p className="exam-instructions">Escribe la letra completa de la canción. Separa los párrafos con una línea en blanco.</p>
                <form onSubmit={handleExamSubmit} className="text-input-form exam-form">
                    <textarea
                        value={userInput}
                        onChange={(e) => {
                            setUserInput(e.target.value);
                            if (feedback) setFeedback('');
                            if (diffResult.length > 0) setDiffResult([]);
                        }}
                        placeholder="Escribe la letra completa aquí..."
                        className={`text-input feedback-${feedback} exam-textarea`}
                        rows="15"
                    />
                    <button type="submit" className="btn exam-submit-button">Calificar Examen</button>
                </form>
                 <button className="btn secondary-btn exam-cancel-button" onClick={onBack}>Cancelar Examen</button>
            </div>
        );
    }

    const currentParagraphText = paragraphs[currentIndex]?.text;

    return (
        <div className="memorize-screen">
            <h1>{mode === 'learn' ? 'Aprende la Letra' : 'Practica la Letra'}</h1>
            <ProgressBar current={currentIndex} total={paragraphs.length} />

        <div className={`emotion-display${mode === 'quickPractice' ? ' quick-practice-emotion-display' : ''}`}>
                {isAnalyzing ? (
                    <small>Analizando emoción...</small>
                ) : (
                    emotions[currentIndex] && (
                        <span className="emotion-badge" style={{ backgroundColor: getEmotionColor(emotions[currentIndex]) }}>
                            {emotions[currentIndex]}
                        </span>
                    )
                )}
            </div>
            
            <div className={`lyrics-display${mode === 'quickPractice' ? ' quick-practice-lyrics-display' : ''}`}>
                {mode === 'learn' ? (
            showAllLyrics ? (
                <>
                    <div style={{ padding: '10px', border: '1px solid #444', borderRadius: '8px' }}>
                        <div className="layout-switcher" style={{ marginBottom: '15px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <button onClick={() => setLayoutMode('single')} style={layoutMode === 'single' ? {cursor:'default', opacity: 1, borderBottom: '2px solid #90caf9'} : {cursor:'pointer', opacity: 0.6, borderBottom: '2px solid transparent'}} title="Una Columna">
                                Columna
                            </button>
                            <button onClick={() => setLayoutMode('columns')} style={layoutMode === 'columns' ? {cursor:'default', opacity: 1, borderBottom: '2px solid #90caf9'} : {cursor:'pointer', opacity: 0.6, borderBottom: '2px solid transparent'}} title="Dos Columnas">
                                Columnas
                            </button>
                            <button onClick={() => setLayoutMode('grid')} style={layoutMode === 'grid' ? {cursor:'default', opacity: 1, borderBottom: '2px solid #90caf9'} : {cursor:'pointer', opacity: 0.6, borderBottom: '2px solid transparent'}} title="Grid">
                                Grid
                            </button>
                        </div>
                <div className="full-lyrics-display" style={{ whiteSpace: 'pre-wrap' }}>
                    {paragraphs.map((p, pIndex) => {
                        const info = paragraphRenderInfo.get(p.id);
                        if (!info) return null; // Handle case where info might not be found
                        return (
                            <p key={p.id} style={{ marginBottom: '10px', color: info.color }}>
                                {p.text.split('\n').map((line, lineIndex) => (
                                    <div key={lineIndex}>{highlightKeyWord(line)}</div>
                                ))}
                            </p>
                </div>
                    </div>
                </>
            ) : (
                                <div className="current-lyric-cue">
                                    <div className="emoji-controls-container">
                                        {/* Start Emoji Input/Display */}
                                        <button
                                            onClick={() => {
                                                setEditingEmojiParagraphIndex(currentIndex);
                                                setEditingEmojiType('start');
                                            }}
                                            className="emoji-button"
                                            title="Añadir/Editar emoji de inicio"
                                        >
                                            {paragraphEmojis[currentIndex]?.start || '➕'}
                                        </button>
                                        {editingEmojiParagraphIndex === currentIndex && editingEmojiType === 'start' && (
                                            <input
                                                type="text"
                                                value={paragraphEmojis[currentIndex]?.end || ''}
                                                onChange={(e) => setParagraphEmojis(prev => ({
                                                    ...prev,
                                                    [currentIndex]: { ...prev[currentIndex], end: e.target.value }
                                                }))}
                                                onBlur={() => {
                                                    setEditingEmojiParagraphIndex(null);
                                                    setEditingEmojiType(null);
                                                }}
                                                placeholder="Emoji"
                                                className="emoji-input"
                                                autoFocus
                                            />
                                        )}
                                        <div style={{ flexGrow: 1 }}></div>
                                    </div>
                
                                    {currentParagraphText.split('\n').map((line, lineIndex) => (
                                        <p key={lineIndex}>{highlightKeyWord(line)}</p>
                                    ))}
                
                                    <div className="emoji-controls-container">
                                        <div style={{ flexGrow: 1 }}></div>
                                        {/* End Emoji Input/Display */}
                                        <button
                                            onClick={() => {
                                                setEditingEmojiParagraphIndex(currentIndex);
                                                setEditingEmojiType('end');
                                            }}
                                            className="emoji-button"
                                            title="Añadir/Editar emoji de fin"
                                        >
                                            {paragraphEmojis[currentIndex]?.end || '➕'}
                                        </button>
                                        {editingEmojiParagraphIndex === currentIndex && editingEmojiType === 'end' && (
                                            <input
                                                type="text"
                                                value={paragraphEmojis[currentIndex]?.end || ''}
                                                onChange={(e) => setParagraphEmojis(prev => ({
                                                    ...prev,
                                                    [currentIndex]: { ...prev[currentIndex], end: e.target.value }
                                                }))}
                                                onBlur={() => {
                                                    setEditingEmojiParagraphIndex(null);
                                                    setEditingEmojiType(null);
                                                }}
                                                placeholder="Emoji"
                                                className="emoji-input"
                                                autoFocus
                                            />
                                        )}
                                    </div>
                                </div>            )
        ) : mode === 'quickPractice' ? (
                    null // No display for quickPractice mode, context is handled by QuickPracticeScreen
                ) : (
                    <p className="current-lyric-cue">
                        {mode === 'deepPractice' && practiceDirection === 'reverse' ? (
                            <>
                                <span style={{ fontSize: '0.8em', color: '#888' }}>
                                    {paragraphs[currentIndex + 1]?.text || ''}
                                </span>
                                <br />
                                Retrocede
                            </>
                        ) : (currentIndex === 0 ? 'Inicio' : 'Continúa')}
                    </p>
                )}
            </div>

            {mode === 'learn' ? (
                <div className="learn-controls">
                    <button onClick={handlePrev} disabled={currentIndex === 0} className="btn secondary-btn">Anterior</button>
                    {showAllLyrics ? (
                        <button onClick={() => setShowAllLyrics(false)} className="btn">Comenzar Aprendizaje</button>
                    ) : (
                        currentIndex === paragraphs.length - 1 ? (
                            <button onClick={() => setIsComplete(true)} className="btn">Finalizar</button>
                        ) : (
                            <button onClick={handleNext} className="btn secondary-btn">Siguiente</button>
                        )
                    )}
                </div>
            ) : (
                <div className={`practice-controls${mode === 'quickPractice' ? ' quick-practice-controls' : ''}`}>
                    <div className={`mode-selector${mode === 'quickPractice' ? ' quick-practice-mode-selector' : ''}`}>
                        <button onClick={() => setInputMode('text')} className={inputMode === 'text' ? 'active' : ''}>Escribir</button>
                        <button onClick={() => setInputMode('audio')} className={inputMode === 'audio' ? 'active' : ''}>Cantar</button>
                    </div>
                    {inputMode === 'text' ? (
                        <form onSubmit={handleTextSubmit} className={`text-input-form${mode === 'quickPractice' ? ' quick-practice-text-input-form' : ''}`}>
                            <textarea
                                value={userInput}
                                onChange={(e) => {
                                    setUserInput(e.target.value);
                                    if (feedback) setFeedback('');
                                    if (diffResult.length > 0) setDiffResult([]);
                                }}
                                placeholder="Escribe la letra aquí..."
                                className={`text-input feedback-${feedback}`}
                                rows="3"
                            />
                            <button type="submit" className="btn">Comprobar</button>
                            <button type="button" onClick={handleHint} className="btn secondary-btn hint-button">
                                Pista
                            </button>
                        </form>
                    ) : (
                        <div className="audio-input-disabled">
                            <p>🎵 La función de canto es premium 🎵</p>
                            <button className="btn" disabled>Grabar (Próximamente)</button>
                        </div>
                    )}
                </div>

            )}

            <button className="btn secondary-btn back-to-list-button" onClick={onBack}>Volver a la Lista</button>
            
            {feedback && (
                <div className={`user-input-display feedback-${feedback}`}>
                    {feedback === 'correct' && <p style={{color: 'green'}}>¡Correcto!</p>}
                    {feedback === 'incorrect' && (
                        <div>
                            <p>¡Incorrecto! Revisa los detalles:</p>
                            <div className="diff-view">
                                {diffResult.map((part, index) => {
                                    const style = part.added ? { color: 'red', fontWeight: 'bold' } :
                                                  part.removed ? { color: 'grey', textDecoration: 'line-through' } :
                                                  { color: 'black' };
                                    return <span key={index} style={style}>{part.value}</span>;
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MemorizeScreen;