import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { UploadCloud, Info } from 'lucide-react';

const SubmitClaim = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [proofText, setProofText] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await api.get(`/items/${itemId}`);
        setItem(data);
      } catch (err) {
        setError('Item not found');
      }
    };
    fetchItem();
  }, [itemId]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('itemId', itemId);
      data.append('proofText', proofText);
      
      files.forEach(file => data.append('proofImages', file));

      await api.post('/claims', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/my-claims');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  if (!item && !error) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Claim Item: {item?.title}</h2>
        
        <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', gap: '1rem' }}>
          <Info color="var(--primary-color)" />
          <p style={{ color: 'var(--text-secondary)' }}>Please provide as much proof as possible to verify you are the true owner. Include descriptions of unique identifiers, serial numbers, or pictures of you with the item.</p>
        </div>

        {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--danger-color)' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Detailed Proof Description</label>
            <textarea className="input-field" rows="6" value={proofText} onChange={e => setProofText(e.target.value)} required placeholder="Describe any unique features, where you lost it, passwords, etc..."></textarea>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Upload Proof Images (Optional)</label>
            <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center' }}>
              <UploadCloud size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
              <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'block', margin: '0 auto' }} />
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitClaim;
