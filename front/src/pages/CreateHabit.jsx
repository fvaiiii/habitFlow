import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createHabit } from '../api/habits';

export default function CreateHabit() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      await createHabit({ title, description, frequency, tags });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось создать привычку');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', padding: 20 }}>
      <h1>Новая привычка</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: '100%', padding: 8, margin: '8px 0', boxSizing: 'border-box' }}
        />
        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: 8, margin: '8px 0', boxSizing: 'border-box' }}
        />
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          style={{ width: '100%', padding: 8, margin: '8px 0', boxSizing: 'border-box' }}
        >
          <option value="daily">Каждый день</option>
          <option value="weekly">Каждую неделю</option>
        </select>
        <input
          type="text"
          placeholder="Теги через запятую (например: здоровье, спорт)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          style={{ width: '100%', padding: 8, margin: '8px 0', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button type="submit" disabled={submitting} style={{ padding: 8 }}>
            {submitting ? 'Сохранение...' : 'Создать'}
          </button>
          <Link to="/" style={{ padding: 8, lineHeight: '32px' }}>
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
