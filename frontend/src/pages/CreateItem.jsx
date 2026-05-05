import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { UploadCloud } from 'lucide-react';

const CreateItem = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'LOST', category: 'Electronics', location: '', date: ''
  });
  const [dynamicFields, setDynamicFields] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      
      if (dynamicFields) {
        data.append('categorySpecificFields', dynamicFields);
      }
      
      files.forEach(file => data.append('images', file));

      await api.post('/items', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Report an Item</h2>
        
        {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--danger-color)' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Title</label>
            <input type="text" className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>
          
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description</label>
            <textarea className="input-field" rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Type</label>
            <select className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option value="LOST">Lost</option>
              <option value="FOUND">Found</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Category</label>
            <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="Electronics">Electronics</option>
              <option value="Pets">Pets</option>
              <option value="Documents">Documents</option>
              <option value="Keys">Keys</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Location</label>
            <input type="text" className="input-field" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Date</label>
            <input type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Dynamic Fields (JSON format, e.g. {`{"IMEI": "12345"}`})</label>
            <input type="text" className="input-field" value={dynamicFields} onChange={e => setDynamicFields(e.target.value)} placeholder='{"Brand": "Apple", "Color": "Black"}' />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Images (Max 5)</label>
            <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center' }}>
              <UploadCloud size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
              <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'block', margin: '0 auto' }} />
            </div>
          </div>

          <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Uploading...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateItem;
