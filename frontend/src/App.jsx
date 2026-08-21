import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import PreviewTest from './pages/PreviewTest';
import AtsTest from './pages/AtsTest';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-khaki-light flex flex-col text-olive-wood">
        <Navbar />
        <main className="flex-1">
          {/* TODO (Day 3): Add AuthGuard / ProtectedRoute wrapper for /dashboard and /upload */}
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/preview-test" element={<PreviewTest />} />
            <Route path="/preview" element={<PreviewTest />} />
            <Route path="/ats-test" element={<AtsTest />} />
            <Route path="/ats" element={<AtsTest />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}