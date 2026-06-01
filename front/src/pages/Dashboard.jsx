import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getHabits, createCheckIn, getTemplates, useTemplate, deleteHabit, getTags, addTagToHabit, removeTagFromHabit, getHabitTags, getCheckIns } from '../api/habits';
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
  const [selectedFilterTags, setSelectedFilterTags] = useState([]);
  const [checkInsToday, setCheckInsToday] = useState({});
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
      
      await loadTodayCheckIns(habitsRes.data);
      
      try {
        const tagsRes = await getTags();
        setTags(Array.isArray(tagsRes.data) ? tagsRes.data : []);
        for (const habit of habitsRes.data) {
          loadHabitTags(habit.id);
        }
      } catch (err) {
        console.error('Ошибка загрузки тегов:', err);
        setTags([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayCheckIns = async (habitsList) => {
    const today = new Date().toISOString().split('T')[0];
    const checkInsMap = {};
    
    for (const habit of habitsList) {
      try {
        const res = await getCheckIns(habit.id);
        const hasToday = res.data.some(ci => ci.completed_at.split('T')[0] === today);
        checkInsMap[habit.id] = hasToday;
      } catch (err) {
        checkInsMap[habit.id] = false;
      }
    }
    setCheckInsToday(checkInsMap);
  };

  const loadHabitTags = async (habitId) => {
    try {
      const res = await getHabitTags(habitId);
      setHabitTags(prev => ({ ...prev, [habitId]: res.data }));
    } catch (err) {
      console.error('Ошибка загрузки тегов привычки:', err);
    }
  };

  const handleCheckIn = async (habitId) => {
    if (checkInsToday[habitId]) {
      toast.error('✅ Сегодня уже отмечено');
      return;
    }
    
    try {
      await createCheckIn(habitId);
      toast.success('🎉 Отмечено!');
      setCheckInsToday(prev => ({ ...prev, [habitId]: true }));
      loadData();
    } catch (err) {
      if (err.response?.status === 409 || err.response?.status === 500) {
        toast.error('✅ Уже отмечено сегодня');
        setCheckInsToday(prev => ({ ...prev, [habitId]: true }));
      } else {
        toast.error('❌ Ошибка при отметке');
      }
    }
  };

  const handleDelete = async (habitId) => {
    if (window.confirm('Удалить привычку?')) {
      try {
        await deleteHabit(habitId);
        toast.success('🗑️ Привычка удалена');
        loadData();
      } catch (err) {
        toast.error('❌ Ошибка удаления');
      }
    }
  };

  const handleUseTemplate = async (templateId, templateTitle) => {
    if (window.confirm(`Добавить "${templateTitle}"?`)) {
      try {
        await useTemplate(templateId);
        toast.success('✨ Привычка добавлена из шаблона!');
        loadData();
      } catch (err) {
        toast.error('❌ Ошибка добавления шаблона');
      }
    }
  };

  const handleAddTag = async (habitId) => {
    if (!selectedTagId) return;
    try {
      await addTagToHabit(habitId, selectedTagId);
      toast.success('🏷️ Тег добавлен');
      loadHabitTags(habitId);
      setShowTagModal(null);
      setSelectedTagId('');
    } catch (err) {
      toast.error('❌ Ошибка добавления тега');
    }
  };

  const handleRemoveTag = async (habitId, tagId) => {
    try {
      await removeTagFromHabit(habitId, tagId);
      toast.success('🏷️ Тег удалён');
      loadHabitTags(habitId);
    } catch (err) {
      toast.error('❌ Ошибка удаления тега');
    }
  };

  const toggleFilterTag = (tagId) => {
    setSelectedFilterTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSelectedFilterTags([]);
  };

  const getFilteredHabits = () => {
    if (selectedFilterTags.length === 0) return habits;
    
    return habits.filter(habit => {
      const habitTagIds = (habitTags[habit.id] || []).map(t => t.id);
      return selectedFilterTags.every(tagId => habitTagIds.includes(tagId));
    });
  };

  const filteredHabits = getFilteredHabits();

  if (loading) return <div style={{ textAlign: 'center', padding: 50, color: '#6a7a5a' }}>Загрузка...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
      <Navbar />
      
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <h1 style={{ fontSize: 32, fontWeight: 500, color: '#4a6741', marginBottom: 16 }}>Мои привычки</h1>
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

      {tags.length > 0 && (
        <div style={{ 
          background: 'white', 
          padding: '16px 20px', 
          borderRadius: 20, 
          border: '2px solid #d4c8b8',
          marginBottom: 24
        }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 500, color: '#6a7a5a' }}>🔍 Фильтр по тегам:</span>
            {selectedFilterTags.length > 0 && (
              <span style={{ marginLeft: 12, fontSize: 13, color: '#8a9a7a' }}>
                (выбрано: {selectedFilterTags.length})
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleFilterTag(tag.id)}
                style={{
                  backgroundColor: selectedFilterTags.includes(tag.id) ? tag.color || '#d4e2d4' : 'white',
                  color: selectedFilterTags.includes(tag.id) ? 'white' : '#5a6a4a',
                  border: `2px solid ${tag.color || '#d4e2d4'}`,
                  padding: '6px 16px',
                  borderRadius: 30,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500
                }}
              >
                {tag.name} {selectedFilterTags.includes(tag.id) && '✓'}
              </button>
            ))}
          </div>
          {selectedFilterTags.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 13, color: '#8a9a7a' }}>
                Показано {filteredHabits.length} из {habits.length} привычек
              </span>
              <button
                onClick={clearFilters}
                style={{
                  background: '#f0e0d8',
                  color: '#a87a62',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: 30,
                  cursor: 'pointer',
                  fontSize: 13
                }}
              >
                ✕ Сбросить
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ 
        display: 'flex',
        flexWrap: 'wrap',
        gap: 20,
        justifyContent: 'flex-start'
      }}>
        {filteredHabits.map(habit => (
          <div key={habit.id} style={{ 
            width: 'calc(33.333% - 14px)',
            minWidth: '280px',
            flex: '1 1 auto',
            padding: 20, 
            background: 'white', 
            borderRadius: 20, 
            border: '2px solid #d4c8b8',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 8 }}>
                <h3 style={{ 
                  fontSize: 18, 
                  fontWeight: 600, 
                  color: '#4a6741',
                  margin: 0,
                  wordBreak: 'break-word',
                  flex: 1
                }}>
                  {habit.title}
                </h3>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => navigate(`/habit/edit/${habit.id}`)} style={{
                    padding: '4px 10px',
                    background: '#e8e0d5',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    color: '#5a6a4a',
                    fontSize: 12,
                    fontWeight: 500
                  }}>Изменить</button>
                  <button onClick={() => handleDelete(habit.id)} style={{
                    padding: '4px 10px',
                    background: '#f0e0d8',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    color: '#a87a62',
                    fontSize: 12,
                    fontWeight: 500
                  }}>Удалить</button>
                </div>
              </div>
              
              <p style={{ 
                color: '#5a6a4a', 
                marginBottom: 12, 
                fontSize: 14, 
                fontWeight: 500,
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: '1.4'
              }}>
                {habit.description || '—'}
              </p>
              
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {habitTags[habit.id]?.map(tag => (
                  <span key={tag.id} style={{ 
                    backgroundColor: tag.color || '#c4d4c4', 
                    color: 'white', 
                    padding: '4px 10px', 
                    borderRadius: 16, 
                    fontSize: 11,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    {tag.name}
                    <button onClick={() => handleRemoveTag(habit.id, tag.id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 12 }}>×</button>
                  </span>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
              <button 
                onClick={() => handleCheckIn(habit.id)} 
                style={{ 
                  flex: 1, 
                  padding: '10px 0', 
                  background: checkInsToday[habit.id] ? '#c4d4c4' : '#d4e2d4',
                  color: checkInsToday[habit.id] ? '#8a9a7a' : '#4a6741',
                  border: 'none', 
                  borderRadius: 14, 
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                {checkInsToday[habit.id] ? '✅ Выполнено' : 'Выполнить'}
              </button>
              <button 
                onClick={() => { setSelectedTagId(''); setShowTagModal(habit.id); }} 
                style={{ 
                  padding: '10px 16px', 
                  background: '#e8e0d5', 
                  color: '#5a6a4a', 
                  border: 'none', 
                  borderRadius: 14, 
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500
                }}
              >
                + Тег
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredHabits.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#a8b898' }}>
          {selectedFilterTags.length > 0 
            ? 'Нет привычек с выбранными тегами' 
            : 'У вас пока нет привычек. Нажмите «Новая привычка», чтобы начать.'}
        </div>
      )}

      {templates.length > 0 && (
        <>
          <h2 style={{ margin: '48px 0 20px', fontSize: 24, fontWeight: 500, color: '#4a6741' }}>Шаблоны</h2>
          <div style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12
          }}>
            {templates.map(template => (
              <div key={template.id} style={{ 
                width: 'calc(33.333% - 8px)',
                minWidth: '260px',
                padding: 16, 
                background: 'white', 
                borderRadius: 16, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                border: '2px solid #d4c8b8'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#4a6741', marginBottom: 4, wordBreak: 'break-word' }}>{template.title}</div>
                  <small style={{ color: '#8a9a7a', wordBreak: 'break-word' }}>{template.description}</small>
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
                    fontWeight: 500,
                    marginLeft: 12,
                    whiteSpace: 'nowrap'
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
              style={{ width: '100%', padding: '14px 16px', marginBottom: 20, borderRadius: 14, border: '2px solid #d4c8b8', fontSize: 16 }}
            >
              <option value="">Выберите тег</option>
              {tags.map(tag => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
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