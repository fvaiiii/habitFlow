import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api/auth';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res = await getMe();
      console.log('Данные пользователя:', res.data);
      setUser(res.data);
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Профиль</h1>
        <button onClick={() => navigate('/')}>← На главную</button>
      </div>

      <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8, marginTop: 20 }}>
        <h2>Информация о пользователе</h2>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Роль:</strong> {
          user.role === 'superuser' 
            ? '👑 Администратор' 
            : user.role === 'admin' 
              ? '👑 Администратор'
              : '👤 Пользователь'
        }</p>
        <p><strong>Дата регистрации:</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'скоро появится'}</p>
      </div>

      <button 
        onClick={logout}
        style={{ marginTop: 20, padding: 10, width: '100%', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 4 }}
      >
        Выйти из аккаунта
      </button>
    </div>
  );
}