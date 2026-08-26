import React, { useState, useEffect } from 'react';
import './index.css';
import API_URL from '../../config/api';
import Spinner from '../Spinner';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const [contactInfo, setContactInfo] = useState(null);
  const [infoLoading, setInfoLoading] = useState(true);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await fetch(`${API_URL}/api/contact-info`);
        if (res.ok) {
          const data = await res.json();
          setContactInfo(data);
        }
      } catch (err) {
        console.error('Error fetching contact info:', err);
      } finally {
        setInfoLoading(false);
      }
    };
    fetchContactInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', text: '✅ Message sent successfully!' });
        setFormData({ name: '', email: '', phone: '', message: '' }); 
      } else {
        setStatus({ type: 'error', text: data.message || 'Failed to send message.' });
      }
    } catch (error) {
      setStatus({ type: 'error', text: 'Server error. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-section" id="contact">
      <div className="contact-header">
        <h2>Contact Us</h2>
        <div className="title-underline"></div>
      </div>

      <div className="contact-container">
        
        {/* Left Side: Contact Details & Office Address */}
        <div className="contact-details">
          {infoLoading ? (
            <Spinner text="Loading contact details..." />
          ) : (
            <>
              <h3 className="org-name">{contactInfo?.orgName || 'Grameena Vikas Sangham'}</h3>

              <div className="info-card address-block">
                <h4><i className="fas fa-map-marker-alt"></i> Main Office Address:</h4>
                {(contactInfo?.addressLines?.length > 0 ? contactInfo.addressLines : [
                  'Vikasa Nilayam, Ghanasara village,',
                  'Bhamini mandal, Parvathipuram Manyam Dist,',
                  'Andhra Pradesh - 532455'
                ]).map((line, i) => <p key={i}>{line}</p>)}
              </div>

              <div className="info-card leadership-block">
                <h4><i className="fas fa-users"></i> Our Leadership:</h4>
                {(contactInfo?.leadership?.length > 0 ? contactInfo.leadership : [
                  { name: 'Sri K. Rajendra', role: 'Founder' },
                  { name: 'Sri Gudla SatyaRao', role: 'President' },
                  { name: 'Dr. Majji Eswara Rao', role: 'Secretary' }
                ]).map((person, i) => <p key={i}>{person.name} ({person.role})</p>)}
              </div>

              <div className="info-card contacts-block">
                <h4><i className="fas fa-phone-alt"></i> Key Contacts:</h4>
                {(contactInfo?.keyContacts?.length > 0 ? contactInfo.keyContacts : [
                  'Sri Konapala Neelakantam', 'Sri Yerukumajji Appalanayudu'
                ]).map((name, i) => <p key={i}>{name}</p>)}
              </div>

              <div className="info-card email-block">
                <h4><i className="fas fa-envelope"></i> Reach Us via Email:</h4>
                <a href={`mailto:${contactInfo?.email || 'grameenavikassangamsrikakulam@gmail.com'}`} className="email-link">
                  {contactInfo?.email || 'grameenavikassangamsrikakulam@gmail.com'}
                </a>
              </div>
            </>
          )}
        </div>

        {/* Right Side: Message Form & Map Card */}
        <div className="contact-form-wrapper">
          <div className="contact-form-card">
            <h3>Reach Out to Us</h3>
            
            {status.text && (
              <div className={`status-msg ${status.type === 'success' ? 'success' : 'error'}`}>
                {status.text}
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit}>
              <input 
                type="text" 
                placeholder="Name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
              />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required 
              />
              {/* Honeypot field: hidden from real users via CSS, bots tend to fill every field they see */}
              <input
                type="text"
                name="website"
                value={formData.website || ''}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                style={{ position: 'absolute', left: '-9999px' }}
                tabIndex="-1"
                autoComplete="off"
              />
              <textarea 
                placeholder="Message" 
                rows="4" 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
              ></textarea>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'} <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>

          {/* Moved the map card into the empty space below the form */}
          <div className="map-action-card">
            <div className="map-icon-circle">
              <i className="fas fa-map-marked-alt"></i>
            </div>
            <div className="map-text-content">
              <h3>Find Our Office on Google Maps</h3>
              <p>Click below to get exact driving directions to our Main Office in Ghanasara village.</p>
            </div>
            <a 
              href="https://maps.app.goo.gl/b3WvNYK6StLFAgqA7" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="map-open-btn"
            >
              <i className="fas fa-external-link-alt"></i> Open in Google Maps
            </a>
          </div>
          
        </div>
      </div>

    </div>
  );
};

export default Contact;