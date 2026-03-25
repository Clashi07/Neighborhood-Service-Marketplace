import React, { useState, useEffect } from 'react';
import { Card, Badge, Row, Col, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getMyProfile } from '../../../services/providerService';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await getMyProfile();
        if (res.success && res.data) {
          setProfile(res.data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          
          {/* TOP SECTION: Title and Home Button */}
          <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
            <h5 className="fw-bold text-success text-uppercase mb-0" style={{ letterSpacing: '1px' }}>
              Browse Categories
            </h5>
            <Button 
              variant="outline-success" 
              size="sm" 
              className="fw-bold px-3"
              onClick={() => navigate('/provider/dashboard')} 
            >
              Home
            </Button>
          </div>

          {profile ? (
            <Row>
              {/* Left side: Bio and Experience */}
              <Col md={8}>
                <div className="mb-4">
                  <h6 className="fw-bold text-muted small text-uppercase">Professional Bio</h6>
                  <p className="text-dark bg-light p-3 rounded" style={{ lineHeight: '1.6' }}>
                    {profile.bio || "No bio provided."}
                  </p>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-muted small text-uppercase">Work Experience</h6>
                  <p className="text-dark bg-light p-3 rounded" style={{ lineHeight: '1.6' }}>
                    {profile.experience || "No experience details."}
                  </p>
                </div>

                {/* Categories Section */}
                <div>
                  <h6 className="fw-bold text-muted small text-uppercase mb-2">My Categories</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {profile.specializations && profile.specializations.length > 0 ? (
                      profile.specializations.map((spec, index) => (
                        <Badge 
                          key={index} 
                          bg="success" 
                          className="px-3 py-2 fw-normal"
                        >
                          {typeof spec === 'object' ? spec.name : spec}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted small">No categories selected.</span>
                    )}
                  </div>
                </div>
              </Col>

              {/* Right Side: Rate and Navigation */}
              <Col md={4} className="border-start ps-4">
                <div className="mb-4 p-3 bg-light rounded text-center">
                  <h6 className="fw-bold text-muted small text-uppercase mb-1">Hourly Rate</h6>
                  <h3 className="text-success fw-bold mb-0">${profile.hourlyRate || 0}</h3>
                  <small className="text-muted">Fixed Rate</small>
                </div>

                {/* Change Services Button */}
                <div className="mt-4">
                   <Button 
                    variant="success" 
                    className="w-100 fw-bold"
                    onClick={() => navigate('/provider/profile-setup')}
                  >
                    Change Services
                  </Button>
                </div>
              </Col>
            </Row>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No profile data found.</p>
              <Button variant="success" onClick={() => navigate('/provider/profile-setup')}>
                Setup Categories
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProviderDashboard;