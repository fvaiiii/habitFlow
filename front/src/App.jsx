import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HabitForm from './pages/HabitForm';
import HabitEdit from './pages/HabitEdit';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
// import Tags from './pages/Tags';  // Временно закомментировано

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/habit/new" element={<HabitForm />} />
      <Route path="/habit/edit/:id" element={<HabitEdit />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/profile" element={<Profile />} />
      {/* <Route path="/tags" element={<Tags />} />  Временно закомментировано */}
    </Routes>
  );
}

export default App;