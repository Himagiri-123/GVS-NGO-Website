import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; 
import './index.css';
import API_URL from '../../config/api';

const InitiativesManager = ({ forceCategory = null }) => {
  const [selectedCategory, setSelectedCategory] = useState(forceCategory);
  const [initiativeData, setInitiativeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [customCategories, setCustomCategories] = useState([]);

  const defaultCategories = [
    { id: 'education', name: 'Education (VVK)', icon: 'fas fa-book-reader' },
    { id: 'health', name: 'Health & Sanitation', icon: 'fas fa-heartbeat' },
    { id: 'skill-development', name: 'Skill Development', icon: 'fas fa-laptop' },
    { id: 'spirituality', name: 'Spirituality & Culture', icon: 'fas fa-om' },
    { id: 'environment', name: 'Environment', icon: 'fas fa-leaf' },
    { id: 'agriculture', name: 'Agriculture', icon: 'fas fa-tractor' },
    { id: 'others', name: 'Other Activities', icon: 'fas fa-hands-helping' }
  ];

  useEffect(() => {
    const fetchAllInitiatives = async () => {
      try {
        const res = await fetch(`${API_URL}/api/initiatives`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const defaultIds = defaultCategories.map(c => c.id);
            const custom = data
              .filter(d => !defaultIds.includes(d.slug)) 
              .map(d => ({
                id: d.slug,
                name: d.title,
                icon: d.icon || 'fas fa-star',
                category: d.category || 'others' 
              }));
            setCustomCategories(custom);
          }
        }
      } catch (err) { console.error("Error fetching custom initiatives:", err); }
    };
    
    if (!forceCategory) {
      fetchAllInitiatives();
    }
  }, [forceCategory]);

  useEffect(() => {
    if (forceCategory) {
      fetchInitiativeData(forceCategory);
    }
  }, [forceCategory]);

  const fetchInitiativeData = async (slug) => {
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      const response = await fetch(`${API_URL}/api/initiatives/${slug}`);
      if (!response.ok) throw new Error('Data not found or server error');
      const data = await response.json();
      setInitiativeData(data);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    fetchInitiativeData(slug);
  };

  const handleBack = () => {
    if(forceCategory) return; 
    setSelectedCategory(null);
    setInitiativeData(null);
    setSuccessMsg('');
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      const infoStr = localStorage.getItem('userInfo') || localStorage.getItem('staffInfo');
      const userInfo = JSON.parse(infoStr);
      
      const response = await fetch(`${API_URL}/api/initiatives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(initiativeData),
      });
      if (!response.ok) throw new Error('Update failed, please try again.');
      setSuccessMsg('✅ Data and Photos successfully updated! Check the public website.');
      
      if (!defaultCategories.find(c => c.id === initiativeData.slug) && !customCategories.find(c => c.id === initiativeData.slug)) {
         setCustomCategories([...customCategories, { id: initiativeData.slug, name: initiativeData.title, icon: initiativeData.icon || 'fas fa-star', category: initiativeData.category }]);
      }
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const handleCreateNewInitiative = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Add New Program',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Program Name (e.g. Ugadi Celebrations)" style="margin-bottom: 10px; width: 80%;">
        <select id="swal-input2" class="swal2-select" style="width: 80%; padding: 10px;">
          <option value="education">Education</option>
          <option value="health">Health & Sanitation</option>
          <option value="skill-development">Skill Development</option>
          <option value="spirituality">Spirituality & Culture</option>
          <option value="environment">Environment</option>
          <option value="agriculture">Agriculture</option>
          <option value="others" selected>Others</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#1b5e20',
      preConfirm: () => {
        const title = document.getElementById('swal-input1').value;
        const category = document.getElementById('swal-input2').value;
        if (!title) {
          Swal.showValidationMessage('Program name is required!');
        }
        return { title, category };
      }
    });

    if (formValues && formValues.title) {
      const { title, category } = formValues;
      const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      
      const newTemplate = {
        slug: slug,
        title: title,
        category: category, 
        description: 'Describe your new program here...',
        icon: 'fas fa-star',
        layout: 'generic',
        sections: [
          { 
            title: 'Event Details', 
            table: { headers: ['Detail', 'Value'], rows: [{ col1: 'Date', col2: '...', status: 'active' }] }, 
            photos: [] 
          }
        ],
        courseTableRows: []
      };

      setSelectedCategory(slug);
      setInitiativeData(newTemplate);
      setSuccessMsg(`✨ New Program Created under "${category.toUpperCase()}"! Fill details and Update.`);
    }
  };

  const handleAddCustomSection = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Add New Custom Table Section',
      html: `
        <input id="sec-title" class="swal2-input" placeholder="Table Title (e.g. Metturu Mandal)" style="margin-bottom: 10px; width: 80%;">
        <input id="sec-headers" class="swal2-input" placeholder="Headers (Comma separated: Name, Age, Mobile)" style="margin-bottom: 10px; width: 80%;">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Add Section',
      preConfirm: () => {
        const title = document.getElementById('sec-title').value;
        const headers = document.getElementById('sec-headers').value;
        if (!title || !headers) {
          Swal.showValidationMessage('Both Title and Headers are required!');
        }
        return { title, headers: headers.split(',').map(h => h.trim()) };
      }
    });

    if (formValues) {
      const newSection = {
        title: formValues.title,
        table: {
          headers: formValues.headers,
          rows: []
        },
        photos: []
      };

      const newData = { ...initiativeData };
      if (!newData.sections) newData.sections = [];
      newData.sections.push(newSection);
      setInitiativeData(newData);
      setSuccessMsg(`✨ New Table Section "${formValues.title}" added successfully! Scroll down to see it.`);
    }
  };

  const handleDeleteSection = async (index) => {
    const result = await Swal.fire({
      title: 'Delete Section?',
      text: "This will permanently remove this table and its photos!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      const newData = { ...initiativeData };
      newData.sections = newData.sections.filter((_, i) => i !== index);
      setInitiativeData(newData);
      setSuccessMsg('🗑️ Section deleted.');
    }
  };

  const addGenericColumn = async (sIndex) => {
    const { value: newHeader } = await Swal.fire({ title: 'New Column Name', input: 'text', inputPlaceholder: 'e.g. Village' });
    if(newHeader) {
      const newSecs = [...initiativeData.sections];
      newSecs[sIndex].table.headers = [...newSecs[sIndex].table.headers, newHeader];
      setInitiativeData(prev => ({ ...prev, sections: newSecs }));
    }
  };
  const editGenericHeader = async (sIndex, cIndex, oldName) => {
    const { value: newHeader } = await Swal.fire({ title: 'Edit Column Name', input: 'text', inputValue: oldName });
    if(newHeader) {
      const newSecs = [...initiativeData.sections];
      newSecs[sIndex].table.headers[cIndex] = newHeader;
      setInitiativeData(prev => ({ ...prev, sections: newSecs }));
    }
  };

  const addSplitColumn = async (side) => {
    const { value: newHeader } = await Swal.fire({ title: 'New Column Name', input: 'text' });
    if(newHeader) {
      const newSide = {...initiativeData[side]};
      newSide.headers = [...newSide.headers, newHeader];
      setInitiativeData(prev => ({ ...prev, [side]: newSide }));
    }
  };
  const editSplitHeader = async (side, cIndex, oldName) => {
    const { value: newHeader } = await Swal.fire({ title: 'Edit Column Name', input: 'text', inputValue: oldName });
    if(newHeader) {
      const newSide = {...initiativeData[side]};
      newSide.headers[cIndex] = newHeader;
      setInitiativeData(prev => ({ ...prev, [side]: newSide }));
    }
  };

  const addPaginatedColumn = async () => {
    const { value: newHeader } = await Swal.fire({ title: 'New Column Name', input: 'text' });
    if(newHeader) {
      setInitiativeData(prev => ({ ...prev, tableHeaders: [...prev.tableHeaders, newHeader] }));
    }
  };
  const editPaginatedHeader = async (cIndex, oldName) => {
    const { value: newHeader } = await Swal.fire({ title: 'Edit Column Name', input: 'text', inputValue: oldName });
    if(newHeader) {
      const newHeaders = [...initiativeData.tableHeaders];
      newHeaders[cIndex] = newHeader;
      setInitiativeData(prev => ({ ...prev, tableHeaders: newHeaders }));
    }
  };

  const handlePhotoUpload = async (e, type, indexOrSide = null) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true); setError(''); setSuccessMsg('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const infoStr = localStorage.getItem('userInfo') || localStorage.getItem('staffInfo');
      const userInfo = JSON.parse(infoStr);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userInfo.token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Photo upload failed!');
      const data = await response.json();
      
      const newPhoto = { url: data.imageUrl, village: 'GVS Activity' }; 
      let newData = { ...initiativeData };

      if (type === 'paginated') {
        newData.photos = [...(newData.photos || []), newPhoto];
      } else if (type === 'generic') {
        newData.sections[indexOrSide].photos = [...(newData.sections[indexOrSide].photos || []), newPhoto];
      } else if (type === 'split') {
        newData[indexOrSide].photos = [...(newData[indexOrSide].photos || []), newPhoto];
      }

      setInitiativeData(newData);
      setSuccessMsg('✅ Photo uploaded temporarily. Click "Update Website Data" to save permanently.');
    } catch (err) {
      setError(err.message);
    }
    setUploadingImage(false);
    e.target.value = '';
  };

  const deletePhoto = (type, photoIndex, sectionOrSide = null) => {
    let newData = { ...initiativeData };
    if (type === 'paginated') {
      newData.photos = newData.photos.filter((_, i) => i !== photoIndex);
    } else if (type === 'generic') {
      newData.sections[sectionOrSide].photos = newData.sections[sectionOrSide].photos.filter((_, i) => i !== photoIndex);
    } else if (type === 'split') {
      newData[sectionOrSide].photos = newData[sectionOrSide].photos.filter((_, i) => i !== photoIndex);
    }
    setInitiativeData(newData);
  };

  const updatePhotoCaption = (type, photoIndex, newCaption, sectionOrSide = null) => {
    let newData = { ...initiativeData };
    if (type === 'paginated') {
      newData.photos[photoIndex].village = newCaption;
    } else if (type === 'generic') {
      newData.sections[sectionOrSide].photos[photoIndex].village = newCaption;
    } else if (type === 'split') {
      newData[sectionOrSide].photos[photoIndex].village = newCaption;
    }
    setInitiativeData(newData);
  };

  const updateCourseRow = (rIndex, colKey, val) => {
    const newRows = [...(initiativeData.courseTableRows || [])];
    newRows[rIndex] = { ...newRows[rIndex], [colKey]: val };
    setInitiativeData({ ...initiativeData, courseTableRows: newRows });
  };
  const addCourseRow = () => { 
    setInitiativeData({ ...initiativeData, courseTableRows: [{ status: 'active' }, ...(initiativeData.courseTableRows || [])] }); 
  };
  const deleteCourseRow = (rIndex) => { 
    setInitiativeData({ ...initiativeData, courseTableRows: (initiativeData.courseTableRows || []).filter((_, i) => i !== rIndex) }); 
  };

  const updatePaginatedRow = (rIndex, colKey, val) => {
    const newRows = [...initiativeData.tableRows];
    newRows[rIndex] = { ...newRows[rIndex], [colKey]: val };
    setInitiativeData({ ...initiativeData, tableRows: newRows });
  };
  const addPaginatedRow = () => { setInitiativeData({ ...initiativeData, tableRows: [{ status: 'active' }, ...(initiativeData.tableRows || [])] }); };
  const deletePaginatedRow = (rIndex) => { setInitiativeData({ ...initiativeData, tableRows: initiativeData.tableRows.filter((_, i) => i !== rIndex) }); };

  const updateGenericRow = (sIndex, rIndex, colKey, val) => {
    const newSections = [...initiativeData.sections];
    newSections[sIndex].table.rows[rIndex] = { ...newSections[sIndex].table.rows[rIndex], [colKey]: val };
    setInitiativeData({ ...initiativeData, sections: newSections });
  };
  const addGenericRow = (sIndex) => {
    const newSections = [...initiativeData.sections];
    if (!newSections[sIndex].table.rows) newSections[sIndex].table.rows = [];
    newSections[sIndex].table.rows.push({ status: 'active' }); 
    setInitiativeData({ ...initiativeData, sections: newSections });
  };
  const deleteGenericRow = (sIndex, rIndex) => {
    const newSections = [...initiativeData.sections];
    newSections[sIndex].table.rows = newSections[sIndex].table.rows.filter((_, i) => i !== rIndex);
    setInitiativeData({ ...initiativeData, sections: newSections });
  };

  const updateSplitRow = (side, rIndex, colKey, val) => {
    const newSideData = { ...initiativeData[side] };
    newSideData.rows[rIndex] = { ...newSideData.rows[rIndex], [colKey]: val };
    setInitiativeData({ ...initiativeData, [side]: newSideData });
  };
  const addSplitRow = (side) => {
    const newSideData = { ...initiativeData[side] };
    if (!newSideData.rows) newSideData.rows = [];
    newSideData.rows.push({ status: 'active' });
    setInitiativeData({ ...initiativeData, [side]: newSideData });
  };
  const deleteSplitRow = (side, rIndex) => {
    const newSideData = { ...initiativeData[side] };
    newSideData.rows = newSideData.rows.filter((_, i) => i !== rIndex);
    setInitiativeData({ ...initiativeData, [side]: newSideData });
  };

  const renderTableEditor = (title, headers, rows, onRowChange, onAddRow, onDeleteRow, onAddColumn = null, onEditHeader = null) => (
    <div style={{ marginTop: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fafafa' }}>
      <h3 style={{ color: '#1b5e20', borderBottom: '2px solid #ddd', paddingBottom: '10px', margin: '0 0 15px 0' }}>{title}</h3>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button type="button" onClick={onAddRow} style={{ background: '#e8f5e9', color: '#1b5e20', border: '2px dashed #81c784', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          <i className="fas fa-plus"></i> Add New Row
        </button>
        {onAddColumn && (
          <button type="button" onClick={onAddColumn} style={{ background: '#e8f5e9', color: '#1b5e20', border: '2px dashed #81c784', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            <i className="fas fa-columns"></i> Add New Column
          </button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr>
              <th style={{ background: '#e8f5e9', padding: '10px', border: '1px solid #ccc', textAlign: 'center', width: '50px' }}>S.No</th>
              {headers?.map((h, i) => (
                <th key={i} style={{ background: '#e8f5e9', padding: '10px', border: '1px solid #ccc', textAlign: 'left' }}>
                  {h}
                  {onEditHeader && (
                    <button type="button" onClick={() => onEditHeader(i, h)} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#1b5e20' }} title="Edit Column Name">
                      <i className="fas fa-pencil-alt"></i>
                    </button>
                  )}
                </th>
              ))}
              <th style={{ background: '#e8f5e9', padding: '10px', border: '1px solid #ccc', width: '90px', textAlign: 'center' }}>Status</th>
              <th style={{ background: '#ffebee', padding: '10px', border: '1px solid #ccc', width: '60px', textAlign: 'center' }}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {rows?.map((row, rIndex) => (
              <tr key={rIndex} style={{ opacity: row.status === 'inactive' ? 0.6 : 1, backgroundColor: row.status === 'inactive' ? '#f5f5f5' : 'transparent' }}>
                <td style={{ padding: '5px', border: '1px solid #ccc', textAlign: 'center', fontWeight: 'bold', color: '#555' }}>{rIndex + 1}</td>
                {headers?.map((_, cIndex) => {
                  const colKey = `col${cIndex + 1}`;
                  return (
                    <td key={cIndex} style={{ padding: '5px', border: '1px solid #ccc' }}>
                      <input type="text" value={row[colKey] || ''} onChange={(e) => onRowChange(rIndex, colKey, e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #bbb', borderRadius: '4px' }} disabled={row.status === 'inactive'} />
                    </td>
                  );
                })}
                <td style={{ padding: '5px', border: '1px solid #ccc', textAlign: 'center' }}>
                  <button type="button" onClick={() => onRowChange(rIndex, 'status', row.status === 'inactive' ? 'active' : 'inactive')} style={{ background: row.status === 'inactive' ? '#9e9e9e' : '#4caf50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
                    {row.status === 'inactive' ? 'Inactive' : 'Active'}
                  </button>
                </td>
                <td style={{ padding: '5px', border: '1px solid #ccc', textAlign: 'center' }}>
                  <button type="button" onClick={() => onDeleteRow(rIndex)} style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && (
              <tr><td colSpan={(headers?.length || 1) + 3} style={{ textAlign: 'center', padding: '15px', color: '#888' }}>No records found. Click "Add New Row" to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Added display: 'inline-block' here so the box doesn't take full width on laptop screens. Also added maxWidth: '100%' and overflow: 'hidden' so it doesn't overflow on mobile.
  const renderGalleryEditor = (title, photos, type, sectionOrSide = null) => (
    <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fff' }}>
      <h4 style={{ color: '#d94f00', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
        <i className="fas fa-images"></i> {title} - Photo Gallery
      </h4>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {photos?.map((photo, i) => (
          <div key={i} style={{ position: 'relative', width: '150px', border: '1px solid #ccc', borderRadius: '5px', padding: '8px', background: '#fafafa' }}>
            <img src={photo.url} alt="GVS Activity" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '3px' }} />
            <input type="text" value={photo.village || ''} placeholder="Caption" onChange={(e) => updatePhotoCaption(type, i, e.target.value, sectionOrSide)} style={{ width: '100%', padding: '6px', fontSize: '0.85rem', marginTop: '8px', border: '1px solid #ccc', borderRadius: '3px' }} />
            <button type="button" onClick={() => deletePhoto(type, i, sectionOrSide)} style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}><i className="fas fa-times"></i></button>
          </div>
        ))}
        {(!photos || photos.length === 0) && <p style={{ color: '#888', fontSize: '0.9rem', fontStyle: 'italic' }}>No photos added yet.</p>}
      </div>
      <div style={{ display: 'inline-block', maxWidth: '100%', background: '#e8f5e9', padding: '15px', borderRadius: '5px', border: '2px dashed #4caf50', boxSizing: 'border-box', overflow: 'hidden' }}>
        <label style={{ fontWeight: 'bold', color: '#1b5e20', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <i className="fas fa-cloud-upload-alt" style={{ fontSize: '1.5rem', flexShrink: 0 }}></i> 
          <span style={{ flexShrink: 0 }}>{uploadingImage ? 'Uploading... Please wait' : 'Upload New Photo Here:'}</span>
          <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, type, sectionOrSide)} disabled={uploadingImage} style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} />
        </label>
      </div>
    </div>
  );

  return (
    <div className="initiatives-manager">
      {!selectedCategory ? (
        <>
          <div className="manager-header">
            <h2>Manage Programs & Initiatives</h2>
            <p>Select an existing program to edit, or create a brand new one.</p>
          </div>
          <div className="category-grid">
            
            {defaultCategories.map(cat => (
              <div key={cat.id} className="edit-category-card" onClick={() => handleCategorySelect(cat.id)}>
                <i className={cat.icon}></i>
                <h3>{cat.name}</h3>
                <button className="edit-btn">Edit Data <i className="fas fa-pencil-alt"></i></button>
              </div>
            ))}

            {customCategories.map(cat => (
              <div key={cat.id} className="edit-category-card" onClick={() => handleCategorySelect(cat.id)} style={{ border: '2px solid #81c784', background: '#f1f8e9' }}>
                <i className={cat.icon} style={{ color: '#1b5e20' }}></i>
                <h3 style={{ color: '#1b5e20' }}>{cat.name}</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#555' }}>Category: {cat.category}</p>
                <button className="edit-btn" style={{ background: '#1b5e20', marginTop: '10px' }}>Edit Data <i className="fas fa-pencil-alt"></i></button>
              </div>
            ))}

            <div className="edit-category-card" onClick={handleCreateNewInitiative} style={{ border: '2px dashed #d94f00', background: '#fff3e0', cursor: 'pointer' }}>
              <i className="fas fa-plus-circle" style={{ color: '#d94f00', fontSize: '3rem' }}></i>
              <h3 style={{ color: '#d94f00', marginTop: '10px' }}>Add New Program</h3>
              <p style={{ fontSize: '0.85rem', color: '#555', margin: '10px 0 0 0' }}>Create custom events</p>
            </div>

          </div>
        </>
      ) : (
        <div className="edit-form-section">
          {!forceCategory && (
            <button className="back-btn" onClick={handleBack}>
              <i className="fas fa-arrow-left"></i> Back to Categories
            </button>
          )}
          
          <div className="form-header">
            <h2>Editing: {initiativeData?.title || 'Loading...'}</h2>
            {initiativeData && !defaultCategories.find(c => c.id === initiativeData.slug) && (
               <p style={{background: '#e3f2fd', display: 'inline-block', padding: '5px 10px', borderRadius: '5px', fontSize: '0.9rem'}}>
                 Under Category: <strong>{initiativeData.category?.toUpperCase() || 'OTHERS'}</strong>
               </p>
            )}
          </div>

          {loading && <div style={{ padding: '20px', color: '#1b5e20' }}><i className="fas fa-spinner fa-spin"></i> Processing...</div>}
          {error && <div style={{ padding: '20px', color: 'red', background: '#ffebee', borderRadius: '5px' }}>{error}</div>}
          {successMsg && <div style={{ padding: '20px', color: '#1b5e20', background: '#e8f5e9', borderRadius: '5px', fontWeight: 'bold' }}>{successMsg}</div>}

          {!loading && !error && initiativeData && (
            <form onSubmit={handleSaveChanges} className="data-preview-form" style={{ background: 'white', padding: '25px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', color: '#555' }}>Title:</label>
                <input type="text" value={initiativeData.title} onChange={(e) => setInitiativeData({...initiativeData, title: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', color: '#555' }}>Description:</label>
                <textarea value={initiativeData.description} onChange={(e) => setInitiativeData({...initiativeData, description: e.target.value})} required rows="3" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>

              {selectedCategory === 'skill-development' && (
                <div style={{ border: '2px solid #e0e0e0', padding: '15px', borderRadius: '8px', marginBottom: '30px', backgroundColor: '#fff8f0' }}>
                  <h3 style={{ color: '#d94f00' }}><i className="fas fa-book-open"></i> Course Details (45 Days)</h3>
                  {renderTableEditor("Course Content", ['Course Name', 'Number of Days'], initiativeData.courseTableRows, updateCourseRow, addCourseRow, deleteCourseRow, null, null)}
                </div>
              )}

              {initiativeData.layout === 'paginated' && (
                <>
                  {renderTableEditor("Batch Details Data", initiativeData.tableHeaders, initiativeData.tableRows, updatePaginatedRow, addPaginatedRow, deletePaginatedRow, addPaginatedColumn, editPaginatedHeader)}
                  {renderGalleryEditor("Main", initiativeData.photos, 'paginated')}
                </>
              )}

              {initiativeData.sections?.map((section, sIndex) => (
                <div key={sIndex} style={{ border: '2px solid #81c784', padding: '15px', borderRadius: '8px', marginBottom: '30px', position: 'relative' }}>
                  <button type="button" onClick={() => handleDeleteSection(sIndex)} style={{ position: 'absolute', top: '10px', right: '10px', background: '#d32f2f', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}><i className="fas fa-trash"></i> Delete Table</button>
                  <h3 style={{ color: '#1b5e20', marginTop: 0 }}>{section.title} Settings</h3>
                  {section.table && renderTableEditor(`${section.title} Table`, section.table.headers, section.table.rows, (rIndex, colKey, val) => updateGenericRow(sIndex, rIndex, colKey, val), () => addGenericRow(sIndex), (rIndex) => deleteGenericRow(sIndex, rIndex), () => addGenericColumn(sIndex), (cIndex, old) => editGenericHeader(sIndex, cIndex, old))}
                  {renderGalleryEditor(`${section.title}`, section.photos, 'generic', sIndex)}
                </div>
              ))}

              {initiativeData.layout === 'split' && (
                <>
                  <div style={{ border: '2px solid #e0e0e0', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
                    <h3 style={{ color: '#333' }}>Left Side ({initiativeData.leftSide?.mandal})</h3>
                    {initiativeData.leftSide && renderTableEditor('Table', initiativeData.leftSide.headers, initiativeData.leftSide.rows, (rIndex, colKey, val) => updateSplitRow('leftSide', rIndex, colKey, val), () => addSplitRow('leftSide'), (rIndex) => deleteSplitRow('leftSide', rIndex), () => addSplitColumn('leftSide'), (cIndex, old) => editSplitHeader('leftSide', cIndex, old))}
                    {renderGalleryEditor('Left Side', initiativeData.leftSide?.photos, 'split', 'leftSide')}
                  </div>

                  <div style={{ border: '2px solid #e0e0e0', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
                    <h3 style={{ color: '#333' }}>Right Side ({initiativeData.rightSide?.mandal})</h3>
                    {initiativeData.rightSide && renderTableEditor('Table', initiativeData.rightSide.headers, initiativeData.rightSide.rows, (rIndex, colKey, val) => updateSplitRow('rightSide', rIndex, colKey, val), () => addSplitRow('rightSide'), (rIndex) => deleteSplitRow('rightSide', rIndex), () => addSplitColumn('rightSide'), (cIndex, old) => editSplitHeader('rightSide', cIndex, old))}
                    {renderGalleryEditor('Right Side', initiativeData.rightSide?.photos, 'split', 'rightSide')}
                  </div>
                </>
              )}

              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <button type="button" onClick={handleAddCustomSection} style={{ background: '#fff3e0', color: '#d94f00', padding: '15px 30px', border: '2px dashed #d94f00', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  <i className="fas fa-plus-circle"></i> Add New Custom Table Section
                </button>
              </div>

              <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #eee', textAlign: 'center' }}>
                <button type="submit" disabled={uploadingImage} style={{ background: uploadingImage ? '#888' : '#1b5e20', color: 'white', padding: '15px 40px', border: 'none', borderRadius: '30px', cursor: uploadingImage ? 'not-allowed' : 'pointer', fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(27, 94, 32, 0.3)' }}>
                  <i className="fas fa-save"></i> Update Website Data
                </button>
              </div>

            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default InitiativesManager;