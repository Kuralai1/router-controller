import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RoutersList from './components/routers/RoutersList';
import RouterDashboard from './components/routers/RouterDashboard';
import Login from './components/auth/Login';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/routers" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/routers" element={<RoutersList />} />
          <Route path="/routers/:id" element={<RouterDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;