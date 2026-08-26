import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import GalleryPagination from '../../components/GalleryPagination';
import TablePagination from '../../components/TablePagination';
import Swal from 'sweetalert2'; 
import QRCode from 'qrcode';
import './index.css';
import API_URL from '../../config/api';

const InitiativeDetails = () => {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState(null); 
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [tablePage, setTablePage] = useState(1);
  const [galleryPage, setGalleryPage] = useState(1);
  const rowsPerPage = 10;
  const photosPerPage = 6; 

  const [verifyName, setVerifyName] = useState('');
  const [verifyFatherName, setVerifyFatherName] = useState('');
  const [verifySearchKey, setVerifySearchKey] = useState(''); 
  const [verifyBatchNumber, setVerifyBatchNumber] = useState('');
  const [verifiedStudent, setVerifiedStudent] = useState(null);
  const [verifyError, setVerifyError] = useState('');
  const [qrVerified, setQrVerified] = useState(false); // true when opened via QR code scan
  const [qrDataUrl, setQrDataUrl] = useState(''); // the QR code image shown on the certificate itself

  // The certificate image can render at very different widths (mobile vs desktop).
  // We measure its actual on-screen width and size the overlay text as a fraction
  // of THAT — this is what makes the text land in the same spot on any screen size.
  const certRef = useRef(null);
  const [certWidth, setCertWidth] = useState(800);

  useEffect(() => {
    if (!certRef.current) return;
    const el = certRef.current;
    const updateWidth = () => setCertWidth(el.offsetWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [verifiedStudent]);

  useEffect(() => {
    const fetchInitiativeData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/initiatives/${slug}`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchInitiativeData();
  }, [slug]);

  // If the page was opened via a certificate's QR code (?cert=SERIALNO),
  // fetch and show that certificate directly — no need to re-enter name/father.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const certParam = params.get('cert');
    if (certParam) {
      const fetchByQr = async () => {
        try {
          const res = await fetch(`${API_URL}/api/students/certificate/${certParam}`);
          if (res.ok) {
            const student = await res.json();
            setVerifiedStudent(student);
            setQrVerified(true);
          } else {
            setVerifyError('This QR code does not match any certificate in our records.');
          }
        } catch (err) {
          setVerifyError('Server error while verifying. Please try again.');
        }
      };
      fetchByQr();
    }
  }, [location.search]);

  // Each certificate gets its own unique QR code. Scanning it opens this same
  // page with ?cert=<serial-number> so anyone can instantly see it's genuine.
  useEffect(() => {
    if (verifiedStudent?.certificateSerialNo) {
      const verifyUrl = `${window.location.origin}/initiative/skill-development?cert=${verifiedStudent.certificateSerialNo}`;
      QRCode.toDataURL(verifyUrl, { width: 300, margin: 1 })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(''));
    }
  }, [verifiedStudent]);

  // Converts a "YYYY-MM-DD" date into "28-01-2026" style (day-month-year, all numbers so it fits the blank)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr; // fallback: show as-is if it isn't a normal date
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleVerify = async () => {
    if(!verifyName || !verifyFatherName || !verifySearchKey) {
      return setVerifyError('Please enter Name, Father Name, and Phone/Certificate No.');
    }
    setVerifyError(''); 
    setVerifiedStudent(null);
    
    try {
      const res = await fetch(`${API_URL}/api/students/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchKey: verifySearchKey.trim(), batchNumber: verifyBatchNumber.trim() })
      });

      if (res.ok) {
        const student = await res.json();
        if (student.name.toLowerCase().trim() === verifyName.toLowerCase().trim() &&
            student.fatherName.toLowerCase().trim() === verifyFatherName.toLowerCase().trim()) {
            setVerifiedStudent(student);
            setQrVerified(false);
            
            Swal.fire({
              icon: 'success',
              title: 'Authentic Certificate!',
              text: 'Details verified. Scroll down to see your official certificate.',
              timer: 3000,
              showConfirmButton: false
            });
        } else {
            setVerifyError('Details found, but Student Name or Father Name does not match exactly. Check spelling.');
        }
      } else {
        setVerifyError('No valid certificate found for this Phone or Serial Number.');
      }
    } catch(err) { 
      setVerifyError('Server error while verifying. Please try again.'); 
    }
  };

  const handleDownloadCertificate = () => {
    if(!verifiedStudent) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'Anonymous'; 
    // Important: the certificate background image must be named exactly
    // "certificate-template.jpeg" and placed in the React project's "public" folder.
    img.src = '/certificate-template.jpeg'; 
    
    img.onerror = () => {
      Swal.fire('Error', 'Certificate Template Image not found! Please ensure "certificate-template.jpeg" is in the public folder.', 'error');
    };

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const W = canvas.width;
      const H = canvas.height;

      ctx.drawImage(img, 0, 0, W, H);
      ctx.fillStyle = '#000000'; 

      // These positions match the precisely-measured line locations (found by
      // detecting the printed underlines/text pixel-by-pixel on the template).
      // textAlign 'center' + the blank's midpoint keeps text centered in the
      // blank regardless of how long the name/word is.
      ctx.textAlign = 'center';
      ctx.font = 'italic bold 34px Georgia';
      ctx.fillText(verifiedStudent.name, W * 0.68, H * 0.465);          // Name (blank: 46.4%-89.6%)
      ctx.font = 'italic bold 31px Georgia';
      ctx.fillText(verifiedStudent.fatherName, W * 0.3895, H * 0.513);  // Father's Name (blank: 24.5%-53.4%)

      ctx.font = 'italic bold 23px Arial';
      ctx.fillText(formatDate(verifiedStudent.joinDate), W * 0.6375, H * 0.561);  // Join Date (blank: 56.9%-70.6%)
      ctx.fillText(formatDate(verifiedStudent.endDate), W * 0.8175, H * 0.561);   // End Date (blank: 73.4%-90.1%)

      // Course Name — precisely measured "MS-OFFICE" word position (between "on" and "conducted")
      ctx.fillStyle = '#fdf6ee';
      ctx.fillRect(W * 0.21, H * 0.540, W * 0.138, H * 0.023);
      ctx.font = 'italic bold 18px Georgia';
      ctx.fillStyle = '#000000';
      ctx.fillText(verifiedStudent.courseName || 'MS-OFFICE', W * 0.279, H * 0.561); // (patch: 21%-34.8%)

      // Grade
      ctx.font = 'italic bold 35px Georgia';
      ctx.fillStyle = '#d94f00'; 
      ctx.fillText(verifiedStudent.grade, W * 0.2925, H * 0.662); // (blank: 24.4%-34.1%)

      // Sl. No (top-left) & Batch (top-right), in the white gap below the decorative border
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = '#b71c1c'; 
      ctx.textAlign = 'left';
      ctx.fillText(`Sl. No: ${verifiedStudent.certificateSerialNo}`, W * 0.10, H * 0.075);
      ctx.textAlign = 'right';
      ctx.fillText(`Batch No : ${verifiedStudent.batchNumber}`, W * 0.90, H * 0.075);
      ctx.textAlign = 'left';

      try {
        const finishDownload = () => {
          const dataUrl = canvas.toDataURL('image/jpeg');
          const link = document.createElement('a');
          link.download = `${verifiedStudent.name}_Kalam_Dreams_Certificate.jpg`;
          link.href = dataUrl;
          document.body.appendChild(link); 
          link.click(); 
          document.body.removeChild(link); 
        };

        // Draw the unique QR code (bottom-center) before finishing the download
        if (qrDataUrl) {
          const qrImg = new Image();
          qrImg.onload = () => {
            const qrSize = W * 0.13;
            const qrX = W * 0.5 - qrSize / 2;
            const qrY = H * 0.80;
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#333333';
            ctx.textAlign = 'center';
            ctx.fillText('Scan & Verify', W * 0.5, qrY + qrSize + 18);
            ctx.textAlign = 'left';
            finishDownload();
          };
          qrImg.onerror = finishDownload; // if the QR image fails, still let the download happen
          qrImg.src = qrDataUrl;
        } else {
          finishDownload();
        }
      } catch (err) {
        Swal.fire('Error', 'Failed to generate certificate. Canvas issue.', 'error');
      }
    };
  };

  if (loading) return <div className="loading-screen" style={{textAlign: "center", marginTop: "100px", color: "#1b5e20"}}><h2>Loading Data...</h2></div>;
  if (error || !data) return <div className="error-screen" style={{textAlign: "center", marginTop: "100px", color: "red"}}><h2>{error || "Initiative not found"}</h2></div>;

  const activeBatchRows = data.tableRows?.filter(r => r.status !== 'inactive') || [];
  const currentTableRows = data.layout === "paginated" ? activeBatchRows.slice((tablePage - 1) * rowsPerPage, tablePage * rowsPerPage) : [];
  const currentPhotos = data.layout === "paginated" ? (data.photos || []).slice((galleryPage - 1) * photosPerPage, galleryPage * photosPerPage) : [];
  const totalTablePages = data.layout === "paginated" ? Math.max(1, Math.ceil(activeBatchRows.length / rowsPerPage)) : 1;
  const totalGalleryPages = data.layout === "paginated" ? Math.max(1, Math.ceil((data.photos?.length || 0) / photosPerPage)) : 1;
  const tablePageNumbers = []; for (let i = 1; i <= totalTablePages; i++) tablePageNumbers.push(i);
  const galleryPageNumbers = []; for (let i = 1; i <= totalGalleryPages; i++) galleryPageNumbers.push(i);
  const activeLeftRows = data.leftSide?.rows?.filter(r => r.status !== 'inactive') || [];
  const activeRightRows = data.rightSide?.rows?.filter(r => r.status !== 'inactive') || [];
  const activeCourseRows = data.courseTableRows?.filter(r => r.status !== 'inactive') || [];

  return (
    <div className="initiative-details-page">
      
      <div className="top-icons-wrapper" style={{ position: 'relative', width: '100%', height: '50px', marginBottom: '20px' }}>
        <div style={{ position: 'absolute', left: '0', top: '0', display: 'flex', gap: '15px' }}>
          <button onClick={() => navigate(-1)} className="icon-btn" title="Back"><i className="fas fa-arrow-left"></i></button>
          <Link to="/" className="icon-btn" title="Home"><i className="fas fa-home"></i></Link>
        </div>
        
        {slug === 'skill-development' && (
          <div style={{ position: 'absolute', right: '0', top: '0' }}>
            <button className="kalam-apply-glass-btn" onClick={() => navigate('/apply-kalam-dreams')}>
              <i className="fas fa-laptop-code"></i> Apply for Computer Class
            </button>
          </div>
        )}
      </div>

      <div className="details-header">
        <div className="header-icon"><i className={data.icon}></i></div>
        <h1>{data.title}</h1>
        <p>{data.description}</p>
      </div>

      <div className="details-container">

        {slug === 'skill-development' && (
          <div style={{ background: '#f1f8e9', padding: '30px', borderRadius: '15px', border: '2px solid #81c784', marginBottom: '40px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#1b5e20', marginTop: 0 }}><i className="fas fa-certificate"></i> Verify & Download Certificate</h2>
            <p style={{ color: '#555', marginBottom: '20px' }}>Enter the exact details to verify the authenticity of the Kalam Dreams Computer Center certificate.</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <input type="text" placeholder="Student Name" value={verifyName} onChange={e => setVerifyName(e.target.value)} style={{ padding: '12px', width: '200px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="Father's Name" value={verifyFatherName} onChange={e => setVerifyFatherName(e.target.value)} style={{ padding: '12px', width: '200px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="Phone No OR Cert. ID" value={verifySearchKey} onChange={e => setVerifySearchKey(e.target.value)} style={{ padding: '12px', width: '200px', borderRadius: '5px', border: '1px solid #ccc' }} title="Ex: GVS-KDC-000001 or 9876543210" />
              <input type="text" placeholder="Batch No. (if joined twice)" value={verifyBatchNumber} onChange={e => setVerifyBatchNumber(e.target.value)} style={{ padding: '12px', width: '200px', borderRadius: '5px', border: '1px solid #ccc' }} title="Optional — only needed if the same student has more than one certificate" />
              <button onClick={handleVerify} style={{ background: '#d94f00', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                Verify Now
              </button>
            </div>
            <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '-10px' }}>Batch No. is optional — fill it in only if you have joined the course more than once.</p>
            
            {verifyError && <div style={{ color: '#d32f2f', fontWeight: 'bold', background: '#ffebee', padding: '10px', borderRadius: '5px', display: 'inline-block' }}>{verifyError}</div>}
            
            {/* Live certificate preview */}
            {verifiedStudent && (
              <div style={{ marginTop: '30px', borderTop: '2px dashed #ccc', paddingTop: '30px' }}>
                <h3 style={{ color: '#4caf50', marginBottom: '20px' }}><i className="fas fa-eye"></i> Official Certificate Preview</h3>

                <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', color: '#1b5e20', padding: '10px 20px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '15px', fontWeight: 'bold' }}>
                  <i className="fas fa-check-circle" style={{ color: '#2e7d32' }}></i> Verified — Genuine GVS Certificate
                </div>
                <br />

                <div ref={certRef} style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', border: '5px solid #2c3e50', background: 'white' }}>
                  {/* 1. Background Certificate Image */}
                  <img src="/certificate-template.jpeg" alt="Certificate Background" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  
                  {/* 2. DYNAMIC TEXT OVERLAY - font sizes are a fraction of the certificate's own
                      measured width (certWidth), not the viewport — this is what keeps text from
                      overlapping on narrow mobile screens. */}
                  
                  {/* Sl. No (top-left, in the white gap below the border — not on it) */}
                  <div style={{ position: 'absolute', top: '6.7%', left: '10%', color: '#b71c1c', fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: certWidth * 0.01875, textAlign: 'left', whiteSpace: 'nowrap' }}>
                    Sl. No: {verifiedStudent.certificateSerialNo}
                  </div>

                  {/* Batch (top-right, in the white gap below the border — not on it) */}
                  <div style={{ position: 'absolute', top: '6.7%', right: '10%', color: '#b71c1c', fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: certWidth * 0.01875, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    Batch No : {verifiedStudent.batchNumber}
                  </div>

                  {/* Name (next to Mr/Kum). translateY(-100%) anchors the BOTTOM of the text to "top",
                      so it sits right on the printed line no matter the font size. Left+width+center
                      means the name is centered within the blank line, whatever its length. */}
                  <div style={{ position: 'absolute', top: '46.5%', left: '46.4%', width: '43.2%', textAlign: 'center', color: '#000', fontWeight: 'bold', fontStyle: 'italic', fontFamily: 'Georgia, "Times New Roman", Times, serif', fontSize: certWidth * 0.02625, whiteSpace: 'nowrap', transform: 'translateY(-100%)' }}>
                    {verifiedStudent.name}
                  </div>

                  {/* Father's Name (next to S/o or D/o) */}
                  <div style={{ position: 'absolute', top: '51.3%', left: '24.5%', width: '28.9%', textAlign: 'center', color: '#000', fontWeight: 'bold', fontStyle: 'italic', fontFamily: 'Georgia, "Times New Roman", Times, serif', fontSize: certWidth * 0.02375, whiteSpace: 'nowrap', transform: 'translateY(-100%)' }}>
                    {verifiedStudent.fatherName}
                  </div>

                  {/* Join Date (next to "during"), shown as "28-01-2026" */}
                  <div style={{ position: 'absolute', top: '56.1%', left: '56.9%', width: '13.7%', textAlign: 'center', color: '#000', fontWeight: 'bold', fontStyle: 'italic', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: certWidth * 0.01875, whiteSpace: 'nowrap', transform: 'translateY(-100%)' }}>
                    {formatDate(verifiedStudent.joinDate)}
                  </div>

                  {/* End Date (next to "to"), shown as "28-03-2026" */}
                  <div style={{ position: 'absolute', top: '56.1%', left: '73.4%', width: '16.7%', textAlign: 'center', color: '#000', fontWeight: 'bold', fontStyle: 'italic', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: certWidth * 0.01875, whiteSpace: 'nowrap', transform: 'translateY(-100%)' }}>
                    {formatDate(verifiedStudent.endDate)}
                  </div>

                  {/* Course Name — precisely measured position of the printed "MS-OFFICE" word
                      (between "on" and "conducted"), covered with a matching patch and replaced
                      with the admin-entered course name. */}
                  <div style={{ position: 'absolute', top: '54.0%', left: '21%', width: '13.8%', height: '2.3%', background: '#fdf6ee' }}></div>
                  <div style={{ position: 'absolute', top: '56.1%', left: '21%', width: '13.8%', textAlign: 'center', color: '#000', fontWeight: 'bold', fontStyle: 'italic', fontFamily: 'Georgia, "Times New Roman", Times, serif', fontSize: certWidth * 0.01625, whiteSpace: 'nowrap', transform: 'translateY(-100%)' }}>
                    {verifiedStudent.courseName || 'MS-OFFICE'}
                  </div>

                  {/* Grade (next to "obtained") */}
                  <div style={{ position: 'absolute', top: '66.2%', left: '24.4%', width: '9.7%', textAlign: 'center', color: '#d94f00', fontWeight: 'bold', fontStyle: 'italic', fontFamily: 'Georgia, "Times New Roman", Times, serif', fontSize: certWidth * 0.02875, whiteSpace: 'nowrap', transform: 'translateY(-100%)' }}>
                    {verifiedStudent.grade}
                  </div>

                  {/* Unique QR code per certificate — scanning it opens this page and shows the "Verified" result */}
                  {qrDataUrl && (
                    <div style={{ position: 'absolute', top: '80%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', width: certWidth * 0.1375 }}>
                      <img
                        src={qrDataUrl}
                        alt="Scan to verify"
                        style={{ width: '100%', height: 'auto', background: '#fff', padding: '3px', borderRadius: '4px', display: 'block', margin: '0 auto' }}
                      />
                      <span style={{ display: 'block', fontSize: certWidth * 0.0125, color: '#333', fontWeight: 'bold', marginTop: '2px' }}>Scan &amp; Verify</span>
                    </div>
                  )}
                </div>

                <button onClick={handleDownloadCertificate} style={{ marginTop: '30px', background: '#1b5e20', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(27,94,32,0.3)' }}>
                  <i className="fas fa-download"></i> Download High-Quality Certificate
                </button>
              </div>
            )}
          </div>
        )}

        {data.layout === "split" && (
          <div className="split-layout-container">
            <div className="split-half">
              <div className="table-section">
                <h2>{data.leftSide?.mandal}</h2>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        {data.leftSide?.headers?.map((h, i) => <th key={i}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {activeLeftRows.map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 'bold' }}>{i + 1}</td>
                          {data.leftSide?.headers?.map((_, j) => <td key={j}>{r[`col${j+1}`]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="gallery-section">
                <h3>Gallery</h3>
                <div className="gallery-grid-3">
                  {data.leftSide?.photos?.map((photo, index) => (
                    <div className="gallery-card" key={index} onClick={() => setSelectedImage(photo.url)}>
                      <img src={photo.url} alt={photo.village} />
                      <div className="gallery-caption"><i className="fas fa-map-marker-alt"></i> {photo.village}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="split-half">
              <div className="table-section">
                <h2>{data.rightSide?.mandal}</h2>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        {data.rightSide?.headers?.map((h, i) => <th key={i}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {activeRightRows.map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 'bold' }}>{i + 1}</td>
                          {data.rightSide?.headers?.map((_, j) => <td key={j}>{r[`col${j+1}`]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="gallery-section">
                <h3>Gallery</h3>
                <div className="gallery-grid-3">
                  {data.rightSide?.photos?.map((photo, index) => (
                    <div className="gallery-card" key={index} onClick={() => setSelectedImage(photo.url)}>
                      <img src={photo.url} alt={photo.village} />
                      <div className="gallery-caption"><i className="fas fa-map-marker-alt"></i> {photo.village}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {data.layout === "paginated" && (
          <>
            {slug === 'skill-development' && (
              <div className="table-section" style={{ marginBottom: '40px', borderTop: '3px solid #1b5e20', paddingTop: '20px' }}>
                <h2 style={{ color: '#d94f00' }}><i className="fas fa-book-open"></i> Course Details (45 Days)</h2>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Course Name</th>
                        <th>Number of Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeCourseRows.length > 0 ? (
                        activeCourseRows.map((r, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 'bold' }}>{i + 1}</td>
                            <td>{r.col1 || r['Course Name'] || Object.values(r)[1] || '-'}</td>
                            <td>{r.col2 || r['Number of Days'] || Object.values(r)[2] || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" style={{textAlign: 'center', color: '#888', padding: '20px'}}>
                            Course details will be updated soon.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="table-section">
              <h2>Batch Details</h2>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      {data.tableHeaders?.map((h, i) => <th key={i}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {currentTableRows.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 'bold' }}>{(tablePage - 1) * rowsPerPage + i + 1}</td>
                        {data.tableHeaders?.map((_, j) => <td key={j}>{r[`col${j+1}`]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalTablePages > 1 && (
                <div className="number-pagination">
                  <button disabled={tablePage === 1} onClick={() => setTablePage(tablePage - 1)}>&laquo; Prev</button>
                  <div className="page-numbers">
                    {tablePageNumbers.map(num => (
                      <button key={num} className={`num-btn ${tablePage === num ? 'active-num' : ''}`} onClick={() => setTablePage(num)}>{num}</button>
                    ))}
                  </div>
                  <button disabled={tablePage === totalTablePages} onClick={() => setTablePage(tablePage + 1)}>Next &raquo;</button>
                </div>
              )}
            </div>

            <div className="gallery-section">
              <h2>Activity Gallery</h2>
              <div className="gallery-grid-3">
                {currentPhotos.map((photo, index) => (
                  <div className="gallery-card" key={index} onClick={() => setSelectedImage(photo.url)}>
                    <img src={photo.url} alt={photo.village} />
                    <div className="gallery-caption"><i className="fas fa-map-marker-alt"></i> {photo.village}</div>
                  </div>
                ))}
              </div>

              {totalGalleryPages > 1 && (
                <div className="number-pagination">
                  <button disabled={galleryPage === 1} onClick={() => setGalleryPage(galleryPage - 1)}>&laquo; Prev</button>
                  <div className="page-numbers">
                    {galleryPageNumbers.map(num => (
                      <button key={num} className={`num-btn ${galleryPage === num ? 'active-num' : ''}`} onClick={() => setGalleryPage(num)}>{num}</button>
                    ))}
                  </div>
                  <button disabled={galleryPage === totalGalleryPages} onClick={() => setGalleryPage(galleryPage + 1)}>Next &raquo;</button>
                </div>
              )}
            </div>
          </>
        )}

        {data.sections?.map((section, index) => {
          const activeGenericRows = section.table?.rows?.filter(r => r.status !== 'inactive') || [];
          return (
            <div key={index} className="section-block">
              <h2 className="section-title">{section.title}</h2>
              
              {section.table && (
                <div className="table-section" style={{ boxShadow: 'none', padding: '0', marginBottom: '30px' }}>
                  <div className="table-responsive">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          {section.table.headers?.map((h, i) => <th key={i}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {activeGenericRows.length > 0 ? (
                          activeGenericRows.map((r, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 'bold' }}>{i + 1}</td>
                              {section.table.headers?.map((_, j) => (
                                <td key={j}>{r[`col${j+1}`]}</td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={(section.table.headers?.length || 1) + 1} style={{textAlign: 'center', color: '#888'}}>No data available yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {section.photos?.length > 0 ? (
                <GalleryPagination 
                  photos={section.photos} 
                  photosPerPage={6}
                  onImageClick={setSelectedImage} 
                />
              ) : (
                <p style={{textAlign: 'center', color: '#888', fontStyle: 'italic'}}>No photos added to this gallery yet.</p>
              )}
            </div>
          );
        })}

      </div>

      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <span className="close-modal">&times;</span>
          <img src={selectedImage} alt="Enlarged view" className="modal-img" />
        </div>
      )}

    </div>
  );
};

export default InitiativeDetails;