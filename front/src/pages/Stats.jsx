import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHabits, getHeatmap, getStreak } from '../api/habits';

export default function Stats() {
  const [habits, setHabits] = useState([]);
  const [heatmap, setHeatmap] = useState({});
  const [streaks, setStreaks] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const habitsRes = await getHabits();
      setHabits(habitsRes.data);
      
      try {
        const heatmapRes = await getHeatmap();
        setHeatmap(heatmapRes.data.data || {});
      } catch (err) {
        console.error('Ошибка тепловой карты:', err);
      }
      
      const streaksData = {};
      for (const habit of habitsRes.data) {
        try {
          const streakRes = await getStreak(habit.id);
          streaksData[habit.id] = streakRes.data.streak || 0;
        } catch (err) {
          streaksData[habit.id] = 0;
        }
      }
      setStreaks(streaksData);
      
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalHabits = habits.length;
  const today = new Date().toISOString().split('T')[0];
  const completedToday = heatmap[today] || 0;
  const completionPercent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Статистика за неделю
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
  const weeklyTotal = last7Days.reduce((sum, date) => sum + (heatmap[date] || 0), 0);

  // Лучшая серия
  const maxStreak = Object.values(streaks).length > 0 ? Math.max(...Object.values(streaks)) : 0;
  const bestHabit = habits.find(h => streaks[h.id] === maxStreak);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}>Загрузка статистики...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>📊 Статистика привычек</h1>
        <div>
          <button onClick={() => navigate('/')} style={{ marginRight: 10, padding: 8 }}>
            ← На главную
          </button>
          <button onClick={logout} style={{ padding: 8 }}>Выйти</button>
        </div>
      </div>

      {/* Карточки со статистикой */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 16,
        marginTop: 30
      }}>
        <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8, textAlign: 'center', background: '#667eea', color: 'white' }}>
          <h2 style={{ margin: 0, fontSize: 36 }}>{totalHabits}</h2>
          <p>Всего привычек</p>
        </div>

        <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8, textAlign: 'center', background: '#f093fb', color: 'white' }}>
          <h2 style={{ margin: 0, fontSize: 36 }}>{completedToday}</h2>
          <p>Выполнено сегодня</p>
        </div>

        <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8, textAlign: 'center', background: '#4facfe', color: 'white' }}>
          <h2 style={{ margin: 0, fontSize: 36 }}>{completionPercent}%</h2>
          <p>Процент выполнения</p>
        </div>

        <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8, textAlign: 'center', background: '#43e97b', color: 'white' }}>
          <h2 style={{ margin: 0, fontSize: 36 }}>{weeklyTotal}</h2>
          <p>Выполнено за неделю</p>
        </div>
      </div>

      {/* Лучшая серия */}
      {maxStreak > 0 && (
        <div style={{ marginTop: 30, background: '#fa709a', padding: 20, borderRadius: 12, color: 'white', textAlign: 'center' }}>
          <h2 style={{ margin: 0 }}>🏆 Лучшая серия</h2>
          <p style={{ fontSize: 48, margin: '10px 0', fontWeight: 'bold' }}>{maxStreak} дней</p>
          {bestHabit && <p>У привычки <strong>"{bestHabit.title}"</strong></p>}
        </div>
      )}

      {/* Тепловая карта за последние 7 дней */}
      <div style={{ marginTop: 40 }}>
        <h2>🔥 Активность за последние 7 дней</h2>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {last7Days.map(date => {
            const count = heatmap[date] || 0;
            const intensity = count > 0 ? Math.min(count * 30, 255) : 200;
            return (
              <div key={date} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 60,
                  height: 60,
                  backgroundColor: `rgb(${255 - intensity}, ${255 - intensity/2}, ${255 - intensity})`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 18
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

      {/* Список привычек с сериями */}
      <div style={{ marginTop: 40 }}>
        <h2>📋 Все привычки</h2>
        {habits.map(habit => (
          <div key={habit.id} style={{ border: '1px solid #ddd', margin: 10, padding: 15, borderRadius: 8, backgroundColor: '#f9f9f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0 }}>{habit.title}</h3>
                <p style={{ margin: '5px 0', color: '#666' }}>{habit.description}</p>
                <small>Частота: {habit.frequency === 'daily' ? 'Ежедневно' : 'Еженедельно'}</small>
              </div>
              <div style={{ textAlign: 'center', padding: '10px 20px', backgroundColor: streaks[habit.id] > 0 ? '#28a745' : '#6c757d', borderRadius: 8, color: 'white' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{streaks[habit.id] || 0}</div>
                <div style={{ fontSize: 12 }}>дней подряд</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}