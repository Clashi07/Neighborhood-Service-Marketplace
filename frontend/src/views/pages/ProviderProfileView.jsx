import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import { getProviderProfile, deleteProviderProfile } from '../../services/providerService';
import reviewService from '../../services/reviewService';

const ProviderProfileView = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProviderProfile();
        setProfile(res.data);
        if (res.data._id) {
          fetchReviews(res.data._id);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const fetchReviews = async (providerId) => {
    try {
      setLoadingReviews(true);
      const res = await reviewService.getProviderReviews(providerId);
      setReviews(res.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

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

            <div className="mt-5 pt-4 border-top">
              <h4 className="mb-4">Customer Reviews</h4>
              {loadingReviews ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : reviews && reviews.length > 0 ? (
                <Row className="g-3">
                  {reviews.map((review, index) => (
                    <Col md={12} key={index}>
                      <Card className="border-0 shadow-sm">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="fw-bold mb-1">
                                {review.customer?.name || 'Anonymous'}
                              </h6>
                              <div className="mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={i < review.rating ? 'text-warning' : 'text-muted'}>
                                    ★
                                  </span>
                                ))}
                                <span className="ms-2 small text-muted">
                                  {review.rating} out of 5 stars
                                </span>
                              </div>
                            </div>
                            {review.recommended && (
                              <span className="badge bg-success">Recommended</span>
                            )}
                          </div>
                          <p className="mb-2">{review.comment}</p>
                          <small className="text-muted">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </small>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <p className="text-muted fst-italic">No reviews yet.</p>
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