import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateItem from './pages/CreateItem';
import ItemDetails from './pages/ItemDetails';
import SubmitClaim from './pages/SubmitClaim';
import MyClaims from './pages/MyClaims';
import Inbox from './pages/Inbox';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <CreateItem />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-claims" 
            element={
              <ProtectedRoute>
                <MyClaims />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/item/:itemId/claim" 
            element={
              <ProtectedRoute>
                <SubmitClaim />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inbox" 
            element={
              <ProtectedRoute>
                <Inbox />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route path="/item/:id" element={<ItemDetails />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
