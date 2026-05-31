import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHabits, createCheckIn, getTemplates, useTemplate, deleteHabit, getTags, addTagToHabit, removeTagFromHabit, getHabitTags } from '../api/habits';
import { getMe } from '../api/auth';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [tags, setTags] = useState([]);
  const [habitTags, setHabitTags] = useState({});
  const [loading, setLoading] = useState(true);
  const [showTagModal, setShowTagModal] = useState(null);
  const [selectedTagId, setSelectedTagId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const habitsRes = await getHabits();
      const templatesRes = await getTemplates();
      
      setHabits(habitsRes.data);
      setTemplates(templatesRes.data);
      
      try {
        const tagsRes = await getTags();
        setTags(tagsRes.data);
        for (const habit of habitsRes.data) {
          loadHabitTags(habit.id);
        }
      } catch (err) {
        setTags([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHabitTags = async (habitId) => {
    try {
      const res = await getHabitTags(habitId);
      setHabitTags(prev => ({ ...prev, [habitId]: res.data }));
    } catch (err) {
      console.error('Ошибка загрузки тегов:', err);
    }
  };

  const handleCheckIn = async (habitId) => {
    try {
      await createCheckIn(habitId);
      alert('Отмечено!');
      loadData();
    } catch (err) {
      alert(err.response?.status === 409 ? 'Уже отмечено сегодня' : 'Ошибка');
    }
  };

  const handleDelete = async (habitId) => {
    if (window.confirm('Удалить привычку?')) {
      await deleteHabit(habitId);
      loadData();
    }
  };

  const handleUseTemplate = async (templateId, templateTitle) => {
    if (window.confirm(`Добавить "${templateTitle}"?`)) {
      await useTemplate(templateId);
      loadData();
    }
  };

  const handleAddTag = async (habitId) => {
    if (!selectedTagId) return;
    await addTagToHabit(habitId, selectedTagId);
    loadHabitTags(habitId);
    setShowTagModal(null);
    setSelectedTagId('');
  };

  const handleRemoveTag = async (habitId, tagId) => {
    await removeTagFromHabit(habitId, tagId);
    loadHabitTags(habitId);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50, color: '#6a7a5a' }}>Загрузка...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
      <Navbar />
      
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <h1 style={{ fontSize: 32, fontWeight: 500, color: '#4a6741', marginBottom: 16 }}>
          Мои привычки
        </h1>
        <button 
          onClick={() => navigate('/habit/new')} 
          style={{
            padding: '12px 32px',
            background: '#d4e2d4',
            color: '#4a6741',
            border: 'none',
            borderRadius: 30,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Новая привычка
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
        {habits.map(habit => (
          <div key={habit.id} className="card" style={{ padding: 20, background: 'white', borderRadius: 20, border: '2px solid #d4c8b8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#4a6741' }}>{habit.title}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigate(`/habit/edit/${habit.id}`)} style={{
                  padding: '6px 14px',
                  background: '#e8e0d5',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                  color: '#5a6a4a',
                  fontSize: 13,
                  fontWeight: 500
                }}>Изменить</button>
                <button onClick={() => handleDelete(habit.id)} style={{
                  padding: '6px 14px',
                  background: '#f0e0d8',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                  color: '#a87a62',
                  fontSize: 13,
                  fontWeight: 500
                }}>Удалить</button>
              </div>
            </div>
            <p style={{ color: '#5a6a4a', marginBottom: 12, fontSize: 14, fontWeight: 500 }}>{habit.description}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {habitTags[habit.id]?.map(tag => (
                <span key={tag.id} style={{ 
                  backgroundColor: tag.color || '#c4d4c4', 
                  color: 'white', 
                  padding: '4px 12px', 
                  borderRadius: 16, 
                  fontSize: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {tag.name}
                  <button onClick={() => handleRemoveTag(habit.id, tag.id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                onClick={() => handleCheckIn(habit.id)} 
                style={{ 
                  flex: 1, 
                  padding: '10px 0', 
                  background: '#d4e2d4', 
                  color: '#4a6741', 
                  border: 'none', 
                  borderRadius: 14, 
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                Отметить
              </button>
              <button 
                onClick={() => { setSelectedTagId(''); setShowTagModal(habit.id); }} 
                style={{ 
                  padding: '10px 20px', 
                  background: '#e8e0d5', 
                  color: '#6a7a5a', 
                  border: 'none', 
                  borderRadius: 14, 
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                Добавить тег
              </button>
            </div>
          </div>
        ))}
      </div>

      {habits.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#a8b898' }}>
          У вас пока нет привычек. Нажмите «Новая привычка», чтобы начать.
        </div>
      )}

      {templates.length > 0 && (
        <>
          <h2 style={{ margin: '48px 0 20px', fontSize: 24, fontWeight: 500, color: '#4a6741' }}>Шаблоны</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {templates.map(template => (
              <div key={template.id} style={{ 
                padding: 16, 
                background: 'white', 
                borderRadius: 16, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                border: '2px solid #d4c8b8'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#4a6741', marginBottom: 4 }}>{template.title}</div>
                  <small style={{ color: '#5a6a4a', fontWeight: 500 }}>{template.description}</small>
                </div>
                <button 
                  onClick={() => handleUseTemplate(template.id, template.title)} 
                  style={{ 
                    padding: '6px 16px', 
                    background: '#d4e2d4', 
                    color: '#4a6741', 
                    border: 'none', 
                    borderRadius: 20, 
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500
                  }}
                >
                  Добавить
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {showTagModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.3)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000 
        }}>
          <div style={{ background: 'white', padding: 28, borderRadius: 24, minWidth: 340, border: '2px solid #d4c8b8' }}>
            <h3 style={{ marginBottom: 20, color: '#4a6741', fontWeight: 600 }}>Добавить тег</h3>
            <select
                value={selectedTagId}
                onChange={(e) => setSelectedTagId(e.target.value)}
                style={{
                    width: '100%',
                    padding: '14px 16px',
                    marginBottom: 20,
                    borderRadius: 14,
                    border: '2px solid #d4c8b8',
                    background: 'white',
                    fontSize: 16,
                    cursor: 'pointer'
                }}
                >
                <option value="" style={{ padding: 12 }}>📋 Выберите тег</option>
                {tags.map(tag => (
                    <option key={tag.id} value={tag.id} style={{ padding: 12 }}>
                    {tag.name}
                    </option>
                ))}
                </select>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => handleAddTag(showTagModal)} style={{ flex: 1, padding: 12, background: '#d4e2d4', color: '#4a6741', border: 'none', borderRadius: 14, cursor: 'pointer', fontWeight: 600 }}>Добавить</button>
              <button onClick={() => setShowTagModal(null)} style={{ flex: 1, padding: 12, background: '#f0e0d8', color: '#a87a62', border: 'none', borderRadius: 14, cursor: 'pointer' }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
