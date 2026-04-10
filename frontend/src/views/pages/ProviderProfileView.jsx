import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { getProviderProfile, deleteProviderProfile } from '../../services/providerService';

const ProviderProfileView = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await getProviderProfile();
      setProfile(res.data);
    };
    fetchProfile();
  }, []);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your profile? This cannot be undone.");
    if (confirmDelete) {
      await deleteProviderProfile();
      navigate('/provider/dashboard');
    }
  };

  if (!profile) return <Container className="py-5">Loading...</Container>;

  const hasProfileData = profile.bio || profile.experience > 0 || profile.hourlyRate > 0 || (profile.serviceAreas && profile.serviceAreas.length > 0) || (profile.specializations && profile.specializations.length > 0);

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Container className="py-5">
        <Card className="shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>My Provider Profile</h2>
              <div>
                <Button variant="outline-primary" className="me-2" onClick={() => navigate('/provider/edit-profile')}>
                  Edit Profile
                </Button>
                <Button variant="outline-success" onClick={() => navigate('/provider/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
            
            <Row className="mb-4">
              <Col md={12}>
                <p><strong>Bio:</strong> {profile.bio ? profile.bio : <span className="text-muted fst-italic">Not selected</span>}</p>
                <p><strong>Experience:</strong> {profile.experience ? `${profile.experience} years` : <span className="text-muted fst-italic">Not selected</span>}</p>
                
                <p><strong>Service Areas:</strong> {profile.serviceAreas && profile.serviceAreas.length > 0 ? profile.serviceAreas.join(', ') : <span className="text-muted fst-italic">Not selected</span>}</p>
              </Col>
            </Row>

            <div className="mt-4 pt-4 border-top">
              <h4 className="mb-4">Offered Services</h4>
              {profile.specializations && profile.specializations.length > 0 ? (
                <Row className="g-4">
                  {profile.specializations.map((spec, index) => (
                    <Col md={6} key={index}>
                      <Card className="h-100 border-success border-opacity-25 shadow-sm">
                        <Card.Header className="bg-success text-white">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">{spec.category ? spec.category.name : 'Unknown Category'}</span>
                            <span className="badge bg-light text-success">${spec.priceMin} - ${spec.priceMax}</span>
                          </div>
                        </Card.Header>
                        <Card.Body>
                          <p className="mb-0 text-muted">{spec.description}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <span className="text-muted fst-italic">No services configured yet.</span>
              )}
            </div>

            {hasProfileData && (
              <div className="mt-5 pt-4 border-top text-end">
                <Button variant="danger" onClick={handleDelete}>
                  Delete Profile
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ProviderProfileView;