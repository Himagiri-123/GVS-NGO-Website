import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import QRCode from 'qrcode';
import './index.css';
import API_URL from '../../config/api';
import { calculateExperience } from '../../config/calculateExperience';

// (calculateExperience is now imported from the shared utility above)

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${d.getFullYear()}`;
};

// A short, role-based line describing what they actually do — fills the certificate
// body with something meaningful instead of leaving empty space.
const responsibilityLine = (category) => {
  switch (category) {
    case 'Coordinator':
      return 'coordinating village-level activities, community outreach, and program implementation';
    case 'Computer Teacher':
      return 'providing computer and digital-skills training to rural students';
    case 'VVK Instructor':
      return 'conducting Vidyarthi Vikas Kendra (VVK) classes and mentoring students in the village';
    default:
      return 'supporting the organization\u2019s rural development activities';
  }
};

// Turns raw stored role values (like the legacy "computer_teacher" slug) into
// a clean, human-readable designation, and avoids showing the same thing twice.
const displayRole = (staff) => {
  if (!staff) return '';
  if (staff.role === 'computer_teacher') return 'Computer Faculty';
  return staff.role || staff.category;
};

const ExperienceCertificate = () => {
  const navigate = useNavigate();
  const certRef = useRef(null);

  // Step 1: public verify — shows basic details + "Verified" badge, NOT the full certificate
  const [verifyName, setVerifyName] = useState('');
  const [verifyFatherName, setVerifyFatherName] = useState('');
  const [verifiedInfo, setVerifiedInfo] = useState(null); // basic details only (name, role, experience)
  const [verifyError, setVerifyError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [roleOptions, setRoleOptions] = useState(null); // set when the same person has multiple roles
  const [selectedRole, setSelectedRole] = useState('');

  // Step 2: staff login — required to actually SEE and download the full certificate
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [myStaff, setMyStaff] = useState(null); // full certificate data, only set after login

  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (myStaff?.experienceCertId) {
      const verifyUrl = `${window.location.origin}/experience-certificate?name=${encodeURIComponent(myStaff.name)}&father=${encodeURIComponent(myStaff.fatherName)}`;
      QRCode.toDataURL(verifyUrl, { width: 300, margin: 1 }).then(setQrDataUrl).catch(() => setQrDataUrl(''));
    }
  }, [myStaff]);

  // Step 1: PUBLIC verify — shows basic details (name, role, experience), never the full certificate
  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!verifyName.trim() || !verifyFatherName.trim()) {
      setVerifyError('Please enter both name and father\'s name.');
      return;
    }
    if (!selectedRole) {
      setVerifyError('Please select their role.');
      return;
    }
    setVerifying(true);
    setVerifyError('');
    setVerifiedInfo(null);
    setMyStaff(null);
    setRoleOptions(null);
    setShowLoginForm(false);
    try {
      const res = await fetch(`${API_URL}/api/staff/verify-experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: verifyName, fatherName: verifyFatherName, category: selectedRole })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.multipleFound) {
          // Shouldn't normally happen since role is now required, but handle it anyway
          setRoleOptions(data.options);
        } else {
          setVerifiedInfo(data);
        }
      } else {
        setVerifyError(data.message || 'No experience certificate found with these details.');
      }
    } catch (err) {
      setVerifyError('Server error. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  // Step 2: staff logs in with their own credentials — only then is the certificate shown.
  // We pass along the role that was just verified, so login picks the SAME record
  // (a person with two roles must get the certificate matching what they verified).
  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const wantedCategory = verifiedInfo?.category || selectedRole || undefined;
      const res = await fetch(`${API_URL}/api/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loginPhone, password: loginPassword, category: wantedCategory, purpose: 'certificate' })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.message || 'Login failed.');
        return;
      }
      if (wantedCategory && data.category !== wantedCategory) {
        setLoginError(`These login details belong to your ${data.category} record, not the ${wantedCategory} record you verified above.`);
        return;
      }
      const certRes = await fetch(`${API_URL}/api/staff/my-certificate`, {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      const certData = await certRes.json();
      if (!certRes.ok) {
        setLoginError(certData.message || 'Could not load your certificate.');
        return;
      }
      setMyStaff(certData);
    } catch (err) {
      setLoginError('Server error. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleDownload = () => {
    if (!certRef.current) return;
    const sheet = certRef.current;
    import('html2canvas').then(({ default: html2canvas }) => {
      // Force the capture to render as if the certificate were 1000px wide,
      // regardless of its actual on-screen size — this keeps downloads at a
      // consistent high resolution on every device, from small phones to desktops.
      html2canvas(sheet, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fdf6ee',
        width: 1000,
        windowWidth: 1000
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${myStaff.name}_GVS_Experience_Certificate.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }).catch(() => {
      Swal.fire('Error', 'Could not generate the certificate image. Please try again.', 'error');
    });
  };

  return (
    <div className="exp-cert-page">
      <div className="exp-cert-topbar">
        <button onClick={() => navigate(-1)} className="icon-btn" title="Back"><i className="fas fa-arrow-left"></i></button>
        <Link to="/" className="icon-btn" title="Home"><i className="fas fa-home"></i></Link>
      </div>

      <div className="exp-cert-header">
        <h2>Staff <span className="highlight">Experience Certificate</span></h2>
        <p>Verify a GVS staff member's experience certificate, or log in to view &amp; download your own.</p>
        <div className="title-underline"></div>
      </div>

      {/* ---- STEP 1: Public verify (confirmation only, no details shown) ---- */}
      {!myStaff && (
        <>
          <form onSubmit={handleVerify} className="exp-verify-form">
            <input type="text" placeholder="Staff Name" value={verifyName} onChange={e => setVerifyName(e.target.value)} />
            <input type="text" placeholder="Father's Name" value={verifyFatherName} onChange={e => setVerifyFatherName(e.target.value)} />
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} required>
              <option value="">Please select your role</option>
              <option value="Coordinator">Coordinator</option>
              <option value="VVK Instructor">VVK Instructor</option>
              <option value="Computer Teacher">Computer Teacher</option>
            </select>
            <button type="submit" disabled={verifying}>{verifying ? 'Verifying...' : 'Verify Now'}</button>
          </form>

          {roleOptions && (
            <div className="exp-error" style={{ background: '#fff8e1', color: '#8a6d00' }}>
              This name matches more than one record ({roleOptions.join(', ')}). Please select the correct role above and click "Verify Now" again.
            </div>
          )}

          {verifyError && <div className="exp-error">{verifyError}</div>}

          {verifiedInfo && (
            <div className="exp-verified-card">
              <div className="exp-verified-badge">
                <i className="fas fa-check-circle"></i> Verified — Genuine GVS Staff Certificate
              </div>
              <div className="exp-verified-details">
                <div><span>Name</span><strong>{verifiedInfo.name}</strong></div>
                <div><span>Designation</span><strong>{displayRole(verifiedInfo)}</strong></div>
                <div><span>Experience</span><strong>{calculateExperience(verifiedInfo.joinDate)}</strong></div>
                <div><span>Working Since</span><strong>{formatDate(verifiedInfo.joinDate)}</strong></div>
              </div>

              {!showLoginForm ? (
                <button className="exp-download-btn" style={{ marginTop: '10px' }} onClick={() => setShowLoginForm(true)}>
                  <i className="fas fa-lock-open"></i> View / Download Certificate
                </button>
              ) : (
                <div className="exp-login-form" style={{ marginTop: '15px', textAlign: 'left' }}>
                  <p><i className="fas fa-lock"></i> Log in with your staff account to view your {verifiedInfo.category} certificate.</p>
                  <form onSubmit={handleStaffLogin}>
                    <input type="tel" placeholder="Your Phone Number" value={loginPhone} onChange={e => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} required />
                    <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                    {loginError && <div className="exp-error">{loginError}</div>}
                    <button type="submit" disabled={loggingIn} className="exp-download-btn" style={{ width: '100%' }}>
                      {loggingIn ? 'Checking...' : 'Login & View My Certificate'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ---- Full certificate — only rendered after a successful staff login ---- */}
      {myStaff && (
        <>
          <div className="exp-verified-badge">
            <i className="fas fa-check-circle"></i> Logged in as {myStaff.name}
          </div>

          <div className="exp-cert-outer">
            <div ref={certRef} className="exp-cert-sheet">
              <div className="exp-cert-bg-photo" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/ngo-building.jpg)` }}></div>
              <div className="exp-cert-watermark">GVS</div>

              <div className="exp-cert-border">
                <div className="exp-cert-topinfo">
                  <div>Certificate No: {myStaff.experienceCertId}</div>
                  <div>Issued: {formatDate(new Date().toISOString().slice(0, 10))}</div>
                </div>

                <div className="exp-cert-orgname">Grameena Vikas Sangham</div>
                <div className="exp-cert-orgaddr">Vikasa Nilayam, Ghanasara Village, Bhamini Mandal, Parvathipuram Manyam Dist, Andhra Pradesh - 532455</div>
                <div className="exp-cert-regd">Regd No 549 / 2008</div>

                <div className="exp-cert-title">
                  <span>❖</span> Certificate of Experience <span>❖</span>
                </div>

                <div className="exp-cert-body">
                  This is to certify that <strong>{myStaff.name}</strong>, S/o {myStaff.fatherName || 'N/A'},
                  has been working with <strong>Grameena Vikas Sangham</strong> as a <strong>{displayRole(myStaff)}</strong>{' '}
                  since <strong>{formatDate(myStaff.joinDate)}</strong>, and has successfully completed
                  <strong> {calculateExperience(myStaff.joinDate)} </strong> of sincere and dedicated service, {responsibilityLine(myStaff.category)}.
                  During this period, <strong>{myStaff.name}</strong> has been posted at{' '}
                  <strong>{myStaff.village || 'N/A'} village, {myStaff.mandal || 'N/A'} mandal, {myStaff.district || 'Parvathipuram Manyam'} district, {myStaff.state || 'Andhra Pradesh'}</strong>,
                  and has consistently demonstrated sincerity, discipline, and good conduct in all assigned responsibilities.
                  We place on record our appreciation for the valuable contribution made towards the organization's mission of rural development.
                </div>

                <div className="exp-cert-details-grid">
                  <div><span>Qualification</span><strong>{myStaff.qualification || 'N/A'}</strong></div>
                  <div><span>Designation</span><strong>{displayRole(myStaff)}</strong></div>
                </div>

                <div className="exp-cert-signatures">
                  <div className="exp-sign-block">
                    <img src="/signatures/eswara-rao-sign.png" alt="Signature" className="exp-sign-img" />
                    <div className="exp-sign-line"></div>
                    <div>Dr. M. Eswara Rao</div>
                    <small>Secretary</small>
                  </div>
                  {qrDataUrl && (
                    <div className="exp-qr-block">
                      <img src={qrDataUrl} alt="Scan to verify" />
                      <small>Scan &amp; Verify</small>
                    </div>
                  )}
                  <div className="exp-sign-block">
                    <img src="/signatures/gudla-satyarao-sign.png" alt="Signature" className="exp-sign-img" />
                    <div className="exp-sign-line"></div>
                    <div>Gudla SatyaRao</div>
                    <small>President</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="exp-cert-actions">
            <button className="exp-download-btn" onClick={handleDownload}>
              <i className="fas fa-download"></i> Download My Certificate
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExperienceCertificate;

