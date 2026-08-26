import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import API_URL from '../../config/api';

const OrgInfoManager = () => {
  const [subTab, setSubTab] = useState('team'); // 'team' or 'contact'

  return (
    <div className="manager-container" style={{ padding: '20px', background: '#fff', borderRadius: '10px' }}>
      <div className="section-header" style={{ marginBottom: '20px', borderBottom: '2px solid #fdd835', paddingBottom: '10px' }}>
        <h2 style={{ color: '#1b5e20', margin: 0 }}><i className="fas fa-address-card"></i> About &amp; Contact Info</h2>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <button
          onClick={() => setSubTab('team')}
          style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: subTab === 'team' ? '#1b5e20' : '#e0e0e0', color: subTab === 'team' ? '#fff' : '#333' }}
        >
          <i className="fas fa-users"></i> Leadership / Team
        </button>
        <button
          onClick={() => setSubTab('contact')}
          style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: subTab === 'contact' ? '#1b5e20' : '#e0e0e0', color: subTab === 'contact' ? '#fff' : '#333' }}
        >
          <i className="fas fa-address-book"></i> Contact Info
        </button>
      </div>

      {subTab === 'team' ? <TeamMembersSection /> : <ContactInfoSection />}
    </div>
  );
};

// ---------- Leadership / Team members (shown on About page's "View More") ----------
const TeamMembersSection = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState(null);

  const emptyForm = { name: '', role: '', bio: '', photoUrl: '', order: 0, visible: true };
  const [formData, setFormData] = useState(emptyForm);

  const getToken = () => {
    const infoStr = localStorage.getItem('userInfo');
    return infoStr ? JSON.parse(infoStr).token : '';
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/team/all`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) setMembers(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: uploadData,
      });
      if (!res.ok) throw new Error('Photo upload failed');
      const data = await res.json();
      setFormData(prev => ({ ...prev, photoUrl: data.imageUrl || data.url }));
    } catch (err) {
      Swal.fire('Error', 'Photo upload failed', 'error');
    } finally { setUploading(false); }
  };

  const resetForm = () => { setEditId(null); setFormData(emptyForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editId ? `${API_URL}/api/team/${editId}` : `${API_URL}/api/team`;
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        Swal.fire('Success', editId ? 'Member updated!' : 'Member added!', 'success');
        resetForm();
        fetchMembers();
      } else {
        Swal.fire('Error', 'Failed to save member', 'error');
      }
    } catch (err) { Swal.fire('Error', err.message, 'error'); }
  };

  const handleEdit = (m) => {
    setEditId(m._id);
    setFormData({ name: m.name, role: m.role, bio: m.bio || '', photoUrl: m.photoUrl || '', order: m.order || 0, visible: m.visible });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this team member?')) return;
    try {
      await fetch(`${API_URL}/api/team/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
      fetchMembers();
    } catch (err) { console.error(err); }
  };

  const toggleVisible = async (m) => {
    try {
      await fetch(`${API_URL}/api/team/${m._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ ...m, visible: !m.visible })
      });
      fetchMembers();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '25px', border: '1px solid #e0e0e0' }}>
        <h3 style={{ marginTop: 0, color: '#d94f00' }}>{editId ? 'Update Member' : 'Add Leadership / Team Member'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label>Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px' }} />
          </div>
          <div>
            <label>Role * (Ex: Founder, President, Secretary)</label>
            <input type="text" name="role" value={formData.role} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px' }} />
          </div>
          <div>
            <label>Display Order (0 = first)</label>
            <input type="number" name="order" value={formData.order} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px' }} />
          </div>
          <div>
            <label>Photo</label>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ width: '100%', marginTop: '5px' }} />
            {uploading && <p style={{ color: '#1976d2', fontSize: '0.85rem' }}>Uploading...</p>}
            {formData.photoUrl && <img src={formData.photoUrl} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', marginTop: '8px' }} />}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Short Bio (optional)</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows="2" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" name="visible" checked={formData.visible} onChange={handleChange} id="visibleCheck" />
            <label htmlFor="visibleCheck" style={{ cursor: 'pointer' }}>Visible on website</label>
          </div>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ background: '#1b5e20', color: 'white', padding: '10px 22px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {editId ? 'Update Member' : 'Add Member'}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} style={{ background: '#e53935', color: 'white', padding: '10px 22px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {loading ? <p>Loading...</p> : (
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: '#1b5e20', color: 'white' }}>
                <th>Photo</th><th>Name</th><th>Role</th><th>Order</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length > 0 ? members.map((m) => (
                <tr key={m._id}>
                  <td><img src={m.photoUrl || 'https://via.placeholder.com/50'} alt={m.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} /></td>
                  <td style={{ fontWeight: 'bold' }}>{m.name}</td>
                  <td>{m.role}</td>
                  <td>{m.order}</td>
                  <td>
                    <span style={{ color: m.visible ? '#2e7d32' : '#999', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => toggleVisible(m)}>
                      <i className={`fas ${m.visible ? 'fa-eye' : 'fa-eye-slash'}`}></i> {m.visible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(m)} style={{ color: '#1976d2', border: 'none', background: 'none', cursor: 'pointer', marginRight: '12px' }} title="Edit"><i className="fas fa-edit"></i></button>
                    <button onClick={() => handleDelete(m._id)} style={{ color: '#e53935', border: 'none', background: 'none', cursor: 'pointer' }} title="Delete"><i className="fas fa-trash-alt"></i></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No team members added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ---------- Contact page info (address, leadership summary, key contacts, email) ----------
const ContactInfoSection = () => {
  const [data, setData] = useState({ orgName: '', addressLines: [''], leadership: [{ name: '', role: '' }], keyContacts: [''], email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getToken = () => {
    const infoStr = localStorage.getItem('userInfo');
    return infoStr ? JSON.parse(infoStr).token : '';
  };

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch(`${API_URL}/api/contact-info`);
        if (res.ok) {
          const d = await res.json();
          setData({
            orgName: d.orgName || '',
            addressLines: d.addressLines?.length ? d.addressLines : [''],
            leadership: d.leadership?.length ? d.leadership : [{ name: '', role: '' }],
            keyContacts: d.keyContacts?.length ? d.keyContacts : [''],
            email: d.email || ''
          });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchInfo();
  }, []);

  const updateArrayField = (field, index, value) => {
    const updated = [...data[field]];
    updated[index] = value;
    setData({ ...data, [field]: updated });
  };

  const updateLeadershipField = (index, key, value) => {
    const updated = [...data.leadership];
    updated[index] = { ...updated[index], [key]: value };
    setData({ ...data, leadership: updated });
  };

  const addRow = (field, emptyValue) => setData({ ...data, [field]: [...data[field], emptyValue] });
  const removeRow = (field, index) => setData({ ...data, [field]: data[field].filter((_, i) => i !== index) });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/contact-info`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          ...data,
          addressLines: data.addressLines.filter(l => l.trim() !== ''),
          leadership: data.leadership.filter(l => l.name.trim() !== ''),
          keyContacts: data.keyContacts.filter(c => c.trim() !== '')
        })
      });
      if (res.ok) {
        Swal.fire('Success', 'Contact info updated!', 'success');
      } else {
        Swal.fire('Error', 'Failed to update contact info', 'error');
      }
    } catch (err) { Swal.fire('Error', err.message, 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold' }}>Organization Name</label>
        <input type="text" value={data.orgName} onChange={(e) => setData({ ...data, orgName: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px' }} />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold' }}>Office Address (one line each)</label>
        {data.addressLines.map((line, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input type="text" value={line} onChange={(e) => updateArrayField('addressLines', i, e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
            <button type="button" onClick={() => removeRow('addressLines', i)} style={{ color: '#e53935', border: 'none', background: 'none', cursor: 'pointer' }}><i className="fas fa-trash-alt"></i></button>
          </div>
        ))}
        <button type="button" onClick={() => addRow('addressLines', '')} style={{ marginTop: '8px', background: '#e8f5e9', color: '#1b5e20', border: '1px solid #a5d6a7', borderRadius: '5px', padding: '6px 12px', cursor: 'pointer' }}>+ Add Line</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold' }}>Leadership (shown on Contact page)</label>
        {data.leadership.map((person, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input type="text" placeholder="Name" value={person.name} onChange={(e) => updateLeadershipField(i, 'name', e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
            <input type="text" placeholder="Role" value={person.role} onChange={(e) => updateLeadershipField(i, 'role', e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
            <button type="button" onClick={() => removeRow('leadership', i)} style={{ color: '#e53935', border: 'none', background: 'none', cursor: 'pointer' }}><i className="fas fa-trash-alt"></i></button>
          </div>
        ))}
        <button type="button" onClick={() => addRow('leadership', { name: '', role: '' })} style={{ marginTop: '8px', background: '#e8f5e9', color: '#1b5e20', border: '1px solid #a5d6a7', borderRadius: '5px', padding: '6px 12px', cursor: 'pointer' }}>+ Add Person</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold' }}>Key Contacts</label>
        {data.keyContacts.map((name, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input type="text" value={name} onChange={(e) => updateArrayField('keyContacts', i, e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
            <button type="button" onClick={() => removeRow('keyContacts', i)} style={{ color: '#e53935', border: 'none', background: 'none', cursor: 'pointer' }}><i className="fas fa-trash-alt"></i></button>
          </div>
        ))}
        <button type="button" onClick={() => addRow('keyContacts', '')} style={{ marginTop: '8px', background: '#e8f5e9', color: '#1b5e20', border: '1px solid #a5d6a7', borderRadius: '5px', padding: '6px 12px', cursor: 'pointer' }}>+ Add Contact</button>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <label style={{ fontWeight: 'bold' }}>Email</label>
        <input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px' }} />
      </div>

      <button onClick={handleSave} disabled={saving} style={{ background: '#1b5e20', color: 'white', padding: '12px 28px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
        {saving ? 'Saving...' : 'Save Contact Info'}
      </button>
    </div>
  );
};

export default OrgInfoManager;
