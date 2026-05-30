import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getHabits, 
  createCheckIn, 
  getTemplates, 
  useTemplate, 
  deleteHabit,
  getTags,
  addTagToHabit,
  removeTagFromHabit,
  getHabitTags
} from '../api/habits';
import { getMe } from '../api/auth';

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [tags, setTags] = useState([]);
  const [habitTags, setHabitTags] = useState({});
  const [loading, setLoading] = useState(true);
  const [showTagModal, setShowTagModal] = useState(null);
  const [selectedTagId, setSelectedTagId] = useState('');
  const [userRole, setUserRole] = useState('');
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
      
      // Загружаем информацию о пользователе для проверки роли
      try {
        const userRes = await getMe();
        setUserRole(userRes.data.role);
      } catch (err) {
        console.error('Ошибка загрузки роли пользователя:', err);
      }
      
      // Пробуем загрузить теги (если бекенд их ещё не добавил)
      try {
        const tagsRes = await getTags();
        setTags(tagsRes.data);
        // Загружаем теги для каждой привычки
        for (const habit of habitsRes.data) {
          loadHabitTags(habit.id);
        }
      } catch (tagErr) {
        console.warn('Теги временно недоступны (404):', tagErr);
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
      console.error('Ошибка загрузки тегов привычки:', err);
    }
  };

  const handleCheckIn = async (habitId) => {
    try {
      await createCheckIn(habitId);
      alert('✅ Отмечено!');
      loadData();
    } catch (err) {
      if (err.response?.status === 409) {
        alert('⚠️ Сегодня уже отмечено');
      } else {
        alert('❌ Ошибка');
      }
    }
  };

  const handleDelete = async (habitId) => {
    if (window.confirm('Удалить привычку?')) {
      try {
        await deleteHabit(habitId);
        alert('Привычка удалена');
        loadData();
      } catch (err) {
        alert('Ошибка удаления');
      }
    }
  };

  const handleUseTemplate = async (templateId, templateTitle) => {
    if (window.confirm(`Добавить привычку "${templateTitle}" из шаблона?`)) {
      try {
        await useTemplate(templateId);
        alert('✅ Привычка добавлена из шаблона!');
        loadData();
      } catch (err) {
        alert('❌ Ошибка добавления шаблона');
      }
    }
  };

  const handleAddTag = async (habitId) => {
    if (!selectedTagId) return;
    try {
      await addTagToHabit(habitId, selectedTagId);
      loadHabitTags(habitId);
      setShowTagModal(null);
      setSelectedTagId('');
    } catch (err) {
      alert('Ошибка добавления тега');
    }
  };

  const handleRemoveTag = async (habitId, tagId) => {
    try {
      await removeTagFromHabit(habitId, tagId);
      loadHabitTags(habitId);
    } catch (err) {
      alert('Ошибка удаления тега');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}>Загрузка...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      {/* Верхнее меню с кнопками */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Мои привычки</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/stats')}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: 4 }}
          >
            📊 Статистика
          </button>
          <button 
            onClick={() => navigate('/profile')}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: 4 }}
          >
            👤 Профиль
          </button>
          <button 
            onClick={() => navigate('/tags')}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: 4 }}
          >
            🏷️ Теги
          </button>
          {userRole === 'superuser' && (
            <button 
              onClick={() => navigate('/admin')}
              style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: 4 }}
            >
              👑 Админ
            </button>
          )}
          <button 
            onClick={logout}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 4 }}
          >
            Выйти
          </button>
        </div>
      </div>
      
      {/* Кнопка создания привычки */}
      <button 
        onClick={() => navigate('/habit/new')}
        style={{ margin: '20px 0', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 4, fontSize: 16 }}
      >
        ➕ Создать привычку
      </button>

      {/* Список привычек пользователя */}
      <h2 style={{ marginBottom: 16 }}>Мои привычки</h2>
      {habits.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', padding: 40 }}>Нет привычек. Создайте первую!</p>
      )}
      {habits.map(habit => (
        <div key={habit.id} style={{ border: '1px solid #e0e0e0', marginBottom: 12, padding: 16, borderRadius: 12, backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>{habit.title}</h3>
              <p style={{ margin: '8px 0', color: '#666' }}>{habit.description}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
                Частота: {habit.frequency === 'daily' ? 'Ежедневно' : 'Еженедельно'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={() => navigate(`/habit/edit/${habit.id}`)}
                style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: 4 }}
              >
                ✏️ Редактировать
              </button>
              <button 
                onClick={() => handleDelete(habit.id)}
                style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 4 }}
              >
                🗑️ Удалить
              </button>
            </div>
          </div>
          
          {/* Теги привычки */}
          {habitTags[habit.id]?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {habitTags[habit.id].map(tag => (
                <span
                  key={tag.id}
                  style={{
                    backgroundColor: tag.color || '#007bff',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    marginRight: 8,
                    display: 'inline-block'
                  }}
                >
                  {tag.name}
                  <button
                    onClick={() => handleRemoveTag(habit.id, tag.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      marginLeft: 8,
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button 
              onClick={() => handleCheckIn(habit.id)}
              style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 4 }}
            >
              ✅ Отметить
            </button>
            <button
              onClick={() => {
                setSelectedTagId('');
                setShowTagModal(habit.id);
              }}
              style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: 4 }}
            >
              🏷️ Добавить тег
            </button>
          </div>
        </div>
      ))}

      {/* Шаблоны привычек */}
      {templates.length > 0 && (
        <>
          <h2 style={{ margin: '24px 0 16px' }}>Шаблоны привычек</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {templates.map(template => (
              <div key={template.id} style={{ border: '1px solid #e0e0e0', padding: 12, borderRadius: 8, backgroundColor: '#f8f9fa' }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{template.title}</h3>
                <p style={{ margin: '4px 0', color: '#666', fontSize: 14 }}>{template.description}</p>
                <p style={{ margin: '4px 0', fontSize: 12, color: '#999' }}>
                  Частота: {template.frequency === 'daily' ? 'Каждый день' : 'Каждую неделю'}
                </p>
                <button 
                  onClick={() => handleUseTemplate(template.id, template.title)}
                  style={{ marginTop: 8, padding: '6px 12px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 4 }}
                >
                  ➕ Добавить из шаблона
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Модальное окно добавления тега */}
      {showTagModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 12, minWidth: 320 }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Добавить тег</h3>
            <select
              value={selectedTagId}
              onChange={(e) => setSelectedTagId(e.target.value)}
              style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 4, border: '1px solid #ddd' }}
            >
              <option value="">Выберите тег</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                onClick={() => handleAddTag(showTagModal)} 
                style={{ flex: 1, padding: 10, cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 4 }}
              >
                Добавить
              </button>
              <button 
                onClick={() => setShowTagModal(null)} 
                style={{ flex: 1, padding: 10, cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: 4 }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}