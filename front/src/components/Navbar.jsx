import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMe } from '../api/auth';

export default function Navbar() {
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await getMe();
        setUserRole(res.data.role);
      } catch (err) {
        console.error('Ошибка загрузки роли');
      }
    };
    loadUser();
  }, []);

  const tabs = [
    { name: 'Главная', path: '/', key: 'home' },
    { name: 'Статистика', path: '/stats', key: 'stats' },
    { name: 'Профиль', path: '/profile', key: 'profile' },
    { name: 'Теги', path: '/tags', key: 'tags' },
  ];

  if (userRole === 'superuser') {
    tabs.push({ name: 'Админ', path: '/admin', key: 'admin' });
  }

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #e8e0d5',
      padding: '0 24px',
      marginBottom: 32,
      borderRadius: '0',
      boxShadow: 'none'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span style={{ fontSize: 28 }}>🌿</span>
          <span style={{ fontSize: 22, fontWeight: 500, color: '#7b8a6b' }}>
            HabitFlow
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              style={{
                padding: '12px 24px',
                background: location.pathname === tab.path ? '#e8f0e8' : 'transparent',
                color: location.pathname === tab.path ? '#5b7a5a' : '#8b9a7a',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: location.pathname === tab.path ? 600 : 500,
                transition: 'all 0.2s'
              }}
            >
              {tab.name}
            </button>
          ))}
          <button
            onClick={logout}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: '#c4a882',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 500
            }}
          >
            Выйти
          </button>
        </div>
      </div>
    </nav>
  );
}
