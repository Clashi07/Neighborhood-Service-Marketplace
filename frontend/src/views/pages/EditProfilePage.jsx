import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, createOrUpdateProfile } from '../../services/providerService';

const ProviderProfileForm = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const [formData, setFormData] = useState({
    bio: '',
    experience: '',
    hourlyRate: 0,
    specializations: [],
    serviceAreas: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const categories = [
    "Plumbing", "Electrician", "House Cleaning", "Carpentry", 
    "Pest Control", "AC Repair", "Painting", "Moving Services",
    "Laundry", "Gardening", "Appliance Repair"
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        if (res && res.success) {
          setFormData(res.data);
        }
      } catch (err) {
        setError("Could not load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleServiceSelect = (serviceName) => {
    setFormData({
      ...formData,
      specializations: [{ name: serviceName, rate: formData.hourlyRate || 0 }]
    });
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await createOrUpdateProfile(formData);
      if (res.success) {
        alert("Profile updated successfully!");
        navigate('/provider/dashboard');
      }
    } catch (err) {
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
        {/* TOP HEADER WITH HOME BUTTON */}
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
          <h5 className="fw-bold text-success text-uppercase mb-0" style={{ letterSpacing: '1px' }}>
            Edit Professional Profile
          </h5>
          <Button 
            variant="outline-success" 
            size="sm" 
            onClick={() => navigate('/provider/dashboard')}
          >
            Home
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold text-dark">Professional Bio</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </Form.Group>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold text-dark">Experience</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold text-dark">Hourly Rate ($)</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* SCROLLABLE DROPDOWN SELECTOR */}
          <Form.Group className="mb-4 position-relative" ref={dropdownRef}>
            <Form.Label className="fw-bold text-dark">Select Primary Service</Form.Label>
            <div 
              className="form-control d-flex justify-content-between align-items-center" 
              style={{ cursor: 'pointer', background: '#fff' }}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className={formData.specializations[0] ? "text-dark" : "text-muted"}>
                {formData.specializations[0]?.name || "Click to choose a service..."}
              </span>
              <span>{showDropdown ? '▲' : '▼'}</span>
            </div>

            {showDropdown && (
              <div 
                className="position-absolute w-100 shadow-lg border rounded bg-white mt-1" 
                style={{ zIndex: 1000, maxHeight: '160px', overflowY: 'auto' }}
              >
                {categories.map((cat, i) => (
                  <div 
                    key={i} 
                    className="p-3 border-bottom dropdown-item-hover" 
                    onClick={() => handleServiceSelect(cat)}
                    style={{ cursor: 'pointer' }}
                  >
                    {cat} {formData.specializations[0]?.name === cat && "✓"}
                  </div>
                ))}
              </div>
            )}
          </Form.Group>

          <div className="d-grid mt-5">
            <Button variant="success" type="submit" size="lg" className="fw-bold" disabled={saving}>
              {saving ? <Spinner size="sm" animation="border" /> : "Save Profile Changes"}
            </Button>
          </div>
        </Form>
      </Card.Body>

      <style>{`
        .dropdown-item-hover:hover {
          background-color: #f8f9fa;
          color: #198754;
          font-weight: bold;
        }
      `}</style>
    </Card>
  );
};

export default ProviderProfileForm;