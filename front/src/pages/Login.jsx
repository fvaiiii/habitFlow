import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      localStorage.setItem('token', res.data.token);
      toast.success('Вход выполнен!');
      window.location.href = '/';
    } catch (err) {
      toast.error('Неверный email или пароль');
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 20, 
      background: '#f5f0e8' 
    }}>
      <div style={{ 
        background: 'white', 
        padding: 48, 
        borderRadius: 28, 
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)', 
        maxWidth: 480, 
        width: '100%',
        border: '2px solid #d4c8b8'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 56 }}>🌿</span>
          <h1 style={{ fontSize: 32, marginTop: 12, color: '#4a6741' }}>HabitFlow</h1>
          <p style={{ color: '#8a9a7a', marginTop: 8, fontSize: 15 }}>Войдите в аккаунт</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: 24, width: '100%' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 10, 
              color: '#6a7a5a', 
              fontWeight: 500, 
              fontSize: 15 
            }}>
              Email
            </label>
            <input 
              type="email" 
              placeholder="example@mail.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={loading}
              style={{ 
                width: '100%', 
                boxSizing: 'border-box',
                padding: '16px 18px', 
                fontSize: 16,
                borderRadius: 14,
                border: '2px solid #d4c8b8',
                background: '#fefcf8'
              }}
            />
          </div>
          
          <div style={{ marginBottom: 28, width: '100%' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 10, 
              color: '#6a7a5a', 
              fontWeight: 500, 
              fontSize: 15 
            }}>
              Пароль
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={loading}
              style={{ 
                width: '100%', 
                boxSizing: 'border-box',
                padding: '16px 18px', 
                fontSize: 16,
                borderRadius: 14,
                border: '2px solid #d4c8b8',
                background: '#fefcf8'
              }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              boxSizing: 'border-box',
              padding: 16, 
              background: '#d4e2d4', 
              color: '#4a6741', 
              border: 'none', 
              borderRadius: 16, 
              fontSize: 17, 
              fontWeight: 600, 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginBottom: 24
            }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', fontSize: 15 }}>
          <Link to="/register" style={{ color: '#8a9a7a', textDecoration: 'none' }}>
            Нет аккаунта? Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
