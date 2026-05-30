import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getHabit, updateHabit } from '../api/habits';

export default function HabitEdit() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [error, setError] = useState('');
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

    try {
      await updateHabit(id, { title, description, frequency });
      navigate('/');
    } catch (err) {
      setError('Ошибка обновления привычки');
      setSaving(false);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', padding: 20 }}>
      <h1>Редактировать привычку</h1>
      
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
          />
        </div>

        <div>
          <label>Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: 8, margin: '8px 0' }}
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
          disabled={saving}
          style={{ 
            padding: 10, 
            marginTop: 16, 
            width: '100%',
            backgroundColor: saving ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
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
