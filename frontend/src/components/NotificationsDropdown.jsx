import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="btn" 
        style={{ padding: '0.5rem', position: 'relative', backgroundColor: isOpen ? 'rgba(255,255,255,0.1)' : 'transparent' }}
      >
        <Bell size={20} color="var(--text-primary)" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-5px', right: '-5px',
            backgroundColor: 'var(--danger-color)', color: '#fff',
            borderRadius: '50%', padding: '0.1rem 0.4rem', fontSize: '0.75rem', fontWeight: 600
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="glass-panel animate-fade-in" style={{
          position: 'absolute', top: '120%', right: 0, width: '350px',
          maxHeight: '400px', overflowY: 'auto', zIndex: 50, padding: '1rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0 }}>Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={(e) => handleMarkAsRead('all', e)} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                Mark all as read
              </button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '2rem 0' }}>No notifications</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {notifications.map(n => (
                <div key={n._id} style={{
                  padding: '1rem', borderRadius: 'var(--radius-sm)',
                  backgroundColor: n.isRead ? 'rgba(255,255,255,0.05)' : 'rgba(99, 102, 241, 0.1)',
                  borderLeft: n.isRead ? '2px solid transparent' : '2px solid var(--primary-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.875rem' }}>{n.title}</strong>
                    {!n.isRead && (
                      <button onClick={(e) => handleMarkAsRead(n._id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>{n.message}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                    {n.link && (
                      <Link to={n.link} onClick={() => setIsOpen(false)} style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
