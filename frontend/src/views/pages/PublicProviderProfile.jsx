import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { getProviderById } from '../../services/providerService';
import reviewService from '../../services/reviewService';
import BookNowModal from '../components/customer/BookNowModal';

const PublicProviderProfile = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState('');
  const [showBookModal, setShowBookModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [providerId]);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await getProviderById(providerId);
      setProfile(res.data);
      if (res.data) {
        fetchReviews(providerId);
      }
    } catch (err) {
      setError('Failed to load provider profile.');
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchReviews = async (pId) => {
    try {
      setLoadingReviews(true);
      const res = await reviewService.getProviderReviews(pId);
      setReviews(res.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Provider not found'}</Alert>
        <Button variant="secondary" onClick={() => navigate('/providers')}>
          Back to Providers
        </Button>
      </Container>
    );
  }

  const prices = profile.specializations?.map(s => s.priceMin) || [];
  const minPrice = prices.length ? Math.min(...prices) : profile.hourlyRate;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-vh-100 bg-light py-5">
      <Container>
        <Button variant="outline-secondary" onClick={() => navigate('/providers')} className="mb-4">
          ← Back to Providers
        </Button>

        <div className="row">
          {/* Profile Info */}
          <div className="col-md-8">
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <div className="d-flex align-items-start gap-4">
                  <div className="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center"
                    style={{ width: '120px', height: '120px', fontSize: '48px', flexShrink: 0 }}>
                    {profile.user?.name?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div className="flex-grow-1">
                    <h2 className="fw-bold mb-1">{profile.user?.name}</h2>
                    <div className="mb-3">
                      <span className="text-warning me-3">
                        ⭐ {avgRating} ({reviews.length} reviews)
                      </span>
                      <span className="text-success fw-bold">Starting at ৳{minPrice}</span>
                    </div>
                    <p className="text-muted">{profile.bio || 'No bio provided'}</p>
                    <div className="mb-3">
                      <strong>Experience:</strong> {profile.experience ? `${profile.experience} years` : 'Not specified'}
                    </div>
                    <div className="mb-3">
                      <strong>Service Areas:</strong> {profile.serviceAreas?.join(', ') || 'Remote'}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Specializations */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h5 className="fw-bold mb-3">Services Offered</h5>
                <Row className="g-3">
                  {profile.specializations && profile.specializations.length > 0 ? (
                    profile.specializations.map((spec, idx) => (
                      <Col md={6} key={idx}>
                        <Card className="h-100 border-success border-opacity-25">
                          <Card.Header className="bg-success text-white">
                            <strong>{spec.category?.name || 'Service'}</strong>
                          </Card.Header>
                          <Card.Body>
                            <p className="text-muted small mb-2">{spec.description}</p>
                            <p className="mb-0"><strong>৳{spec.priceMin} - ৳{spec.priceMax}</strong></p>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <p className="text-muted">No services listed</p>
                  )}
                </Row>
              </Card.Body>
            </Card>

            {/* Reviews */}
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="fw-bold mb-3">Customer Reviews ({reviews.length})</h5>
                {loadingReviews ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-3">
                    {reviews.map((review, idx) => (
                      <Card key={idx} className="border-0 border-bottom">
                        <Card.Body className="pb-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="fw-bold mb-1">{review.customer?.name || 'Anonymous'}</h6>
                              <div>
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={i < review.rating ? 'text-warning' : 'text-muted'}>
                                    ★
                                  </span>
                                ))}
                                <span className="ms-2 small text-muted">{review.rating}/5</span>
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
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No reviews yet</p>
                )}
              </Card.Body>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="col-md-4">
            <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
              <Card.Body className="text-center">
                <h5 className="fw-bold mb-3">Ready to Book?</h5>
                <p className="text-muted mb-4">
                  Get started with {profile.user?.name} today
                </p>
                <Button
                  variant="success"
                  className="w-100 py-2"
                  onClick={() => setShowBookModal(true)}
                >
                  📅 Book Now
                </Button>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>

      <BookNowModal
        show={showBookModal}
        onHide={() => setShowBookModal(false)}
        provider={{ _id: profile.user?._id, name: profile.user?.name }}
      />
    </div>
  );
};

export default PublicProviderProfile;
