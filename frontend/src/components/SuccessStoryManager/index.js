import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './index.css';
import API_URL from '../../config/api';

const SuccessStoryManager = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    village: '',
    achievement: '',
    quote: '',
    image: ''
  });

  const fetchStories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/success-stories`);
      const data = await res.json();
      setStories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // For uploading a photo
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userInfo?.token}` },
        body: uploadData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormData({ ...formData, image: data.imageUrl });
      Swal.fire('Success', '✅ Photo Uploaded Successfully!', 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to upload photo', 'error');
    } finally {
      setUploading(false);
    }
    e.target.value = ''; 
  };

  // For saving a new success story
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.village || !formData.quote) {
      return Swal.fire('Error', 'Please fill all required details!', 'error');
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/success-stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        Swal.fire('Saved!', 'Success story added successfully.', 'success');
        setFormData({ name: '', village: '', achievement: '', quote: '', image: '' });
        fetchStories();
      } else {
        Swal.fire('Error', 'Failed to save story', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Server error', 'error');
    } finally {
      setLoading(false);
    }
  };

  // For deleting a success story
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This success story will be removed from the home page.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete!'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${API_URL}/api/success-stories/${id}`, { method: 'DELETE' });
        fetchStories();
        Swal.fire('Deleted!', 'Story has been removed.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Failed to delete story', 'error');
      }
    }
  };

  return (
    <div className="accounts-manager-container fade-in">
      <div className="manager-header">
        <h2><i className="fas fa-graduation-cap"></i> Success Stories Manager</h2>
      </div>

      <div className="data-card" style={{ marginBottom: '30px', background: '#f1f8e9', border: '1px solid #c5e1a5' }}>
        <h3 style={{ color: '#2e7d32', marginBottom: '15px' }}><i className="fas fa-plus-circle"></i> Add New Success Story</h3>
        
        <form onSubmit={handleSubmit} className="account-form">
          <div className="form-row">
            <div className="input-group">
              <label>Student Name *</label>
              <input type="text" name="name" placeholder="Ex: Ram Kumar" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Village Name *</label>
              <input type="text" name="village" placeholder="Ex: Ghanasara" value={formData.village} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Achievement (సాధించిన విజయం) *</label>
              <input type="text" name="achievement" placeholder="Ex: Secured Govt Job / IT Job" value={formData.achievement} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <label>Student Photo (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <span style={{color: '#d94f00', fontSize: '0.8rem'}}>Uploading...</span>}
              {formData.image && <span style={{color: '#2e7d32', fontSize: '0.8rem'}}>✅ Photo Ready</span>}
            </div>
          </div>

          <div className="input-group">
            <label>Student Quote (విద్యార్థి చెప్పిన మాట) *</label>
            <textarea name="quote" placeholder="Ex: GVS helped me a lot in my career..." value={formData.quote} onChange={handleInputChange} required rows="3" style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}}></textarea>
          </div>

          <div style={{ textAlign: 'right', marginTop: '15px' }}>
            <button type="submit" className="save-btn" disabled={uploading} style={{ padding: '12px 25px', background: '#2e7d32' }}>
              <i className="fas fa-save"></i> Save Story
            </button>
          </div>
        </form>
      </div>

      <div className="data-card">
        <h3><i className="fas fa-list"></i> Uploaded Stories</h3>
        {loading ? (
          <div style={{textAlign: 'center', padding: '30px'}}><i className="fas fa-spinner fa-spin fa-2x"></i></div>
        ) : (
          <div className="table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th style={{width: '60px'}}>Photo</th>
                  <th>Name</th>
                  <th>Village</th>
                  <th>Achievement</th>
                  <th style={{width: '80px', textAlign: 'center'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {stories.length > 0 ? (
                  stories.map((story) => (
                    <tr key={story._id}>
                      <td style={{textAlign: 'center'}}>
                        {story.image ? <img src={story.image} alt="Student" style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover'}} /> : '-'}
                      </td>
                      <td style={{fontWeight: 'bold'}}>{story.name}</td>
                      <td>{story.village}</td>
                      <td style={{color: '#d94f00'}}>{story.achievement}</td>
                      <td style={{textAlign: 'center'}}>
                        <button onClick={() => handleDelete(story._id)} className="icon-btn delete-btn" style={{color: '#d32f2f', background:'none', border:'none', cursor:'pointer'}}><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px', color: '#888'}}>No success stories found. Add one above!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessStoryManager;