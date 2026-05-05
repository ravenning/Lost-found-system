import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { MapPin, Calendar, Image as ImageIcon } from 'lucide-react';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await api.get('/items');
        setItems(data);
      } catch (err) {
        console.error('Failed to fetch items', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Lost & Found Board</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {items.map(item => (
          <Link to={`/item/${item._id}`} key={item._id} className="glass-panel animate-fade-in" style={{ display: 'block', textDecoration: 'none', color: 'inherit', overflow: 'hidden', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <div style={{ height: '200px', backgroundColor: 'rgba(0,0,0,0.2)', position: 'relative' }}>
              {item.images && item.images.length > 0 ? (
                <img src={item.images[0].url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                  <ImageIcon size={48} opacity={0.5} />
                </div>
              )}
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                <span className={`badge badge-${item.type.toLowerCase()}`}>{item.type}</span>
                {item.status !== item.type && <span className={`badge badge-resolved`}>{item.status}</span>}
              </div>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.description}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="var(--primary-color)" /> {item.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} color="var(--secondary-color)" /> {new Date(item.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Link>
        ))}
        {items.length === 0 && <p>No items found. Be the first to report something!</p>}
      </div>
    </div>
  );
};

export default Dashboard;
