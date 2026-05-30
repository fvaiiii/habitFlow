import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      localStorage.setItem('token', res.data.token);
      window.location.href = '/';
    } catch (err) {
      setError('Неверный email или пароль');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto' }}>
      <h1>Вход</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 8, margin: '8px 0' }}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 8, margin: '8px 0' }}
        />
        <button type="submit" style={{ padding: 8, marginTop: 8 }}>Войти</button>
      </form>
      <Link to="/register">Нет аккаунта? Зарегистрироваться</Link>
    </div>
  );
}