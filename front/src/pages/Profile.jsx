import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api/auth';
import Navbar from '../components/Navbar';

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
      setUser(res.data);
    } catch (err) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50, color: '#8b9a7a' }}>Загрузка...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
      <Navbar />
      <div style={{ background: 'white', borderRadius: 24, padding: 32, marginTop: 32, border: '1px solid #e8e0d5' }}>
        <h1 style={{ fontSize: 28, fontWeight: 500, color: '#5b7a5a', marginBottom: 24 }}>Профиль</h1>
        <div style={{ borderTop: '1px solid #e8e0d5', paddingTop: 20 }}>
          <p><strong style={{ color: '#8b9a7a' }}>ID:</strong> <span style={{ color: '#5b7a5a' }}>{user.id}</span></p>
          <p style={{ marginTop: 12 }}><strong style={{ color: '#8b9a7a' }}>Email:</strong> <span style={{ color: '#5b7a5a' }}>{user.email}</span></p>
          <p style={{ marginTop: 12 }}>
            <strong style={{ color: '#8b9a7a' }}>Роль:</strong> 
            <span style={{ color: '#5b7a5a' }}> {user.role === 'superuser' ? 'Администратор' : 'Пользователь'}</span>
          </p>
        </div>
        <button onClick={logout} style={{ marginTop: 32, padding: '12px 24px', background: '#f0e0d8', color: '#c4a882', border: 'none', borderRadius: 16, cursor: 'pointer', fontSize: 14 }}>
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
