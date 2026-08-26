import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; 
import './index.css';
import API_URL from '../../config/api';

const HomePageManager = () => {
  const [data, setData] = useState({
    stats: { establishedYear: '', villagesCount: '', impactCount: '', regdNo: '', regdDate: '' },
    carouselPhotos: []
  });
  
  const [newsItems, setNewsItems] = useState([]);
  const [newNewsText, setNewNewsText] = useState('');
  const [newNewsLink, setNewNewsLink] = useState(''); // state for storing the link

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/home`);
        if (!res.ok) throw new Error('Failed to fetch home data');
        const result = await res.json();
        setData(result);
      } catch (err) { setError(err.message); } 
      finally { setLoading(false); }
    };

    const fetchNewsData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/news`);
        if (res.ok) {
          const result = await res.json();
          setNewsItems(result);
        }
      } catch (err) { console.error(err); }
    };

    fetchHomeData();
    fetchNewsData();
  }, []);

  const handleStatChange = (e) => {
    setData({
      ...data,
      stats: { ...data.stats, [e.target.name]: e.target.value }
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true); setError(''); setSuccess('');
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userInfo.token}` },
        body: uploadData,
      });

      if (!response.ok) throw new Error('Photo upload failed!');
      const result = await response.json();
      
      const newPhoto = { url: result.imageUrl, caption: 'GVS Activity' };
      setData({ ...data, carouselPhotos: [...data.carouselPhotos, newPhoto] });
      setSuccess('Photo added to Carousel! Click "Save Changes" to update website.');
    } catch (err) { setError(err.message); } 
    finally { setUploading(false); }
  };

  const removePhoto = (index) => {
    const newPhotos = data.carouselPhotos.filter((_, i) => i !== index);
    setData({ ...data, carouselPhotos: newPhotos });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${API_URL}/api/home`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update home page');
      setSuccess('✅ Home Page updated successfully! Check the public website.');
    } catch (err) { setError(err.message); } 
    finally { setLoading(false); }
  };

  // Sending the link along with the text to the backend
  const handleAddNews = async () => {
    if (!newNewsText.trim()) {
      return Swal.fire('Error', 'Please enter some news text!', 'error');
    }
    try {
      const res = await fetch(`${API_URL}/api/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newNewsText, link: newNewsLink }) 
      });
      if (res.ok) {
        setNewNewsText('');
        setNewNewsLink(''); 
        const updatedRes = await fetch(`${API_URL}/api/news`);
        const updatedData = await updatedRes.json();
        setNewsItems(updatedData);
        Swal.fire('Added', 'News added successfully to the website!', 'success');
      }
    } catch (err) {
      Swal.fire('Error', 'Failed to add news', 'error');
    }
  };

  const handleDeleteNews = async (id) => {
    const result = await Swal.fire({
      title: 'Delete this update?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete'
    });
    if (result.isConfirmed) {
      try {
        await fetch(`${API_URL}/api/news/${id}`, { method: 'DELETE' });
        setNewsItems(newsItems.filter(n => n._id !== id));
        Swal.fire('Deleted!', 'Update removed from website.', 'success');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="home-manager-container">
      <div className="manager-header">
        <h2><i className="fas fa-home"></i> Manage Home Page</h2>
        <p>Update Carousel photos, Stats (Numbers), and Latest Updates.</p>
      </div>

      {error && <div className="alert-error"><i className="fas fa-exclamation-triangle"></i> {error}</div>}
      {success && <div className="alert-success"><i className="fas fa-check-circle"></i> {success}</div>}

      <div className="home-section-card" style={{ borderLeft: '5px solid #d94f00' }}>
        <h3 style={{ color: '#d94f00' }}><i className="fas fa-bullhorn"></i> Latest Updates / News Ticker</h3>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>Add important announcements here. They will scroll at the top of the Home Page.</p>
        
        {/* Added a link input box too */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Ex: Mega Blood Camp on Sunday at GVS Office..." 
              value={newNewsText} 
              onChange={(e) => setNewNewsText(e.target.value)}
              style={{ flex: 2, padding: '10px', borderRadius: '5px', border: '1px solid #ccc', minWidth: '200px' }}
            />
            <input 
              type="url" 
              placeholder="Paste Link Here (Optional) Ex: https://google.com" 
              value={newNewsLink} 
              onChange={(e) => setNewNewsLink(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc', minWidth: '200px' }}
            />
            <button type="button" onClick={handleAddNews} style={{ background: '#d94f00', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <i className="fas fa-plus"></i> Add Update
            </button>
          </div>
        </div>

        <div className="news-list" style={{ background: '#f9f9f9', padding: '10px', borderRadius: '5px', maxHeight: '200px', overflowY: 'auto' }}>
          {newsItems.length > 0 ? (
            newsItems.map(item => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px', marginBottom: '8px', borderLeft: '3px solid #ffca28', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{item.text}</span>
                  {/* The link is also shown in the admin panel */}
                  {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#1565c0', textDecoration: 'underline', marginTop: '3px' }}>{item.link}</a>}
                </div>
                <button type="button" onClick={() => handleDeleteNews(item._id)} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', padding: '5px' }}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#888', margin: '10px 0' }}>No active updates. Add one above!</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="home-form">
        
        <div className="home-section-card">
          <h3><i className="fas fa-chart-line"></i> Update Stats (Numbers)</h3>
          <div className="stats-inputs-grid">
            <div className="input-group">
              <label>Established Year</label>
              <input type="text" name="establishedYear" value={data.stats.establishedYear || ''} onChange={handleStatChange} placeholder="Ex: 2008" />
            </div>
            <div className="input-group">
              <label>Villages Reached</label>
              <input type="text" name="villagesCount" value={data.stats.villagesCount || ''} onChange={handleStatChange} placeholder="Ex: 21+" />
            </div>
            <div className="input-group">
              <label>Total Impact</label>
              <input type="text" name="impactCount" value={data.stats.impactCount || ''} onChange={handleStatChange} placeholder="Ex: 770+" />
            </div>
            <div className="input-group">
              <label>Govt Registration No.</label>
              <input type="text" name="regdNo" value={data.stats.regdNo || ''} onChange={handleStatChange} placeholder="Ex: CIT 2/80G/28/2009-10" />
            </div>
            <div className="input-group">
              <label>Registration Date</label>
              <input type="text" name="regdDate" value={data.stats.regdDate || ''} onChange={handleStatChange} placeholder="Ex: 08/06/2010" />
            </div>
          </div>
        </div>

        <div className="home-section-card">
          <h3><i className="fas fa-images"></i> Update Carousel Photos</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>These photos will automatically scroll in the About section.</p>
          
          <div className="carousel-preview-grid">
            {data.carouselPhotos.map((photo, index) => (
              <div key={index} className="preview-photo-card">
                <img src={photo.url} alt={`Carousel ${index}`} />
                <button type="button" onClick={() => removePhoto(index)} className="delete-photo-btn" title="Remove Photo">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
            
            <label className="upload-new-photo-card">
              <i className="fas fa-plus-circle"></i>
              <span>{uploading ? 'Uploading...' : 'Add New Photo'}</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} hidden />
            </label>
          </div>
        </div>

        <div className="save-action-container">
          <button type="submit" className="save-home-btn" disabled={loading || uploading}>
            {loading ? 'Saving...' : 'Save All Changes'} <i className="fas fa-save"></i>
          </button>
        </div>

      </form>
    </div>
  );
};

export default HomePageManager;