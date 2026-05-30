import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTags, createTag, deleteTag } from '../api/habits';

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#007bff');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const res = await getTags();
      setTags(res.data);
    } catch (err) {
      console.error('Ошибка загрузки тегов:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    
    try {
      await createTag({ name: tagName, color: tagColor });
      setTagName('');
      loadTags();
    } catch (err) {
      setError('Ошибка создания тега');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (window.confirm('Удалить тег?')) {
      try {
        await deleteTag(tagId);
        loadTags();
      } catch (err) {
        alert('Ошибка удаления');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Управление тегами</h1>
        <div>
          <button onClick={() => navigate('/')} style={{ marginRight: 10, padding: 8 }}>
            ← На главную
          </button>
          <button onClick={logout} style={{ padding: 8 }}>Выйти</button>
        </div>
      </div>

      {/* Форма создания тега */}
      <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8, marginTop: 20 }}>
        <h2>Создать новый тег</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleCreateTag} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Название тега"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            required
            style={{ flex: 1, padding: 8, minWidth: 150 }}
          />
          <input
            type="color"
            value={tagColor}
            onChange={(e) => setTagColor(e.target.value)}
            style={{ width: 50, height: 38, cursor: 'pointer' }}
          />
          <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>➕ Создать</button>
        </form>
      </div>

      {/* Список тегов */}
      <div style={{ marginTop: 30 }}>
        <h2>Мои теги</h2>
        {tags.length === 0 && <p>У вас пока нет тегов. Создайте первый!</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {tags.map(tag => (
            <div
              key={tag.id}
              style={{
                backgroundColor: tag.color || '#007bff',
                color: 'white',
                padding: '8px 16px',
                borderRadius: 20,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>{tag.name}</span>
              <button
                onClick={() => handleDeleteTag(tag.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 18,
                  fontWeight: 'bold'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}