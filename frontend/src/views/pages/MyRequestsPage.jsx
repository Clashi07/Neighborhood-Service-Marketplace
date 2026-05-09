import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Nav, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import serviceRequestService from '../../services/serviceRequestService';
import reviewService from '../../services/reviewService';

const statusColor = {
  open: 'success',
  bidding: 'warning',
  assigned: 'primary',
  completed: 'secondary',
  cancelled: 'danger',
};

// ── Inline Review Modal (no BookNowModal dependency) ─────────────────────────
const ReviewModal = ({ show, onHide, request, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [recommended, setRecommended] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const providerId = request?.acceptedBid?.provider;
  const bookingId  = request?.acceptedBid?.booking || request?.acceptedBid?._id;

  const handleSubmit = async () => {
    if (!comment.trim()) { setError('Please write a comment.'); return; }
    if (!providerId)     { setError('Provider information missing.'); return; }
    try {
      setSubmitting(true);
      setError('');
      await reviewService.createReview({
        provider:    providerId,
        booking:     bookingId,
        serviceRequest: request._id,
        rating,
        comment,
        recommended,
      });
      onSubmitted(request._id);
      onHide();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => { setRating(5); setComment(''); setRecommended(true); setError(''); };

  return (
    <Modal show={show} onHide={() => { onHide(); reset(); }} centered>
      <Modal.Header closeButton>
        <Modal.Title>⭐ Leave a Review</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" className="py-2">{error}</Alert>}

        <p className="text-muted small mb-3">
          Reviewing: <strong>{request?.title}</strong>
        </p>

        {/* Star rating */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Rating</Form.Label>
          <div className="d-flex gap-2" style={{ fontSize: '28px', cursor: 'pointer' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                style={{ color: star <= rating ? '#ffc107' : '#dee2e6', userSelect: 'none' }}
              >
                ★
              </span>
            ))}
            <span className="fs-6 text-muted align-self-center ms-1">{rating}/5</span>
          </div>
        </Form.Group>

        {/* Comment */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Comment</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Form.Group>

        {/* Recommend toggle */}
        <Form.Check
          type="checkbox"
          id="recommend-check"
          label="I would recommend this provider"
          checked={recommended}
          onChange={(e) => setRecommended(e.target.checked)}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={() => { onHide(); reset(); }}>
          Cancel
        </Button>
        <Button variant="warning" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <Spinner animation="border" size="sm" className="me-1" /> : '⭐ '}
          Submit Review
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const MyRequestsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [requests, setRequests]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [filter, setFilter]             = useState('');
  const [reviewedIds, setReviewedIds]   = useState(new Set());
  const [showReview, setShowReview]     = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => { fetchRequests(); }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await serviceRequestService.getMyRequests(filter ? { status: filter } : {});
      const data = res.data || [];
      setRequests(data);

      // Check which completed requests already have a review
      const completedWithBid = data.filter(
        (r) => r.status === 'completed' && r.acceptedBid?._id
      );
      const reviewChecks = await Promise.allSettled(
        completedWithBid.map((r) =>
          reviewService.getMyReviewByRequest(r._id).then((res) => ({
            id: r._id,
            hasReview: !!res?.data,
          }))
        )
      );
      const reviewed = new Set(
        reviewChecks
          .filter((r) => r.status === 'fulfilled' && r.value.hasReview)
          .map((r) => r.value.id)
      );
      setReviewedIds(reviewed);
    } catch (err) {
      setError('Failed to load your requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await serviceRequestService.deleteServiceRequest(id);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete request.');
    }
  };

  const openReviewModal = (req) => {
    setSelectedRequest(req);
    setShowReview(true);
  };

  const handleReviewSubmitted = (requestId) => {
    setReviewedIds((prev) => new Set([...prev, requestId]));
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">My Requests</span>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/customer/dashboard')}>Dashboard</button>
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/customer/create-request')}>+ New Request</button>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">My Service Requests</h4>
          <Button variant="primary" onClick={() => navigate('/customer/create-request')}>
            + Create New Request
          </Button>
        </div>

        <Nav variant="pills" className="mb-4 gap-2">
          {['', 'open', 'bidding', 'assigned', 'completed', 'cancelled'].map((s) => (
            <Nav.Item key={s}>
              <Nav.Link active={filter === s} onClick={() => setFilter(s)} className="px-3 py-1">
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : requests.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
              <h5 className="mt-3">No requests found</h5>
              <p className="text-muted">You have not created any service requests yet.</p>
              <Button variant="primary" onClick={() => navigate('/customer/create-request')}>
                Create Your First Request
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-3">
            {requests.map((req) => {
              const isCompleted  = req.status === 'completed';
              const hasReviewed  = reviewedIds.has(req._id);
              const canReview    = isCompleted && req.acceptedBid?.provider && !hasReviewed;

              return (
                <Col md={6} lg={4} key={req._id}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold mb-0">{req.title}</h6>
                        <Badge bg={statusColor[req.status] || 'secondary'} className="ms-2">
                          {req.status}
                        </Badge>
                      </div>

                      <p className="text-muted small mb-2" style={{
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {req.description}
                      </p>

                      <div className="small text-muted mb-1">
                        Category: {req.serviceCategory?.icon} {req.serviceCategory?.name}
                      </div>
                      <div className="small text-muted mb-1">
                        Budget: {req.budget?.min} - {req.budget?.max}
                      </div>
                      <div className="small text-muted mb-1">
                        Date: {new Date(req.preferredDate).toLocaleDateString()}
                      </div>
                      <div className="small text-muted mb-3">
                        Bids: {req.bidCount || 0} received
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/customer/requests/${req._id}/bids`)}
                        >
                          View Bids
                        </Button>

                        {req.bidCount === 0 && !isCompleted && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(req._id)}
                          >
                            Delete
                          </Button>
                        )}

                        {/* ── Review buttons ── */}
                        {canReview && (
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => openReviewModal(req)}
                          >
                            ⭐ Leave a Review
                          </Button>
                        )}
                        {isCompleted && hasReviewed && (
                          <span className="badge bg-success align-self-center">
                            ✓ Review Submitted
                          </span>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>

      {/* Review Modal */}
      <ReviewModal
        show={showReview}
        onHide={() => setShowReview(false)}
        request={selectedRequest}
        onSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default MyRequestsPage;