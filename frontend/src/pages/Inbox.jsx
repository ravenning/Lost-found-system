import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Send, ShieldAlert, Ban, Info } from 'lucide-react';

const Inbox = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id);
    }
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data);
      if (data.length > 0 && !activeConv) {
        setActiveConv(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const { data } = await api.get(`/chat/${convId}/messages`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    
    try {
      const { data } = await api.post(`/chat/${activeConv._id}/messages`, { content: newMessage });
      setMessages([...messages, data]);
      setNewMessage('');
      
      setConversations(conversations.map(c => 
        c._id === activeConv._id ? { ...c, updatedAt: new Date() } : c
      ).sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    }
  };

  const handleBlock = async () => {
    if (!window.confirm('Are you sure you want to block/unblock this user?')) return;
    try {
      const { data } = await api.put(`/chat/${activeConv._id}/block`);
      setActiveConv(data);
      setConversations(conversations.map(c => c._id === data._id ? data : c));
    } catch (err) {
      alert('Failed to update block status');
    }
  };

  const handleReport = async () => {
    const reason = window.prompt('Why are you reporting this user?');
    if (!reason) return;
    try {
      await api.post(`/chat/${activeConv._id}/report`, { reason });
      alert('User reported to administrators.');
    } catch (err) {
      alert('Failed to report user');
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', gap: '2rem', height: '80vh' }}>
      {/* Threads List */}
      <div className="glass-panel" style={{ width: '350px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <h3 style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>Inbox</h3>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {conversations.length === 0 ? (
            <p style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>No messages yet.</p>
          ) : (
            conversations.map(conv => {
              const otherUser = conv.participants.find(p => p._id !== user._id);
              const isActive = activeConv?._id === conv._id;
              return (
                <div 
                  key={conv._id} 
                  onClick={() => setActiveConv(conv)}
                  style={{ 
                    padding: '1.5rem', 
                    borderBottom: '1px solid var(--border-color)', 
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    borderLeft: isActive ? '4px solid var(--primary-color)' : '4px solid transparent'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{otherUser?.email || 'Unknown User'}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{conv.itemId?.title}</span>
                    <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeConv ? (
          <>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>{activeConv.participants.find(p => p._id !== user._id)?.email}</h3>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Regarding: {activeConv.itemId?.title}</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={handleBlock} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  <Ban size={16} /> {activeConv.blockedBy ? 'Unblock' : 'Block'}
                </button>
                <button onClick={handleReport} className="btn btn-danger" style={{ padding: '0.5rem 1rem' }}>
                  <ShieldAlert size={16} /> Report
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeConv.blockedBy && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--danger-color)' }}>
                  This conversation is blocked.
                </div>
              )}
              {messages.map(msg => {
                const isMe = msg.senderId === user._id;
                return (
                  <div key={msg._id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      maxWidth: '70%', 
                      padding: '1rem', 
                      borderRadius: 'var(--radius-lg)', 
                      backgroundColor: isMe ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      borderBottomRightRadius: isMe ? 0 : 'var(--radius-lg)',
                      borderBottomLeftRadius: isMe ? 'var(--radius-lg)' : 0
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', gap: '0.5rem' }}>
                      <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                      {isMe && <span>{msg.isRead ? 'Read' : 'Delivered'}</span>}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Type a message..." 
                  value={newMessage} 
                  onChange={e => setNewMessage(e.target.value)}
                  disabled={!!activeConv.blockedBy}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={!!activeConv.blockedBy || !newMessage.trim()}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            <Info size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
