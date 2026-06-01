import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate, getAllUsers } from '../api/habits';
import { getMe } from '../api/auth';
import Navbar from '../components/Navbar';

export default function AdminTemplates() {
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', frequency: 'daily' });
  const [activeTab, setActiveTab] = useState('templates');
  const navigate = useNavigate();
  const formRef = useRef(null);

  const scrollToForm = () => {
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        formRef.current.style.transition = 'box-shadow 0.3s';
        formRef.current.style.boxShadow = '0 0 0 3px #d4e2d4';
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.style.boxShadow = '';
          }
        }, 1500);
      }
    }, 100);
  };

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
      toast.success('✨ Шаблон создан!');
      loadData();
    } catch (err) {
      toast.error('❌ Ошибка создания шаблона');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updateTemplate(id, formData);
      setEditingId(null);
      setFormData({ title: '', description: '', frequency: 'daily' });
      toast.success('✏️ Шаблон обновлён!');
      loadData();
    } catch (err) {
      toast.error('❌ Ошибка обновления');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить шаблон?')) {
      try {
        await deleteTemplate(id);
        toast.success('🗑️ Шаблон удалён!');
        loadData();
      } catch (err) {
        toast.error('❌ Ошибка удаления');
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
    scrollToForm();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', frequency: 'daily' });
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50, color: '#6a7a5a' }}>Загрузка...</div>;
  if (user?.role !== 'superuser') return null;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px' }}>
      <Navbar />
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <h1 style={{ fontSize: 32, fontWeight: 500, color: '#4a6741' }}>Админ-панель</h1>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '2px solid #d4c8b8', paddingBottom: 12 }}>
        <button onClick={() => setActiveTab('templates')} style={{ padding: '10px 24px', background: activeTab === 'templates' ? '#d4e2d4' : 'transparent', color: activeTab === 'templates' ? '#4a6741' : '#8a9a7a', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: activeTab === 'templates' ? 600 : 500 }}>Шаблоны</button>
        <button onClick={() => setActiveTab('users')} style={{ padding: '10px 24px', background: activeTab === 'users' ? '#d4e2d4' : 'transparent', color: activeTab === 'users' ? '#4a6741' : '#8a9a7a', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: activeTab === 'users' ? 600 : 500 }}>Пользователи</button>
      </div>

      {activeTab === 'templates' && (
        <>
          <div ref={formRef} style={{ background: 'white', padding: 24, borderRadius: 20, border: '2px solid #d4c8b8', marginBottom: 32, transition: 'box-shadow 0.3s' }}>
            <h2 style={{ fontSize: 20, color: '#4a6741', marginBottom: 16 }}>{editingId ? '✏️ Редактировать шаблон' : '📝 Создать шаблон'}</h2>
            <form onSubmit={editingId ? () => handleUpdate(editingId) : handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#6a7a5a', fontWeight: 500 }}>Название</label>
                <input type="text" placeholder="Название шаблона" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#6a7a5a', fontWeight: 500 }}>Описание</label>
                <textarea placeholder="Описание" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#6a7a5a', fontWeight: 500 }}>Частота</label>
                <select value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '2px solid #d4c8b8' }}>
                  <option value="daily">Ежедневно</option>
                  <option value="weekly">Еженедельно</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" style={{ padding: '10px 24px', background: '#d4e2d4', color: '#4a6741', border: 'none', borderRadius: 30, fontWeight: 600, cursor: 'pointer' }}>{editingId ? 'Сохранить' : 'Создать'}</button>
                {editingId && <button type="button" onClick={cancelEdit} style={{ padding: '10px 24px', background: '#f0e0d8', color: '#a87a62', border: 'none', borderRadius: 30, cursor: 'pointer' }}>Отмена</button>}
              </div>
            </form>
          </div>

          <div style={{ background: 'white', padding: 24, borderRadius: 20, border: '2px solid #d4c8b8' }}>
            <h2 style={{ fontSize: 20, color: '#4a6741', marginBottom: 16 }}>Существующие шаблоны</h2>
            {templates.length === 0 && <p style={{ color: '#a8b898' }}>Нет шаблонов</p>}
            {templates.map(template => (
              <div key={template.id} style={{ border: '2px solid #d4c8b8', borderRadius: 16, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ marginBottom: 4, color: '#4a6741' }}>{template.title}</h3>
                    <p style={{ color: '#5a6a4a', fontSize: 14, fontWeight: 500 }}>{template.description}</p>
                    <small style={{ color: '#a8b898' }}>Частота: {template.frequency === 'daily' ? 'Ежедневно' : 'Еженедельно'}</small>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => startEdit(template)} style={{ padding: '6px 16px', background: '#e8e0d5', color: '#5a6a4a', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 500 }}>Редактировать</button>
                    <button onClick={() => handleDelete(template.id)} style={{ padding: '6px 16px', background: '#f0e0d8', color: '#a87a62', border: 'none', borderRadius: 20, cursor: 'pointer' }}>Удалить</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div style={{ background: 'white', padding: 24, borderRadius: 20, border: '2px solid #d4c8b8' }}>
          <h2 style={{ fontSize: 20, color: '#4a6741', marginBottom: 16 }}>Список пользователей</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #d4c8b8' }}>
                  <th style={{ padding: 12, textAlign: 'left', color: '#6a7a5a' }}>ID</th>
                  <th style={{ padding: 12, textAlign: 'left', color: '#6a7a5a' }}>Email</th>
                  <th style={{ padding: 12, textAlign: 'left', color: '#6a7a5a' }}>Роль</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #e8e0d5' }}>
                    <td style={{ padding: 12 }}>{u.id}</td>
                    <td style={{ padding: 12 }}>{u.email}</td>
                    <td style={{ padding: 12 }}>
                      <span style={{ background: u.role === 'superuser' ? '#d4e2d4' : '#e8e0d5', color: u.role === 'superuser' ? '#4a6741' : '#8a9a7a', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                        {u.role === 'superuser' ? 'Администратор' : 'Пользователь'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}