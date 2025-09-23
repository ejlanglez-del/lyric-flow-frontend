import { useState } from 'react';

// ⬇️ Opción A (ruta más común). Si da error, borra esta línea y usa la Opción B.
// import SongListScreen from './components/SongListScreen';

// ⬇️ Opción B (si la A falla, descomenta esta).
// import SongListScreen from './SongListScreen';

export default function App() {
  // Estado para cambiar de pantalla
  const [screen, setScreen] = useState('home');

  // Canciones de prueba (luego las pides a tu backend)
  const [songs, setSongs] = useState([
    {_id:'1', title:'Canción Demo 1', artist:'Artista X', completedSessions:2, examLevel:1},
    {_id:'2', title:'Canción Demo 2', artist:'Artista Y', completedSessions:0, examLevel:0},
  ]);

  function openLibrary() {
    console.log('Abriendo biblioteca');
    setScreen('library');
  }

  function backToPanel() {
    console.log('Volver al panel');
    setScreen('home');
  }

  // Acciones “demo” que espera SongListScreen:
  function onSelectForLearning(song) {
    alert('Aprender: ' + (song?.title || ''));
  }
  function onSelectSong(song, mode) {
    alert(`Abrir canción: ${(song?.title || '')} | modo=${mode||'normal'}`);
  }
  function onEditSong(song) {
    alert('Editar: ' + (song?.title || ''));
  }
  function onDeleteSong(id) {
    setSongs(prev => prev.filter(s => s._id !== id));
    alert('Eliminado: ' + id);
  }

  if (screen === 'home') {
    // ⬇️ AQUÍ está el botón que querías que funcione
    return (
      <div style={{ padding: 16 }}>
        <h1>Panel</h1>
        <button className="btn" type="button" onClick={openLibrary}>
          Ver Mi Biblioteca ➔
        </button>
      </div>
    );
  }

  // Pantalla de Biblioteca
  return (
    <SongListScreen
      songs={songs}
      onBack={backToPanel}
      onSelectForLearning={onSelectForLearning}
      onSelectSong={onSelectSong}
      onEditSong={onEditSong}
      onDeleteSong={onDeleteSong}
      isExamMode={false}
    />
  );
}
