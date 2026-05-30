import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getHabits, 
  createCheckIn, 
  getTemplates, 
  useTemplate, 
  deleteHabit,
  // ТЕГИ - ВРЕМЕННО ЗАКОММЕНТИРОВАНЫ
  // getTags,
  // addTagToHabit,
  // removeTagFromHabit,
  // getHabitTags
} from '../api/habits';

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [templates, setTemplates] = useState([]);
  // ТЕГИ - ВРЕМЕННО ЗАКОММЕНТИРОВАНЫ
  // const [tags, setTags] = useState([]);
  // const [habitTags, setHabitTags] = useState({});
  // const [showTagModal, setShowTagModal] = useState(null);
  // const [selectedTagId, setSelectedTagId] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // БЕЗ ТЕГОВ - загружаем только привычки и шаблоны
      const [habitsRes, templatesRes] = await Promise.all([
        getHabits(),
        getTemplates(),
      ]);
      setHabits(habitsRes.data);
      setTemplates(templatesRes.data);
      
      // ТЕГИ - ВРЕМЕННО ЗАКОММЕНТИРОВАНЫ
      // setTags(tagsRes.data);
      // for (const habit of habitsRes.data) {
      //   loadHabitTags(habit.id);
      // }
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  // ТЕГИ - ВРЕМЕННО ЗАКОММЕНТИРОВАНЫ
  // const loadHabitTags = async (habitId) => {
  //   try {
  //     const res = await getHabitTags(habitId);
  //     setHabitTags(prev => ({ ...prev, [habitId]: res.data }));
  //   } catch (err) {
  //     console.error('Ошибка загрузки тегов привычки:', err);
  //   }
  // };

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

  // ТЕГИ - ВРЕМЕННО ЗАКОММЕНТИРОВАНЫ
  // const handleAddTag = async (habitId) => {
  //   if (!selectedTagId) return;
  //   try {
  //     await addTagToHabit(habitId, selectedTagId);
  //     loadHabitTags(habitId);
  //     setShowTagModal(null);
  //     setSelectedTagId('');
  //   } catch (err) {
  //     alert('Ошибка добавления тега');
  //   }
  // };

  // const handleRemoveTag = async (habitId, tagId) => {
  //   try {
  //     await removeTagFromHabit(habitId, tagId);
  //     loadHabitTags(habitId);
  //   } catch (err) {
  //     alert('Ошибка удаления тега');
  //   }
  // };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Мои привычки</h1>
        <div>
            <button 
            onClick={() => navigate('/stats')}
            style={{ marginRight: 10, padding: '8px 16px', cursor: 'pointer' }}
            >
            📊 Статистика
            </button>
            <button 
            onClick={() => navigate('/profile')}
            style={{ marginRight: 10, padding: '8px 16px', cursor: 'pointer' }}
            >
            👤 Профиль
            </button>
            <button onClick={logout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Выйти
            </button>
        </div>
      </div>
      
      <button 
        onClick={() => navigate('/habit/new')}
        style={{ margin: '20px 0', padding: 10, cursor: 'pointer' }}
      >
        ➕ Создать привычку
      </button>

      {/* Список привычек пользователя */}
      <h2>Мои привычки</h2>
      {habits.length === 0 && <p>Нет привычек. Создайте первую!</p>}
      {habits.map(habit => (
        <div key={habit.id} style={{ border: '1px solid #ccc', margin: 10, padding: 10, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>{habit.title}</h3>
            <div>
              <button 
                onClick={() => navigate(`/habit/edit/${habit.id}`)}
                style={{ marginRight: 8, padding: '4px 8px', cursor: 'pointer' }}
              >
                ✏️ Редактировать
              </button>
              <button 
                onClick={() => handleDelete(habit.id)}
                style={{ padding: '4px 8px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 4 }}
              >
                🗑️ Удалить
              </button>
            </div>
          </div>
          <p>{habit.description}</p>
          <p>Частота: {habit.frequency === 'daily' ? 'Ежедневно' : 'Еженедельно'}</p>
          
          {/* ТЕГИ - ВРЕМЕННО ЗАКОММЕНТИРОВАНЫ */}
          {/* Теги привычки */}
          {/* {habitTags[habit.id]?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {habitTags[habit.id].map(tag => (
                <span
                  key={tag.id}
                  style={{
                    backgroundColor: tag.color,
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 12,
                    fontSize: 12,
                    marginRight: 5,
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
                      marginLeft: 5,
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )} */}
          
          <div style={{ marginTop: 8 }}>
            <button 
              onClick={() => handleCheckIn(habit.id)}
              style={{ marginRight: 8 }}
            >
              ✅ Отметить
            </button>
            {/* ТЕГИ - ВРЕМЕННО ЗАКОММЕНТИРОВАНЫ */}
            {/* <button
              onClick={() => {
                setSelectedTagId('');
                setShowTagModal(habit.id);
              }}
              style={{ fontSize: 12 }}
            >
              🏷️ Добавить тег
            </button> */}
          </div>
        </div>
      ))}

      {/* Шаблоны привычек */}
      {templates.length > 0 && (
        <>
          <h2>Шаблоны привычек</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {templates.map(template => (
              <div key={template.id} style={{ border: '1px solid #ddd', padding: 10, borderRadius: 8 }}>
                <h3 style={{ margin: 0 }}>{template.title}</h3>
                <p>{template.description}</p>
                <button onClick={() => handleUseTemplate(template.id, template.title)}>
                  ➕ Добавить себе
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ТЕГИ - ВРЕМЕННО ЗАКОММЕНТИРОВАНЫ */}
      {/* Модальное окно добавления тега */}
      {/* {showTagModal && (
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
          <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, minWidth: 300 }}>
            <h3>Добавить тег</h3>
            <select
              value={selectedTagId}
              onChange={(e) => setSelectedTagId(e.target.value)}
              style={{ width: '100%', padding: 8, margin: '10px 0' }}
            >
              <option value="">Выберите тег</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleAddTag(showTagModal)} style={{ flex: 1, cursor: 'pointer' }}>Добавить</button>
              <button onClick={() => setShowTagModal(null)} style={{ flex: 1, cursor: 'pointer' }}>Отмена</button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}