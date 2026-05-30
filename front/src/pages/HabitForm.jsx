import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createHabit } from '../api/habits';

export default function HabitForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createHabit({ title, description, frequency });
      navigate('/'); // Возвращаемся на главную
    } catch (err) {
      setError('Ошибка создания привычки');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', padding: 20 }}>
      <h1>Новая привычка</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Название *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: 8, margin: '8px 0' }}
            placeholder="Например: Пить воду"
          />
        </div>

        <div>
          <label>Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: 8, margin: '8px 0' }}
            placeholder="Например: 2 литра в день"
            rows="3"
          />
        </div>

        <div>
          <label>Частота *</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            style={{ width: '100%', padding: 8, margin: '8px 0' }}
          >
            <option value="daily">Ежедневно</option>
            <option value="weekly">Еженедельно</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: 10, 
            marginTop: 16, 
            width: '100%',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Сохранение...' : 'Создать привычку'}
        </button>
      </form>
      
      <button 
        onClick={() => navigate('/')}
        style={{ marginTop: 16, width: '100%', padding: 10 }}
      >
        Отмена
      </button>
    </div>
  );
}