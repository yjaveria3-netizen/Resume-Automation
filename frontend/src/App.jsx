import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
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
      <div className="min-h-screen bg-khaki-light/30 flex flex-col text-olive-wood">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes (Require Authenticated Session) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
            </Route>

            {/* Public Showcase & QA Testing Routes (Preserved separately as requested) */}
            <Route path="/demo" element={<DemoShowcase />} />
            <Route path="/qa" element={<DemoShowcase />} />
            <Route path="/preview-test" element={<PreviewTest />} />
            <Route path="/preview" element={<PreviewTest />} />
            <Route path="/ats-test" element={<AtsTest />} />
            <Route path="/ats" element={<AtsTest />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
