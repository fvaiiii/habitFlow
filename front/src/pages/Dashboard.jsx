import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHabits, createCheckIn } from '../api/habits';

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const res = await getHabits();
      setHabits(res.data);
    } catch (err) {
      console.error('Ошибка загрузки привычек:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (habitId) => {
    try {
      await createCheckIn(habitId);
      alert('✅ Отмечено!');
      loadHabits(); // обновляем список
    } catch (err) {
      if (err.response?.status === 409) {
        alert('⚠️ Сегодня уже отмечено');
      } else {
        alert('❌ Ошибка');
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
      {habits.length === 0 && <p>Нет привычек. Создайте первую!</p>}
      {habits.map(habit => (
        <div key={habit.id} style={{ border: '1px solid #ccc', margin: 10, padding: 10, borderRadius: 8 }}>
          <h3>{habit.title}</h3>
          <p>{habit.description}</p>
          <button onClick={() => handleCheckIn(habit.id)}>✅ Отметить</button>
        </div>
      ))}
    </div>
  );
}