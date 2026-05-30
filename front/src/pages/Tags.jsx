import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTags, createTag, deleteTag } from '../api/habits';
import Navbar from '../components/Navbar';

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#c4d4c4');
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

  if (loading) return <div style={{ textAlign: 'center', padding: 50, color: '#6a7a5a' }}>Загрузка...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
      <Navbar />
      
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <h1 style={{ fontSize: 32, fontWeight: 500, color: '#4a6741' }}>Управление тегами</h1>
      </div>

      {/* Увеличенная форма создания тега */}
      <div style={{ background: 'white', padding: 32, borderRadius: 24, border: '2px solid #d4c8b8', marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, color: '#4a6741', marginBottom: 20 }}>Создать новый тег</h2>
        {error && <div style={{ background: '#f0e0d8', color: '#a87a62', padding: 14, borderRadius: 12, marginBottom: 20 }}>{error}</div>}
        <form onSubmit={handleCreateTag} style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#6a7a5a', fontWeight: 500 }}>Название тега</label>
            <input
              type="text"
              placeholder="например: Здоровье, Спорт, Работа"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', fontSize: 16 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, color: '#6a7a5a', fontWeight: 500 }}>Цвет</label>
            <input
              type="color"
              value={tagColor}
              onChange={(e) => setTagColor(e.target.value)}
              style={{ width: 70, height: 52, cursor: 'pointer', border: '2px solid #d4c8b8', borderRadius: 12, padding: 4 }}
            />
          </div>
          <button type="submit" style={{ padding: '14px 32px', background: '#d4e2d4', color: '#4a6741', border: 'none', borderRadius: 30, fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>
            Создать тег
          </button>
        </form>
      </div>

      {/* Список тегов */}
      <div style={{ background: 'white', padding: 32, borderRadius: 24, border: '2px solid #d4c8b8' }}>
        <h2 style={{ fontSize: 24, color: '#4a6741', marginBottom: 20 }}>Мои теги</h2>
        {tags.length === 0 && <p style={{ color: '#a8b898', fontSize: 16 }}>У вас пока нет тегов. Создайте первый!</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {tags.map(tag => (
            <div
              key={tag.id}
              style={{
                backgroundColor: tag.color || '#c4d4c4',
                color: 'white',
                padding: '10px 24px',
                borderRadius: 40,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 16
              }}
            >
              <span style={{ fontWeight: 500 }}>{tag.name}</span>
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
