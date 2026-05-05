import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, XCircle, Clock, MessageCircle } from 'lucide-react';

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const { data } = await api.get('/claims/my-claims');
        setClaims(data);
      } catch (err) {
        console.error('Failed to fetch claims', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  const handleMessage = async (claimId) => {
    try {
      await api.post('/chat/init', { claimId });
      navigate('/inbox');
    } catch(err) {
      alert(err.response?.data?.message || 'Failed to start chat');
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;

  const getStatusIcon = (status) => {
    switch(status) {
      case 'APPROVED': return <CheckCircle color="var(--success-color)" />;
      case 'REJECTED': return <XCircle color="var(--danger-color)" />;
      default: return <Clock color="var(--warning-color)" />;
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>My Submitted Claims</h2>

      {claims.length === 0 ? (
        <p>You haven't submitted any claims yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {claims.map(claim => (
            <div key={claim._id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {claim.itemId?.images && claim.itemId.images.length > 0 && (
                  <img src={claim.itemId.images[0].url} alt="Item" style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                )}
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>
                    <Link to={`/item/${claim.itemId?._id}`} style={{ color: 'var(--text-primary)' }}>
                      {claim.itemId?.title || 'Unknown Item'}
                    </Link>
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Submitted on: {new Date(claim.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  {getStatusIcon(claim.status)} {claim.status}
                </div>
                <button onClick={() => handleMessage(claim._id)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  <MessageCircle size={16} /> Message Owner
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClaims;
