// ВРЕМЕННАЯ ЗАГЛУШКА ДЛЯ СТРАНИЦЫ ТЕГОВ
// Полноценная страница будет добавлена после реализации бекенда

import { useNavigate } from 'react-router-dom';

export default function Tags() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <h1>⏳ Теги скоро появятся</h1>
      <p>Функционал тегов временно отключен.</p>
      <p>Ожидается добавление эндпоинтов в бекенде.</p>
      <button 
        onClick={() => navigate('/')}
        style={{ marginTop: 20, padding: '8px 16px', cursor: 'pointer' }}
      >
        ← На главную
      </button>
    </div>
  );
}