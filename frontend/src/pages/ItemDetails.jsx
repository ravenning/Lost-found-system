import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Calendar, User, Trash2, CheckCircle, XCircle, MessageCircle, Flag, ShieldCheck } from 'lucide-react';

const ItemDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data: itemData } = await api.get(`/items/${id}`);
        setItem(itemData);

        // Fetch claims if user is owner or admin
        if (user && (user._id === itemData.userId._id || user.role === 'admin')) {
          try {
            const { data: claimsData } = await api.get(`/claims/item/${id}`);
            setClaims(claimsData);
          } catch (e) {
            console.error('Failed to fetch claims', e);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, user]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/items/${id}`);
        navigate('/');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleResolve = async () => {
    try {
      await api.post(`/items/${id}/resolve`);
      setItem({ ...item, status: 'RESOLVED' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve item');
    }
  };

  const handleUpdateClaim = async (claimId, newStatus) => {
    try {
      await api.put(`/claims/${claimId}/status`, { status: newStatus });
      setClaims(claims.map(c => {
        if (c._id === claimId) return { ...c, status: newStatus };
        if (newStatus === 'APPROVED' && c.status === 'PENDING') return { ...c, status: 'REJECTED' };
        return c;
      }));
      if (newStatus === 'APPROVED') {
        setItem({ ...item, status: 'CLAIMED' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update claim');
    }
  };

  const handleMessage = async (claimId) => {
    try {
      await api.post('/chat/init', { claimId });
      navigate('/inbox');
    } catch(err) {
      alert(err.response?.data?.message || 'Failed to start chat');
    }
  };

  const handleFlagItem = async () => {
    const reason = window.prompt('Why are you flagging this item?');
    if (!reason) return;
    try {
      await api.post(`/reports`, {
        targetType: 'Item',
        targetId: item._id,
        reason
      });
      alert('Item reported.');
    } catch(err) {}
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;
  if (!item) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Item not found.</div>;

  const isOwner = user && user._id === item.userId._id;
  const isAdmin = user && user.role === 'admin';
  const showClaimButton = user && !isOwner && item.status === 'FOUND';

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1000px' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        
        {/* Images Column */}
        <div>
          {item.images && item.images.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <img src={item.images[0].url} alt="Main" style={{ width: '100%', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                {item.images.slice(1).map((img, i) => (
                  <img key={i} src={img.url} alt={`Thumbnail ${i}`} style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', height: '400px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>No images available</span>
            </div>
          )}
        </div>

        {/* Details Column */}
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <span className={`badge badge-${item.type.toLowerCase()}`}>{item.type}</span>
            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color)' }}>{item.category}</span>
            {item.status !== item.type && <span className="badge badge-resolved">{item.status}</span>}
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', WebkitTextFillColor: 'initial', color: 'var(--text-primary)' }}>{item.title}</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <User size={20} color="var(--primary-color)" /> Posted by: {item.userId.email}
              {item.userId.isTrusted && <ShieldCheck size={18} color="#3b82f6" title="Trusted User" />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MapPin size={20} color="var(--secondary-color)" /> Location: {item.location}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={20} color="var(--warning-color)" /> Date: {new Date(item.date).toLocaleDateString()}
            </div>
          </div>

          <h3 style={{ marginBottom: '0.5rem' }}>Description</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>{item.description}</p>

          {item.categorySpecificFields && Object.keys(item.categorySpecificFields).length > 0 && (
            <>
              <h3 style={{ marginBottom: '0.5rem' }}>Additional Details</h3>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                {Object.entries(item.categorySpecificFields).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{key}:</span>
                    <span style={{ fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {showClaimButton && (
            <Link to={`/item/${item._id}/claim`} className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
              Claim This Item
            </Link>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
            {user && !isOwner && !isAdmin && (
              <button onClick={handleFlagItem} className="btn btn-secondary" style={{ flex: 1 }}>
                <Flag size={18} /> Flag Item
              </button>
            )}
            {(isOwner || isAdmin) && (
              <>
                {item.status !== 'RESOLVED' && item.status !== 'ARCHIVED' && (
                  <button onClick={handleResolve} className="btn btn-primary" style={{ flex: 1 }}>
                    <CheckCircle size={18} /> Mark as Resolved
                  </button>
                )}
                <button onClick={handleDelete} className="btn btn-danger" style={{ flex: 1 }}>
                  <Trash2 size={18} /> Delete Item
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Claims Section for Admins/Owners */}
      {(isOwner || isAdmin) && claims.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Pending Claims ({claims.length})</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {claims.map(claim => (
              <div key={claim._id} className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 600 }}>Claimant: {claim.claimantId.email}</span>
                  <span className={`badge`} style={{ backgroundColor: claim.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : claim.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)' }}>
                    {claim.status}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                  {claim.proofText}
                </p>
                {claim.proofImages && claim.proofImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.5rem' }}>
                    {claim.proofImages.map((img, i) => (
                      <img key={i} src={img.url} alt="Proof" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    ))}
                  </div>
                )}
                
                {claim.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => handleUpdateClaim(claim._id, 'APPROVED')} className="btn" style={{ backgroundColor: 'var(--success-color)', color: '#fff' }}>
                      <CheckCircle size={18} /> Approve
                    </button>
                    <button onClick={() => handleUpdateClaim(claim._id, 'REJECTED')} className="btn" style={{ backgroundColor: 'var(--danger-color)', color: '#fff' }}>
                      <XCircle size={18} /> Reject
                    </button>
                  </div>
                )}

                <button onClick={() => handleMessage(claim._id)} className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }}>
                  <MessageCircle size={18} /> Message Claimant
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
