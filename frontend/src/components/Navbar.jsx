import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Search, PlusCircle, LogOut, MessageCircle, Settings as SettingsIcon } from 'lucide-react';
import api from '../api/axios';
import NotificationsDropdown from './NotificationsDropdown';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/chat/unread-count');
        setUnreadCount(data.count);
      } catch (e) {
        // ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel" style={{ margin: '1.5rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
        <Search size={24} color="var(--primary-color)" />
        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em' }}>FINDER</span>
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {user ? (
          <>
            {user.role === 'admin' && (
              <Link to="/admin/dashboard" style={{ color: 'var(--danger-color)', fontWeight: 500 }}>
                Admin Dashboard
              </Link>
            )}
            <Link to="/my-claims" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              My Claims
            </Link>
            <Link to="/inbox" style={{ color: 'var(--text-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageCircle size={18} /> Inbox 
              {unreadCount > 0 && <span className="badge" style={{ backgroundColor: 'var(--primary-color)', color: '#fff', padding: '0.15rem 0.5rem', marginLeft: '0.25rem' }}>{unreadCount}</span>}
            </Link>
            
            <NotificationsDropdown />

            <Link to="/create" className="btn btn-primary">
              <PlusCircle size={18} /> Report Item
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{user.email}</span>
              <Link to="/settings" className="btn btn-secondary" style={{ padding: '0.4rem' }}>
              <SettingsIcon size={18} /> 
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ color: 'var(--danger-color)', padding: '0.4rem' }}>
              <LogOut size={18} />
            </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
