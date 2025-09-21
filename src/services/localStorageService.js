const LOCAL_STORAGE_KEY = 'lyricFlow_errorTracking';

const getErrors = () => {
    try {
        const storedErrors = localStorage.getItem(LOCAL_STORAGE_KEY);
        return storedErrors ? JSON.parse(storedErrors) : {};
    } catch (error) {
        console.error("Error al leer de localStorage:", error);
        return {};
    }
};

const saveErrors = (errors) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(errors));
    } catch (error) {
        console.error("Error al guardar en localStorage:", error);
    }
};

const trackParagraphAttempt = (songId, paragraphId) => {
    const errors = getErrors();
    if (!errors[songId]) {
        errors[songId] = {};
    }
    if (!errors[songId][paragraphId]) {
        errors[songId][paragraphId] = {
            errorCount: 0,
            lastAttemptTimestamp: null,
            lastCorrectTimestamp: null // Initialize for future SRS
        };
    }

    errors[songId][paragraphId].lastAttemptTimestamp = new Date().toISOString();
    saveErrors(errors);
};

const trackParagraphError = (songId, paragraphId) => {
    const errors = getErrors();
    if (!errors[songId]) {
        errors[songId] = {};
    }
    if (!errors[songId][paragraphId]) {
        errors[songId][paragraphId] = {
            errorCount: 0,
            lastAttemptTimestamp: null,
            lastCorrectTimestamp: null
        };
    }

    errors[songId][paragraphId].errorCount += 1;
    errors[songId][paragraphId].lastAttemptTimestamp = new Date().toISOString(); // Update attempt timestamp on error
    // lastCorrectTimestamp is NOT updated on error
    saveErrors(errors);
};

const trackParagraphCorrect = (songId, paragraphId) => {
    const errors = getErrors();
    if (!errors[songId]) {
        errors[songId] = {};
    }
    if (!errors[songId][paragraphId]) {
        errors[songId][paragraphId] = {
            errorCount: 0,
            lastAttemptTimestamp: null,
            lastCorrectTimestamp: null
        };
    }

    // Reduce errorCount by 1 (min 0) and update timestamps on a correct attempt
    errors[songId][paragraphId].errorCount = Math.max(0, errors[songId][paragraphId].errorCount - 1);
    errors[songId][paragraphId].lastAttemptTimestamp = new Date().toISOString();
    errors[songId][paragraphId].lastCorrectTimestamp = new Date().toISOString();
    
    saveErrors(errors);
};


const clearParagraphErrors = (songId, paragraphId) => {
    console.log(`Intentando borrar errores para songId: ${songId}, paragraphId: ${paragraphId}`);
    const errors = getErrors();
    if (errors[songId] && errors[songId][paragraphId]) {
        errors[songId][paragraphId].errorCount = 0;
        errors[songId][paragraphId].lastAttemptTimestamp = new Date().toISOString();
        errors[songId][paragraphId].lastCorrectTimestamp = new Date().toISOString();
        saveErrors(errors);
        console.log(`Errores borrados para songId: ${songId}, paragraphId: ${paragraphId}. Nuevo estado:`, errors[songId][paragraphId]);
    } else {
        console.log(`No se encontraron errores para songId: ${songId}, paragraphId: ${paragraphId}`);
    }
};

export { getErrors, saveErrors, trackParagraphAttempt, trackParagraphError, trackParagraphCorrect, clearParagraphErrors };
