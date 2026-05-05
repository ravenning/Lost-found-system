import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShieldAlert, Users, Package, FileText, Activity, Trash2, CheckCircle, XCircle, Ban, RefreshCw, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedClaims, setSelectedClaims] = useState([]);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    try {
      if (tab === 'stats') {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } else if (tab === 'users') {
        const { data } = await api.get('/admin/users');
        setUsers(data);
      } else if (tab === 'items') {
        const { data } = await api.get('/admin/items');
        setItems(data);
      } else if (tab === 'claims') {
        const { data } = await api.get('/admin/claims');
        setClaims(data);
      } else if (tab === 'reports') {
        const { data } = await api.get('/admin/reports');
        setReports(data);
      } else if (tab === 'logs') {
        const { data } = await api.get('/admin/audit');
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch data for tab:', tab, err);
    }
  };

  const toggleBan = async (userId) => {
    if(!window.confirm('Toggle ban for this user?')) return;
    try {
      await api.put(`/admin/users/${userId}/ban`);
      fetchData('users');
    } catch(err) { alert('Failed to toggle ban'); }
  };

  const toggleTrusted = async (userId) => {
    if(!window.confirm('Toggle trusted badge for this user?')) return;
    try {
      await api.put(`/admin/users/${userId}/trusted`);
      fetchData('users');
    } catch(err) { alert('Failed to toggle trusted status'); }
  };

  const handleBulkDeleteItems = async () => {
    if(!window.confirm(`Delete ${selectedItems.length} items?`)) return;
    try {
      await api.delete('/admin/items/bulk', { data: { itemIds: selectedItems } });
      setSelectedItems([]);
      fetchData('items');
    } catch(err) { alert('Failed to delete items'); }
  };

  const handleBulkUpdateClaims = async (status) => {
    if(!window.confirm(`Mark ${selectedClaims.length} claims as ${status}?`)) return;
    try {
      await api.put('/admin/claims/bulk', { claimIds: selectedClaims, status });
      setSelectedClaims([]);
      fetchData('claims');
    } catch(err) { alert('Failed to update claims'); }
  };

  const handleReportStatus = async (reportId, status) => {
    try {
      await api.put(`/admin/reports/${reportId}/status`, { status });
      fetchData('reports');
    } catch(err) { alert('Failed to update report status'); }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <ShieldAlert size={32} color="var(--primary-color)" />
        <h2>Admin Dashboard</h2>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Sidebar */}
        <div className="glass-panel" style={{ width: '250px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', height: 'fit-content' }}>
          {[
            { id: 'stats', label: 'Overview', icon: Activity },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'items', label: 'Items', icon: Package },
            { id: 'claims', label: 'Claims', icon: FileText },
            { id: 'reports', label: 'Reports', icon: ShieldAlert },
            { id: 'logs', label: 'Audit Logs', icon: RefreshCw },
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="btn"
              style={{
                justifyContent: 'flex-start',
                backgroundColor: activeTab === t.id ? 'var(--primary-color)' : 'transparent',
                color: activeTab === t.id ? '#fff' : 'var(--text-secondary)'
              }}
            >
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="glass-panel" style={{ flex: 1, padding: '2rem', minHeight: '60vh', overflowX: 'auto' }}>
          
          {/* STATS VIEW */}
          {activeTab === 'stats' && stats && (
            <div>
              <h3 style={{ marginBottom: '1.5rem' }}>Platform Overview</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Users</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.users.total}</div>
                  <div style={{ color: 'var(--danger-color)', fontSize: '0.875rem' }}>{stats.users.banned} banned</div>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Items Overview</div>
                  {stats.items.map(s => <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{s._id}:</span> <strong>{s.count}</strong></div>)}
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Unresolved Reports</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: stats.reports.unresolved > 0 ? 'var(--warning-color)' : 'var(--success-color)' }}>
                    {stats.reports.unresolved}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS VIEW */}
          {activeTab === 'users' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem' }}>Manage Users ({users.length})</h3>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '1rem 0' }}>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Trusted</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 0' }}>{u.email}</td>
                      <td><span className="badge">{u.role}</span></td>
                      <td>
                        <span className="badge" style={{ backgroundColor: u.isBanned ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)' }}>
                          {u.isBanned ? 'BANNED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={{ backgroundColor: u.isTrusted ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)' }}>
                          {u.isTrusted ? 'YES' : 'NO'}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {u.role !== 'admin' && (
                          <>
                            <button onClick={() => toggleBan(u._id)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                              <Ban size={14} /> {u.isBanned ? 'Unban' : 'Ban'}
                            </button>
                            <button onClick={() => toggleTrusted(u._id)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', marginLeft: '0.5rem' }}>
                              <ShieldCheck size={14} /> {u.isTrusted ? 'Revoke' : 'Trust'}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ITEMS VIEW */}
          {activeTab === 'items' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3>Manage Items ({items.length})</h3>
                {selectedItems.length > 0 && (
                  <button onClick={handleBulkDeleteItems} className="btn btn-danger">
                    <Trash2 size={16} /> Delete {selectedItems.length} Items
                  </button>
                )}
              </div>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '1rem 0' }}><input type="checkbox" onChange={(e) => setSelectedItems(e.target.checked ? items.map(i => i._id) : [])} /></th>
                    <th>Title</th>
                    <th>Owner</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 0' }}>
                        <input type="checkbox" checked={selectedItems.includes(item._id)} onChange={(e) => {
                          if (e.target.checked) setSelectedItems([...selectedItems, item._id]);
                          else setSelectedItems(selectedItems.filter(id => id !== item._id));
                        }} />
                      </td>
                      <td>{item.title}</td>
                      <td>{item.userId?.email || 'Unknown'}</td>
                      <td>{item.type}</td>
                      <td>{item.status}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CLAIMS VIEW */}
          {activeTab === 'claims' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3>Manage Claims ({claims.length})</h3>
                {selectedClaims.length > 0 && (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => handleBulkUpdateClaims('APPROVED')} className="btn" style={{ backgroundColor: 'var(--success-color)' }}>
                      <CheckCircle size={16} /> Approve {selectedClaims.length}
                    </button>
                    <button onClick={() => handleBulkUpdateClaims('REJECTED')} className="btn btn-danger">
                      <XCircle size={16} /> Reject {selectedClaims.length}
                    </button>
                  </div>
                )}
              </div>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '1rem 0' }}><input type="checkbox" onChange={(e) => setSelectedClaims(e.target.checked ? claims.map(c => c._id) : [])} /></th>
                    <th>Item</th>
                    <th>Claimant</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map(claim => (
                    <tr key={claim._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 0' }}>
                        <input type="checkbox" checked={selectedClaims.includes(claim._id)} onChange={(e) => {
                          if (e.target.checked) setSelectedClaims([...selectedClaims, claim._id]);
                          else setSelectedClaims(selectedClaims.filter(id => id !== claim._id));
                        }} />
                      </td>
                      <td>{claim.itemId?.title || 'Unknown Item'}</td>
                      <td>{claim.claimantId?.email || 'Unknown User'}</td>
                      <td>{claim.status}</td>
                      <td>{new Date(claim.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORTS VIEW */}
          {activeTab === 'reports' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem' }}>User Reports</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {reports.map(report => (
                  <div key={report._id} style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--danger-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge">{report.status}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div><strong>Reporter:</strong> {report.reporterId?.email}</div>
                    <div><strong>Target:</strong> {report.targetType} (ID: {report.targetId})</div>
                    <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>"{report.reason}"</div>
                    
                    {report.status === 'PENDING' && (
                      <div style={{ marginTop: '1rem' }}>
                        <button onClick={() => handleReportStatus(report._id, 'REVIEWED')} className="btn btn-secondary">
                          Mark as Reviewed
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AUDIT LOGS VIEW */}
          {activeTab === 'logs' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem' }}>Admin Audit Logs</h3>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '1rem 0' }}>Date</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 0' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      <td>{log.adminId?.email || 'Unknown'}</td>
                      <td><span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}>{log.action}</span></td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{JSON.stringify(log.details)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
