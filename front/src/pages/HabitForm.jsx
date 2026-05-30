import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createHabit } from '../api/habits';
import Navbar from '../components/Navbar';

export default function HabitForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createHabit({ title, description, frequency });
      setSuccess('Привычка успешно создана!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError('Ошибка создания привычки');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
      <Navbar />
      
      <div style={{ background: 'white', padding: 32, borderRadius: 24, border: '2px solid #d4c8b8', marginTop: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 500, color: '#4a6741', marginBottom: 24 }}>Новая привычка</h1>
        
        {error && (
          <div style={{ background: '#f0e0d8', color: '#a87a62', padding: 14, borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ background: '#d4e2d4', color: '#4a6741', padding: 14, borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#6a7a5a', fontWeight: 500 }}>Название *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%' }}
              placeholder="Например: Пить воду"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#6a7a5a', fontWeight: 500 }}>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%' }}
              rows="4"
              placeholder="Например: 2 литра в день"
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#6a7a5a', fontWeight: 500 }}>Частота *</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="daily">Ежедневно</option>
              <option value="weekly">Еженедельно</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                flex: 1,
                padding: '12px 24px', 
                background: '#d4e2d4', 
                color: '#4a6741', 
                border: 'none', 
                borderRadius: 30, 
                fontSize: 15,
                fontWeight: 600, 
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Сохранение...' : 'Создать привычку'}
            </button>
            <button 
              type="button"
              onClick={() => navigate('/')}
              style={{ 
                flex: 1,
                padding: '12px 24px', 
                background: '#e8e0d5', 
                color: '#8a9a7a', 
                border: 'none', 
                borderRadius: 30, 
                fontSize: 15,
                fontWeight: 500, 
                cursor: 'pointer'
              }}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
