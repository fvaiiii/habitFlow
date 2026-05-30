import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password);
      setSuccess('Регистрация успешна!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Ошибка регистрации');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#f5f0e8' }}>
      <div style={{ 
        background: 'white', 
        padding: 48, 
        borderRadius: 28, 
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)', 
        maxWidth: 500, 
        width: '100%',
        border: '2px solid #d4c8b8'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 56 }}>🌿</span>
          <h1 style={{ fontSize: 32, marginTop: 12, color: '#4a6741' }}>HabitFlow</h1>
          <p style={{ color: '#8a9a7a', marginTop: 8, fontSize: 15 }}>Создайте аккаунт</p>
        </div>
        
        {error && (
          <div style={{ 
            background: '#f0e0d8', 
            color: '#a87a62', 
            padding: 16, 
            borderRadius: 14, 
            marginBottom: 24,
            fontSize: 15,
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ 
            background: '#d4e2d4', 
            color: '#4a6741', 
            padding: 16, 
            borderRadius: 14, 
            marginBottom: 24,
            fontSize: 15,
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 10, color: '#6a7a5a', fontWeight: 500, fontSize: 15 }}>Email</label>
            <input 
              type="email" 
              placeholder="example@mail.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ 
                width: '100%', 
                padding: '16px 18px', 
                fontSize: 16,
                borderRadius: 14,
                border: '2px solid #d4c8b8'
              }}
            />
          </div>
          
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', marginBottom: 10, color: '#6a7a5a', fontWeight: 500, fontSize: 15 }}>Пароль</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ 
                width: '100%', 
                padding: '16px 18px', 
                fontSize: 16,
                borderRadius: 14,
                border: '2px solid #d4c8b8'
              }}
            />
          </div>
          
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: 16, 
              background: '#d4e2d4', 
              color: '#4a6741', 
              border: 'none', 
              borderRadius: 16, 
              fontSize: 17, 
              fontWeight: 600, 
              cursor: 'pointer',
              marginBottom: 24
            }}
          >
            Зарегистрироваться
          </button>
        </form>
        
        <p style={{ textAlign: 'center', fontSize: 15 }}>
          <Link to="/login" style={{ color: '#8a9a7a', textDecoration: 'none' }}>Уже есть аккаунт? Войти</Link>
        </p>
      </div>
    </div>
  );
}
