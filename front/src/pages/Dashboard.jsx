import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHabits, createCheckIn } from '../api/habits';
import { getTemplates, useTemplate } from '../api/templates';

const frequencyLabel = {
  daily: 'Каждый день',
  weekly: 'Каждую неделю',
};

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

  const handleUseTemplate = async (templateId) => {
    try {
      await useTemplate(templateId);
      alert('✅ Привычка добавлена из шаблона');
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || '❌ Не удалось добавить из шаблона');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Мои привычки</h1>
        <button onClick={logout}>Выйти</button>
      </div>

      <button
        onClick={() => navigate('/habit/new')}
        style={{ margin: '20px 0', padding: 10 }}
      >
        ➕ Создать привычку
      </button>

      {templates.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, textAlign: 'left' }}>Шаблоны привычек</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {templates.map((template) => (
              <div
                key={template.id}
                style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, textAlign: 'left' }}
              >
                <h3 style={{ margin: '0 0 4px' }}>{template.title}</h3>
                <p style={{ margin: '0 0 8px', color: '#666' }}>{template.description}</p>
                <p style={{ margin: '0 0 8px', fontSize: 14, color: '#888' }}>
                  {frequencyLabel[template.frequency] || template.frequency}
                </p>
                <button onClick={() => handleUseTemplate(template.id)}>
                  Добавить из шаблона
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {habits.length === 0 && <p>Нет привычек. Создайте первую или выберите шаблон!</p>}
      {habits.map((habit) => (
        <div key={habit.id} style={{ border: '1px solid #ccc', margin: 10, padding: 10, borderRadius: 8 }}>
          <h3>{habit.title}</h3>
          <p>{habit.description}</p>
          {habit.tags?.length > 0 && (
            <p style={{ fontSize: 14, color: '#666' }}>
              {habit.tags.map((tag) => tag.name).join(', ')}
            </p>
          )}
          <button onClick={() => handleCheckIn(habit.id)}>✅ Отметить</button>
        </div>
      ))}
    </div>
  );
}
