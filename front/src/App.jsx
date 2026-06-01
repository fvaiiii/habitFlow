import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HabitForm from './pages/HabitForm';
import HabitEdit from './pages/HabitEdit';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
import Tags from './pages/Tags';
import AdminTemplates from './pages/AdminTemplates';

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#4a6741',
            borderRadius: '16px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
            border: '2px solid #d4c8b8',
          },
          success: {
            iconTheme: {
              primary: '#4a6741',
              secondary: '#fff',
            },
          },
          error: {
            style: {
              background: '#fff',
              color: '#a87a62',
            },
            iconTheme: {
              primary: '#a87a62',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/habit/new" element={<HabitForm />} />
        <Route path="/habit/edit/:id" element={<HabitEdit />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tags" element={<Tags />} />
        <Route path="/admin" element={<AdminTemplates />} />
      </Routes>
    </>
  );
}

export default App;
