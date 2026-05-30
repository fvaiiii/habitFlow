import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHabits, getHeatmap, getStreak } from '../api/habits';
import Navbar from '../components/Navbar';

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
      } catch (err) {}
      
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
    } finally {
      setLoading(false);
    }
  };

  const totalHabits = habits.length;
  const today = new Date().toISOString().split('T')[0];
  const completedToday = heatmap[today] || 0;
  const completionPercent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

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
  const maxStreak = Object.values(streaks).length > 0 ? Math.max(...Object.values(streaks)) : 0;

  if (loading) return <div style={{ textAlign: 'center', padding: 50, color: '#8b9a7a' }}>Загрузка...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
      <Navbar />
      <h1 style={{ fontSize: 28, fontWeight: 500, color: '#7b8a6b', textAlign: 'center', margin: '32px 0' }}>Статистика</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        <div style={{ background: 'white', padding: 24, borderRadius: 20, textAlign: 'center', border: '1px solid #e8e0d5' }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: '#5b7a5a' }}>{totalHabits}</div>
          <div style={{ color: '#b8c8a8', fontSize: 13, marginTop: 8 }}>Всего привычек</div>
        </div>
        <div style={{ background: 'white', padding: 24, borderRadius: 20, textAlign: 'center', border: '1px solid #e8e0d5' }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: '#5b7a5a' }}>{completedToday}</div>
          <div style={{ color: '#b8c8a8', fontSize: 13, marginTop: 8 }}>Выполнено сегодня</div>
        </div>
        <div style={{ background: 'white', padding: 24, borderRadius: 20, textAlign: 'center', border: '1px solid #e8e0d5' }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: '#5b7a5a' }}>{completionPercent}%</div>
          <div style={{ color: '#b8c8a8', fontSize: 13, marginTop: 8 }}>Процент выполнения</div>
        </div>
        <div style={{ background: 'white', padding: 24, borderRadius: 20, textAlign: 'center', border: '1px solid #e8e0d5' }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: '#5b7a5a' }}>{weeklyTotal}</div>
          <div style={{ color: '#b8c8a8', fontSize: 13, marginTop: 8 }}>Выполнено за неделю</div>
        </div>
      </div>

      {maxStreak > 0 && (
        <div style={{ background: '#e8f0e8', padding: 24, borderRadius: 20, textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 14, color: '#7b8a6b', marginBottom: 8 }}>Лучшая серия</div>
          <div style={{ fontSize: 48, fontWeight: 600, color: '#5b7a5a' }}>{maxStreak} дней</div>
        </div>
      )}

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#7b8a6b', marginBottom: 20 }}>Активность за 7 дней</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {last7Days.map(date => {
            const count = heatmap[date] || 0;
            const intensity = Math.min(count * 25, 200);
            return (
              <div key={date} style={{ textAlign: 'center', flex: 1, minWidth: 50 }}>
                <div style={{
                  height: 60,
                  backgroundColor: `rgb(${220 - intensity}, ${210 - intensity/2}, ${190 - intensity/2})`,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 500,
                  fontSize: 18,
                  color: '#5b7a5a',
                  marginBottom: 8
                }}>
                  {count || 0}
                </div>
                <div style={{ fontSize: 11, color: '#b8c8a8' }}>{date.slice(5)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 500, color: '#7b8a6b', marginBottom: 20 }}>Привычки</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {habits.map(habit => (
          <div key={habit.id} style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid #e8e0d5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500, color: '#5b7a5a', marginBottom: 4 }}>{habit.title}</div>
              <small style={{ color: '#b8c8a8' }}>{habit.description}</small>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: streaks[habit.id] > 0 ? '#5b7a5a' : '#c4a882' }}>{streaks[habit.id] || 0}</div>
              <small style={{ color: '#b8c8a8' }}>дней подряд</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
