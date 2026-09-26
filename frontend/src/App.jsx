import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import PreviewTest from './pages/PreviewTest';
import AtsTest from './pages/AtsTest';
import DemoShowcase from './pages/DemoShowcase';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-khaki-light flex flex-col text-olive-wood">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes (Require JWT Token) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
            </Route>

            {/* Public Demo, Showcase & Test Routes */}
            <Route path="/demo" element={<DemoShowcase />} />
            <Route path="/qa" element={<DemoShowcase />} />
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