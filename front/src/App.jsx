import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HabitForm from './pages/HabitForm';
import HabitEdit from './pages/HabitEdit';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
import Tags from './pages/Tags';
import AdminTemplates from './pages/AdminTemplates';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/habit/new" element={<PrivateRoute><HabitForm /></PrivateRoute>} />
      <Route path="/habit/edit/:id" element={<PrivateRoute><HabitEdit /></PrivateRoute>} />
      <Route path="/stats" element={<PrivateRoute><Stats /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/tags" element={<PrivateRoute><Tags /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute><AdminTemplates /></PrivateRoute>} />
    </Routes>
  );
}

export default App;