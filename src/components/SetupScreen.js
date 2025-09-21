import React, { useState } from 'react';

function SetupScreen({ onStart }) {
  const [lyrics, setLyrics] = useState('');

  const handleStart = () => {
    if (lyrics.trim()) {
      onStart(lyrics);
    }
  };

  return (
    <div className="setup-screen">
      <h1>Lyric-Flow</h1>
      <h2>Pega la letra de tu canción para empezar</h2>
      <textarea
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        placeholder="Érase una vez una cabra...
En el corral de la granja...
La cabra comía pan...
Junto a los otros animales..."
      />
      <button className="btn" onClick={handleStart} disabled={!lyrics.trim()}>
        Memorizar
      </button>
    </div>
  );
}

export default SetupScreen;
