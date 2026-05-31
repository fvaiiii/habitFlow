import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getHabit, updateHabit } from '../api/habits';
import Navbar from '../components/Navbar';

export default function HabitEdit() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadHabit();
  }, [id]);

  const loadHabit = async () => {
    try {
      const res = await getHabit(id);
      setTitle(res.data.title);
      setDescription(res.data.description || '');
      setFrequency(res.data.frequency);
    } catch (err) {
      setError('Привычка не найдена');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateHabit(id, { title, description, frequency });
      setSuccess('Привычка успешно обновлена!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError('Ошибка обновления привычки');
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50, color: '#6a7a5a' }}>Загрузка...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
      <Navbar />
      
      <div style={{ background: 'white', padding: 32, borderRadius: 24, border: '2px solid #d4c8b8', marginTop: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 500, color: '#4a6741', marginBottom: 24 }}>Редактировать привычку</h1>
        
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
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#6a7a5a', fontWeight: 500 }}>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%' }}
              rows="4"
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
              disabled={saving}
              style={{ 
                flex: 1,
                padding: '12px 24px', 
                background: '#d4e2d4', 
                color: '#4a6741', 
                border: 'none', 
                borderRadius: 30, 
                fontSize: 15,
                fontWeight: 600, 
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1
              }}
            >
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
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
