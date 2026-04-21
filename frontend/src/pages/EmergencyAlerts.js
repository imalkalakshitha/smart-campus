import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8081/api/alerts';

const severityColor = {
  CRITICAL: '#d32f2f',
  HIGH: '#f57c00',
  MEDIUM: '#fbc02d',
  LOW: '#388e3c'
};

const containerStyle = {
  padding: 20,
  fontFamily: 'Segoe UI, Roboto, Arial, sans-serif'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: 12
};

const thStyle = {
  textAlign: 'left',
  padding: '8px 10px',
  borderBottom: '1px solid #ddd'
};

const tdStyle = {
  padding: '8px 10px',
  borderBottom: '1px solid #f0f0f0',
  verticalAlign: 'top'
};

const btn = {
  padding: '6px 8px',
  marginRight: 6,
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer'
};

const overlayStyle = {
  position: 'fixed',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000
};

const formBox = {
  background: '#fff',
  padding: 18,
  borderRadius: 8,
  width: 560,
  maxWidth: '95%',
  boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
};

function EmergencyAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    alertType: 'OTHER',
    severity: 'MEDIUM'
  });

  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    message: '',
    alertType: 'OTHER',
    severity: 'MEDIUM',
    status: 'ACTIVE'
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(API_BASE);
      setAlerts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to load alerts.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    if (!form.title || !form.message) {
      setError('Title and message are required.');
      return;
    }
    try {
      const payload = {
        title: form.title,
        message: form.message,
        alertType: form.alertType,
        severity: form.severity,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      await axios.post(API_BASE, payload);
      setShowCreate(false);
      setForm({ title: '', message: '', alertType: 'OTHER', severity: 'MEDIUM' });
      fetchAlerts();
    } catch (err) {
      setError('Failed to create alert.');
      console.error(err);
    }
  };

  const openEdit = (a) => {
    setEditing(a);
    setEditForm({
      title: a.title || '',
      message: a.message || '',
      alertType: a.alertType || 'OTHER',
      severity: a.severity || 'MEDIUM',
      status: a.status || 'ACTIVE'
    });
    setShowEdit(true);
    setError('');
  };

  const handleUpdate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    if (!editing) return;
    if (!editForm.title || !editForm.message) {
      setError('Title and message are required.');
      return;
    }
    try {
      const payload = {
        ...editing,
        title: editForm.title,
        message: editForm.message,
        alertType: editForm.alertType,
        severity: editForm.severity,
        status: editForm.status
      };
      await axios.put(`${API_BASE}/${editing.id}`, payload);
      setShowEdit(false);
      setEditing(null);
      fetchAlerts();
    } catch (err) {
      setError('Failed to update alert.');
      console.error(err);
    }
  };

  const handleResolve = async (id) => {
    setError('');
    const a = alerts.find((x) => x.id === id);
    if (!a) return;
    if (!window.confirm(`Mark alert #${id} as RESOLVED?`)) return;
    try {
      const payload = { ...a, status: 'RESOLVED' };
      await axios.put(`${API_BASE}/${id}`, payload);
      fetchAlerts();
    } catch (err) {
      setError('Failed to resolve alert.');
      console.error(err);
    }
  };

  // open confirmation modal (do not delete yet)
  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const deleteAlert = async (id) => {
    if (!id) return;
    setError('');
    try {
      await axios.delete(`${API_BASE}/${id}`);
      await fetchAlerts();
    } catch (err) {
      setError('Failed to delete alert.');
      console.error(err);
    }
  };

  const filtered = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return (a.status || 'ACTIVE') !== 'RESOLVED';
    if (filter === 'RESOLVED') return (a.status || '') === 'RESOLVED';
    return true;
  });

  const formatDate = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleString();
  };

  return (
    <div style={containerStyle}>
      <h2>Emergency Alert System</h2>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div>
          <label>Status filter:&nbsp;</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <button
          style={{ ...btn, background: '#1976d2', color: '#fff' }}
          onClick={() => {
            setShowCreate(true);
            setError('');
          }}
        >
          Create Alert
        </button>

        <button style={{ ...btn, background: '#eee' }} onClick={fetchAlerts}>
          Refresh
        </button>

        {loading && <span style={{ marginLeft: 8 }}>Loading...</span>}
      </div>

      {error && <div style={{ color: '#d32f2f', marginBottom: 8 }}>{error}</div>}

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Severity</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Created Date</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan="7" style={{ ...tdStyle, textAlign: 'center', color: '#777' }}>
                No alerts found.
              </td>
            </tr>
          )}
          {filtered.map((a) => (
            <tr key={a.id}>
              <td style={tdStyle}>
                <strong>{a.id}</strong>
              </td>
              <td style={tdStyle}>
                <div style={{ fontWeight: 600 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: '#555' }}>
                  {(a.message || '').slice(0, 120)}
                  {(a.message || '').length > 120 ? '...' : ''}
                </div>
              </td>
              <td style={tdStyle}>{a.alertType || 'OTHER'}</td>
              <td style={tdStyle}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: 12,
                    background: severityColor[a.severity] || '#999',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 12
                  }}
                >
                  {a.severity || 'MEDIUM'}
                </span>
              </td>
              <td style={tdStyle}>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: a.status === 'RESOLVED' ? '#e0e0e0' : '#e8f5e9',
                    color: a.status === 'RESOLVED' ? '#616161' : '#2e7d32',
                    fontWeight: 600,
                    fontSize: 12
                  }}
                >
                  {a.status || 'ACTIVE'}
                </span>
              </td>
              <td style={tdStyle}>{formatDate(a.createdAt || a.created)}</td>
              <td style={tdStyle}>
                <button
                  style={{ ...btn, background: '#1976d2', color: '#fff' }}
                  onClick={() => openEdit(a)}
                >
                  Edit
                </button>
                {(a.status || 'ACTIVE') !== 'RESOLVED' && (
                  <button
                    style={{ ...btn, background: '#388e3c', color: '#fff' }}
                    onClick={() => handleResolve(a.id)}
                  >
                    Resolve
                  </button>
                )}
                <button
                  style={{ ...btn, background: '#d32f2f', color: '#fff' }}
                  onClick={() => handleDelete(a.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showCreate && (
        <div style={overlayStyle}>
          <div style={formBox}>
            <h3 style={{ marginTop: 0 }}>Create Alert</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 8 }}>
                <label>Title *</label>
                <br />
                <input
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 8 }}>
                <label>Message *</label>
                <br />
                <textarea
                  rows={4}
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <label>Type</label>
                  <br />
                  <select
                    value={form.alertType}
                    onChange={(e) => setForm({ ...form, alertType: e.target.value })}
                    style={{ width: '100%', padding: 8 }}
                  >
                    <option>FIRE</option>
                    <option>MEDICAL</option>
                    <option>SECURITY</option>
                    <option>WEATHER</option>
                    <option>OTHER</option>
                  </select>
                </div>
                <div style={{ width: 160 }}>
                  <label>Severity</label>
                  <br />
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    style={{ width: '100%', padding: 8 }}
                  >
                    <option>LOW</option>
                    <option>MEDIUM</option>
                    <option>HIGH</option>
                    <option>CRITICAL</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  style={{ ...btn, background: '#eee' }}
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={{ ...btn, background: '#d32f2f', color: '#fff' }}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEdit && editing && (
        <div style={overlayStyle}>
          <div style={formBox}>
            <h3 style={{ marginTop: 0 }}>Edit Alert #{editing.id}</h3>
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: 8 }}>
                <label>Title *</label>
                <br />
                <input
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 8 }}>
                <label>Message *</label>
                <br />
                <textarea
                  rows={4}
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                  value={editForm.message}
                  onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <label>Type</label>
                  <br />
                  <select
                    value={editForm.alertType}
                    onChange={(e) => setEditForm({ ...editForm, alertType: e.target.value })}
                    style={{ width: '100%', padding: 8 }}
                  >
                    <option>FIRE</option>
                    <option>MEDICAL</option>
                    <option>SECURITY</option>
                    <option>WEATHER</option>
                    <option>OTHER</option>
                  </select>
                </div>
                <div style={{ width: 140 }}>
                  <label>Severity</label>
                  <br />
                  <select
                    value={editForm.severity}
                    onChange={(e) => setEditForm({ ...editForm, severity: e.target.value })}
                    style={{ width: '100%', padding: 8 }}
                  >
                    <option>LOW</option>
                    <option>MEDIUM</option>
                    <option>HIGH</option>
                    <option>CRITICAL</option>
                  </select>
                </div>

                <div style={{ width: 160 }}>
                  <label>Status</label>
                  <br />
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={{ width: '100%', padding: 8 }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  style={{ ...btn, background: '#eee' }}
                  onClick={() => {
                    setShowEdit(false);
                    setEditing(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" style={{ ...btn, background: '#1976d2', color: '#fff' }}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId !== null && (
        <div style={overlayStyle}>
          <div style={{ ...formBox, maxWidth: 520 }}>
            <h3 style={{ marginTop: 0, color: '#d32f2f' }}>Delete Alert?</h3>
            <p style={{ marginTop: 6 }}>
              Are you sure you want to delete{' '}
              <strong>
                {alerts.find((x) => x.id === deleteConfirmId)?.title || `#${deleteConfirmId}`}
              </strong>
              ? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button
                type="button"
                style={{ ...btn, background: 'transparent', color: '#666' }}
                onClick={() => setDeleteConfirmId(null)}
              >
                CANCEL
              </button>
              <button
                type="button"
                style={{ ...btn, background: '#d32f2f', color: '#fff' }}
                onClick={async () => {
                  await deleteAlert(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmergencyAlerts;