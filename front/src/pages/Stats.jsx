import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHabits, getHeatmap } from '../api/habits';

export default function Stats() {
  const [habits, setHabits] = useState([]);
  const [heatmap, setHeatmap] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [habitsRes, heatmapRes] = await Promise.all([
        getHabits(),
        getHeatmap(),
      ]);
      setHabits(habitsRes.data);
      setHeatmap(heatmapRes.data.data || {});
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
    } finally {
      setLoading(false);
    }
  };

  // Подсчёт статистики
  const totalHabits = habits.length;
  const today = new Date().toISOString().split('T')[0];
  const completedToday = heatmap[today] || 0;
  const completionPercent = totalHabits > 0 
    ? Math.round((completedToday / totalHabits) * 100) 
    : 0;

  // Подсчёт выполненных за неделю
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const completedThisWeek = last7Days.reduce((sum, date) => sum + (heatmap[date] || 0), 0);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div>Загрузка статистики...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Статистика привычек</h1>
        <div>
          <button 
            onClick={() => navigate('/')}
            style={{ marginRight: 10, padding: 8, cursor: 'pointer' }}
          >
            ← На главную
          </button>
          <button onClick={logout} style={{ padding: 8, cursor: 'pointer' }}>
            Выйти
          </button>
        </div>
      </div>

      {/* Карточки со статистикой */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 16,
        marginTop: 30
      }}>
        <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8, textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#007bff' }}>{totalHabits}</h2>
          <p>Всего привычек</p>
        </div>

        <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8, textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#28a745' }}>{completedToday}</h2>
          <p>Выполнено сегодня</p>
        </div>

        <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8, textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#ffc107' }}>{completionPercent}%</h2>
          <p>Процент выполнения сегодня</p>
        </div>

        <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8, textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#17a2b8' }}>{completedThisWeek}</h2>
          <p>Выполнено за неделю</p>
        </div>
      </div>

      {/* Тепловая карта за последние 7 дней */}
      <div style={{ marginTop: 40 }}>
        <h2>Активность за последние 7 дней</h2>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          {last7Days.map(date => {
            const count = heatmap[date] || 0;
            const intensity = count > 0 ? Math.min(count * 30, 255) : 200;
            return (
              <div key={date} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 50,
                  height: 50,
                  backgroundColor: `rgb(${255 - intensity}, ${255 - intensity/2}, ${255 - intensity})`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {count || 0}
                </div>
                <div style={{ fontSize: 12, marginTop: 8 }}>
                  {date.slice(5)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Список привычек с прогрессом */}
      <div style={{ marginTop: 40 }}>
        <h2>Список привычек</h2>
        {habits.map(habit => (
          <div key={habit.id} style={{ border: '1px solid #ddd', margin: 10, padding: 10, borderRadius: 8 }}>
            <h3>{habit.title}</h3>
            <p>{habit.description}</p>
            <p>Частота: {habit.frequency === 'daily' ? 'Ежедневно' : 'Еженедельно'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}