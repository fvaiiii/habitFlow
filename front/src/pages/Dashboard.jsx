import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHabits, createCheckIn, getTemplates, useTemplate, deleteHabit } from '../api/habits';

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [habitsRes, templatesRes] = await Promise.all([
        getHabits(),
        getTemplates(),
      ]);
      setHabits(habitsRes.data);
      setTemplates(templatesRes.data);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
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
          <button onClick={() => handleCheckIn(habit.id)}>✅ Отметить</button>
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
    </div>
  );
}