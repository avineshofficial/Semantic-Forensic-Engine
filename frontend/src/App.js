import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

// Page Imports
import Dashboard from './pages/Dashboard';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import Matches from './pages/Matches';
import Guardian from './pages/Guardian';
import MyActivity from './pages/MyActivity';
import Auth from './pages/Auth';
import Success from './pages/Success';
import AdminDashboard from './pages/AdminDashboard';

// Component Imports
import ProtectedRoute from './components/ProtectedRoute';

// Style Import
import './styles/App.css';

function App() {
  // Listen to the Firebase Auth state
  const [user, loading] = useAuthState(auth);

  const handleLogout = () => {
    auth.signOut();
  };

  if (loading) {
    return (
      <div className="main-content" style={{ textAlign: 'center', marginTop: '100px' }}>
        <div className="verifying-text">INITIALIZING FORENSIC SYSTEM...</div>
      </div>
    );
  }

  return (
    <Router>
      <nav className="navbar">
        <div className="logo">FORENSIC MATCH</div>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/">Dashboard</Link>
              <Link to="/activity">My Activity</Link>
              <Link to="/report-lost">Report Lost</Link>
              <Link to="/report-found">Found Entry</Link>
              <button 
                onClick={handleLogout} 
                className="btn-logout"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <Link to="/auth">Agent Login</Link>
          )}
        </div>
      </nav>

      <Routes>
        {/* Public Route */}
        <Route 
          path="/auth" 
          element={!user ? <Auth /> : <Navigate to="/" />} 
        />

        {/* Protected Routes - Only accessible if logged in */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/report-lost" 
          element={
            <ProtectedRoute>
              <ReportLost />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/report-found" 
          element={
            <ProtectedRoute>
              <ReportFound />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/matches" 
          element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/guardian/:itemId" 
          element={
            <ProtectedRoute>
              <Guardian />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/activity" 
          element={
            <ProtectedRoute>
              <MyActivity />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;