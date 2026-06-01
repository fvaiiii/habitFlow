import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createHabit, getTags, createTag } from '../api/habits';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

export default function HabitForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#c4d4c4');
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const res = await getTags();
      setTags(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Ошибка загрузки тегов:', err);
      setTags([]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const res = await createTag({ name: newTagName, color: newTagColor });
      setTags([...tags, res.data]);
      setSelectedTags([...selectedTags, res.data.id]);
      setNewTagName('');
      setShowNewTagInput(false);
      toast.success('Тег создан');
    } catch (err) {
      toast.error('Ошибка создания тега');
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Создаём привычку
      const response = await createHabit({ title, description, frequency });
      
      // Добавляем теги к созданной привычке
      if (selectedTags.length > 0 && response.data?.id) {
        // Импортируем addTagToHabit динамически или добавим в импорт
        const { addTagToHabit } = await import('../api/habits');
        for (const tagId of selectedTags) {
          try {
            await addTagToHabit(response.data.id, tagId);
          } catch (tagErr) {
            console.error('Ошибка добавления тега:', tagErr);
          }
        }
      }
      
      toast.success('Привычка успешно создана!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      toast.error('Ошибка создания привычки');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
      <Navbar />
      
      <div style={{ 
        background: 'white', 
        padding: 40, 
        borderRadius: 28, 
        border: '2px solid #d4c8b8', 
        marginTop: 40
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 500, color: '#4a6741', marginBottom: 32, textAlign: 'center' }}>
          Новая привычка
        </h1>
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: 28, width: '100%' }}>
            <label style={{ display: 'block', marginBottom: 12, color: '#6a7a5a', fontWeight: 600, fontSize: 16 }}>
              Название
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Например: Пить воду"
              style={{ 
                width: '100%', 
                boxSizing: 'border-box',
                padding: '16px 20px', 
                fontSize: 16,
                borderRadius: 16,
                border: '2px solid #d4c8b8',
                background: '#fefcf8'
              }}
            />
          </div>

          <div style={{ marginBottom: 28, width: '100%' }}>
            <label style={{ display: 'block', marginBottom: 12, color: '#6a7a5a', fontWeight: 600, fontSize: 16 }}>
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Например: 2 литра в день"
              rows={5}
              style={{ 
                width: '100%', 
                boxSizing: 'border-box',
                padding: '16px 20px', 
                fontSize: 16,
                borderRadius: 16,
                border: '2px solid #d4c8b8',
                background: '#fefcf8',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: 28, width: '100%' }}>
            <label style={{ display: 'block', marginBottom: 12, color: '#6a7a5a', fontWeight: 600, fontSize: 16 }}>
              Частота
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              style={{ 
                width: '100%', 
                boxSizing: 'border-box',
                padding: '16px 20px', 
                fontSize: 16,
                borderRadius: 16,
                border: '2px solid #d4c8b8',
                background: '#fefcf8',
                cursor: 'pointer'
              }}
            >
              <option value="daily">Ежедневно</option>
              <option value="weekly">Еженедельно</option>
            </select>
          </div>

          {/* Выбор тегов */}
          <div style={{ marginBottom: 28, width: '100%' }}>
            <label style={{ display: 'block', marginBottom: 12, color: '#6a7a5a', fontWeight: 600, fontSize: 16 }}>
              Теги
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  style={{
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color || '#d4e2d4' : 'white',
                    color: selectedTags.includes(tag.id) ? 'white' : '#5a6a4a',
                    border: `2px solid ${tag.color || '#d4e2d4'}`,
                    padding: '8px 18px',
                    borderRadius: 30,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                >
                  {tag.name} {selectedTags.includes(tag.id) && '✓'}
                </button>
              ))}
            </div>
            
            {!showNewTagInput ? (
              <button
                type="button"
                onClick={() => setShowNewTagInput(true)}
                style={{
                  background: '#e8e0d5',
                  color: '#5a6a4a',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 30,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                + Создать новый тег
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Название тега"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  style={{ 
                    padding: '12px 16px', 
                    fontSize: 14, 
                    flex: 1,
                    borderRadius: 14,
                    border: '2px solid #d4c8b8',
                    background: '#fefcf8'
                  }}
                />
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  style={{ 
                    width: 55, 
                    height: 45, 
                    cursor: 'pointer', 
                    border: '2px solid #d4c8b8', 
                    borderRadius: 12,
                    background: '#fefcf8'
                  }}
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  style={{
                    background: '#d4e2d4',
                    color: '#4a6741',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 30,
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTagInput(false)}
                  style={{
                    background: '#f0e0d8',
                    color: '#a87a62',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 30,
                    cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 16, width: '100%', marginTop: 20 }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                flex: 1,
                padding: '16px 24px', 
                background: '#d4e2d4', 
                color: '#4a6741', 
                border: 'none', 
                borderRadius: 40, 
                fontSize: 16,
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
                padding: '16px 24px', 
                background: '#e8e0d5', 
                color: '#8a9a7a', 
                border: 'none', 
                borderRadius: 40, 
                fontSize: 16,
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
