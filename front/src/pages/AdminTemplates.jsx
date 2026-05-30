import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate, getAllUsers } from '../api/habits';
import { getMe } from '../api/auth';

export default function AdminTemplates() {
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', frequency: 'daily' });
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('templates'); // 'templates', 'users'
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      const userRes = await getMe();
      setUser(userRes.data);
      
      if (userRes.data.role !== 'superuser') {
        navigate('/');
        return;
      }
      
      await loadData();
    } catch (err) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [templatesRes, usersRes] = await Promise.all([
        getTemplates(),
        getAllUsers(),
      ]);
      setTemplates(templatesRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    try {
      await createTemplate(formData);
      setFormData({ title: '', description: '', frequency: 'daily' });
      loadData();
    } catch (err) {
      setError('Ошибка создания шаблона');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updateTemplate(id, formData);
      setEditingId(null);
      setFormData({ title: '', description: '', frequency: 'daily' });
      loadData();
    } catch (err) {
      setError('Ошибка обновления');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить шаблон?')) {
      try {
        await deleteTemplate(id);
        loadData();
      } catch (err) {
        alert('Ошибка удаления');
      }
    }
  };

  const startEdit = (template) => {
    setEditingId(template.id);
    setFormData({
      title: template.title,
      description: template.description || '',
      frequency: template.frequency,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', frequency: 'daily' });
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div>Загрузка...</div>;

  if (user?.role !== 'superuser') {
    return null;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>👑 Админ-панель</h1>
        <div>
          <button onClick={() => navigate('/')} style={{ marginRight: 10, padding: 8 }}>
            ← На главную
          </button>
          <button onClick={logout} style={{ padding: 8 }}>Выйти</button>
        </div>
      </div>

      {/* Вкладки */}
      <div style={{ display: 'flex', gap: 10, marginTop: 20, borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('templates')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeTab === 'templates' ? '#007bff' : 'transparent',
            color: activeTab === 'templates' ? 'white' : '#333',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0'
          }}
        >
          📋 Управление шаблонами
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeTab === 'users' ? '#007bff' : 'transparent',
            color: activeTab === 'users' ? 'white' : '#333',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0'
          }}
        >
          👥 Пользователи
        </button>
      </div>

      {activeTab === 'templates' && (
        <>
          {/* Форма создания/редактирования */}
          <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8, marginTop: 20 }}>
            <h2>{editingId ? 'Редактировать шаблон' : 'Создать новый шаблон'}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={editingId ? () => handleUpdate(editingId) : handleCreate}>
              <input
                type="text"
                placeholder="Название шаблона"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{ width: '100%', padding: 8, margin: '8px 0' }}
              />
              <textarea
                placeholder="Описание"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: 8, margin: '8px 0' }}
                rows="3"
              />
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                style={{ width: '100%', padding: 8, margin: '8px 0' }}
              >
                <option value="daily">Ежедневно</option>
                <option value="weekly">Еженедельно</option>
              </select>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" style={{ padding: 8, cursor: 'pointer' }}>
                  {editingId ? '💾 Сохранить' : '➕ Создать'}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} style={{ padding: 8, cursor: 'pointer' }}>
                    ❌ Отмена
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Список шаблонов */}
          <div style={{ marginTop: 30 }}>
            <h2>Существующие шаблоны</h2>
            {templates.length === 0 && <p>Нет шаблонов</p>}
            {templates.map(template => (
              <div key={template.id} style={{ border: '1px solid #ddd', margin: 10, padding: 10, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3>{template.title}</h3>
                    <p>{template.description}</p>
                    <small>Частота: {template.frequency === 'daily' ? 'Ежедневно' : 'Еженедельно'}</small>
                  </div>
                  <div>
                    <button onClick={() => startEdit(template)} style={{ marginRight: 8, padding: '4px 8px' }}>
                      ✏️ Редактировать
                    </button>
                    <button onClick={() => handleDelete(template.id)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 4 }}>
                      🗑️ Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div style={{ marginTop: 20 }}>
          <h2>Список пользователей</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: 10, textAlign: 'left', border: '1px solid #ddd' }}>ID</th>
                <th style={{ padding: 10, textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
                <th style={{ padding: 10, textAlign: 'left', border: '1px solid #ddd' }}>Роль</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ padding: 10, border: '1px solid #ddd' }}>{u.id}</td>
                  <td style={{ padding: 10, border: '1px solid #ddd' }}>{u.email}</td>
                  <td style={{ padding: 10, border: '1px solid #ddd' }}>
                    {u.role === 'superuser' ? '👑 Администратор' : '👤 Пользователь'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}