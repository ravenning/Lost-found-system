import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Settings as SettingsIcon, Bell, Mail } from 'lucide-react';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    inAppNotifications: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/notifications/preferences', preferences);
      alert('Preferences saved successfully!');
    } catch(err) {
      alert('Failed to save preferences');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <SettingsIcon size={32} color="var(--primary-color)" />
        <h2>Account Settings</h2>
      </div>

      <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Notification Preferences</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <Mail size={18} color="var(--primary-color)" /> Email Notifications
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Receive an email when you get a new message, claim update, or match.</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={preferences.emailNotifications} onChange={(e) => setPreferences({...preferences, emailNotifications: e.target.checked})} />
              <span className="slider round"></span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <Bell size={18} color="var(--primary-color)" /> In-App Notifications
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Show the notification badge and bell dropdown in the navigation bar.</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={preferences.inAppNotifications} onChange={(e) => setPreferences({...preferences, inAppNotifications: e.target.checked})} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        <button onClick={handleSave} className="btn btn-primary" style={{ marginTop: '2rem' }} disabled={loading}>
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .switch { position: relative; display: inline-block; width: 50px; height: 28px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.1); transition: .4s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--primary-color); }
        input:checked + .slider:before { transform: translateX(22px); }
      `}} />
    </div>
  );
};

export default Settings;
