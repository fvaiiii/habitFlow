import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateHabit from './pages/CreateHabit';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/habit/new" element={<CreateHabit />} />
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
}

export default App;