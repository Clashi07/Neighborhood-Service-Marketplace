import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';
import reviewService from '../../services/reviewService';

const statusColor = {
  pending: 'warning',
  confirmed: 'info',
  'in-progress': 'primary',
  completed: 'success',
  cancelled: 'danger',
};

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [reviewedBookings, setReviewedBookings] = useState({});

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', recommended: true });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Reschedule modal
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ newDate: '', reason: '' });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    setBookings(filter ? allBookings.filter(b => b.status === filter) : allBookings);
  }, [filter, allBookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getCustomerBookings();
      const all = res.data || [];
      setAllBookings(all);
      setBookings(all);

      const reviewed = {};
      await Promise.all(
        all.filter(b => b.status === 'completed').map(async (b) => {
          try {
            const r = await reviewService.getMyReview(b._id);
            if (r.data) reviewed[b._id] = true;
          } catch {}
        })
      );
      setReviewedBookings(reviewed);
    } catch (err) {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel
  const handleOpenCancel = (booking) => {
    setCancelTarget(booking);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a cancellation reason.');
      return;
    }
    try {
      setCancelLoading(true);
      await bookingService.cancelBooking(cancelTarget._id, cancelReason);
      setAllBookings(prev =>
        prev.map(b => b._id === cancelTarget._id ? { ...b, status: 'cancelled', cancellationReason: cancelReason } : b)
      );
      setShowCancelModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Reschedule
  const handleOpenReschedule = (booking) => {
    setRescheduleTarget(booking);
    setRescheduleForm({ newDate: '', reason: '' });
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleForm.newDate) {
      alert('Please select a new date.');
      return;
    }
    try {
      setRescheduleLoading(true);
      await bookingService.requestReschedule(
        rescheduleTarget._id,
        rescheduleForm.newDate,
        rescheduleForm.reason
      );
      setAllBookings(prev =>
        prev.map(b => b._id === rescheduleTarget._id
          ? { ...b, rescheduleRequest: { newDate: rescheduleForm.newDate, reason: rescheduleForm.reason, status: 'pending' } }
          : b)
      );
      setShowRescheduleModal(false);
      alert('Reschedule request sent to provider!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request reschedule.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Review
  const handleOpenReview = (booking) => {
    setSelectedBooking(booking);
    setReviewForm({ rating: 5, comment: '', recommended: true });
    setReviewSuccess(false);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    try {
      setReviewLoading(true);
      await reviewService.createReview({
        bookingId: selectedBooking._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        recommended: reviewForm.recommended
      });
      setReviewedBookings(prev => ({ ...prev, [selectedBooking._id]: true }));
      setReviewSuccess(true);
      setTimeout(() => setShowReviewModal(false), 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const canCancel = (booking) => {
    if (['completed', 'cancelled'].includes(booking.status)) return false;
    const hoursUntil = (new Date(booking.scheduledDate) - new Date()) / (1000 * 60 * 60);
    return hoursUntil >= 24;
  };

  const canReschedule = (booking) => {
    if (['completed', 'cancelled'].includes(booking.status)) return false;
    if (booking.rescheduleRequest?.status === 'pending') return false;
    return true;
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const filters = ['', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">My Bookings</span>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/customer/dashboard')}>Dashboard</button>
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/customer/my-requests')}>My Requests</button>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">My Bookings</h4>
          <Button variant="primary" size="sm" onClick={() => navigate('/providers')}>
            + Book a Provider
          </Button>
        </div>

        <div className="d-flex gap-2 flex-wrap mb-4">
          {filters.map(f => (
            <button key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(f)}>
              {f === '' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : bookings.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
              <div style={{ fontSize: '3rem' }}>📅</div>
              <h5 className="mt-3">No bookings found</h5>
              <p className="text-muted">Accept a bid or book a provider directly.</p>
              <Button variant="primary" onClick={() => navigate('/providers')}>Browse Providers</Button>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-3">
            {bookings.map((booking) => (
              <Col md={6} key={booking._id}>
                <Card className={`border-0 shadow-sm h-100
                  ${booking.status === 'completed' ? 'border-start border-success border-3' : ''}
                  ${booking.status === 'cancelled' ? 'border-start border-danger border-3' : ''}`}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0">{booking.serviceRequest?.title}</h6>
                      <Badge bg={statusColor[booking.status] || 'secondary'}>{booking.status}</Badge>
                    </div>

                    <div className="small text-muted mb-1">Provider: <strong>{booking.provider?.name}</strong></div>
                    <div className="small text-muted mb-1">Price: <strong>৳{booking.agreedPrice}</strong></div>
                    <div className="small text-muted mb-2">
                      Scheduled: {new Date(booking.scheduledDate).toLocaleDateString()}
                    </div>

                    {/* Reschedule status banner */}
                    {booking.rescheduleRequest?.status === 'pending' && (
                      <div className="small bg-warning bg-opacity-10 border border-warning rounded p-2 mb-2">
                        ⏳ Reschedule pending — New date: {new Date(booking.rescheduleRequest.newDate).toLocaleDateString()}
                      </div>
                    )}
                    {booking.rescheduleRequest?.status === 'approved' && (
                      <div className="small bg-success bg-opacity-10 border border-success rounded p-2 mb-2">
                        ✅ Reschedule approved
                      </div>
                    )}
                    {booking.rescheduleRequest?.status === 'rejected' && (
                      <div className="small bg-danger bg-opacity-10 border border-danger rounded p-2 mb-2">
                        ❌ Reschedule rejected
                      </div>
                    )}

                    {/* Status flow bar */}
                    {booking.status !== 'cancelled' && (
                      <div className="d-flex gap-1 mb-3 flex-wrap">
                        {['pending', 'confirmed', 'in-progress', 'completed'].map((s, i) => {
                          const currentIdx = ['pending', 'confirmed', 'in-progress', 'completed'].indexOf(booking.status);
                          return (
                            <span key={s} className={`badge ${i < currentIdx ? 'bg-success' : i === currentIdx ? 'bg-primary' : 'bg-light text-dark'}`}>
                              {s}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Cancellation reason */}
                    {booking.status === 'cancelled' && booking.cancellationReason && (
                      <div className="small text-danger mb-2">
                        Reason: {booking.cancellationReason}
                      </div>
                    )}

                    {/* Completed */}
                    {booking.status === 'completed' && (
                      <div className="mb-2">
                        <div className="text-success fw-semibold small mb-2">✅ Work Completed</div>
                        {reviewedBookings[booking._id] ? (
                          <Badge bg="success">✓ Review Submitted</Badge>
                        ) : (
                          <Button variant="outline-warning" size="sm" onClick={() => handleOpenReview(booking)}>
                            ⭐ Leave a Review
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="d-flex gap-2 flex-wrap mt-2">
                      {canReschedule(booking) && (
                        <Button variant="outline-primary" size="sm"
                          onClick={() => handleOpenReschedule(booking)}>
                          📅 Reschedule
                        </Button>
                      )}
                      {canCancel(booking) && (
                        <Button variant="outline-danger" size="sm"
                          onClick={() => handleOpenCancel(booking)}>
                          ✕ Cancel
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Cancel Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-2">
            Booking: <strong>{cancelTarget?.serviceRequest?.title}</strong><br />
            Scheduled: <strong>{cancelTarget && new Date(cancelTarget.scheduledDate).toLocaleDateString()}</strong>
          </p>
          <Alert variant="warning" className="small py-2">
            ⚠️ You can only cancel at least 24 hours before the scheduled time.
          </Alert>
          <Form.Group>
            <Form.Label className="fw-semibold">Reason *</Form.Label>
            <Form.Control as="textarea" rows={3}
              placeholder="Please provide a reason..."
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>Keep Booking</Button>
          <Button variant="danger" onClick={handleConfirmCancel} disabled={cancelLoading}>
            {cancelLoading ? <Spinner size="sm" /> : 'Confirm Cancellation'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reschedule Modal */}
      <Modal show={showRescheduleModal} onHide={() => setShowRescheduleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Request Reschedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Booking: <strong>{rescheduleTarget?.serviceRequest?.title}</strong><br />
            Current date: <strong>{rescheduleTarget && new Date(rescheduleTarget.scheduledDate).toLocaleDateString()}</strong>
          </p>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">New Date *</Form.Label>
            <Form.Control type="date" min={today}
              value={rescheduleForm.newDate}
              onChange={e => setRescheduleForm(prev => ({ ...prev, newDate: e.target.value }))} />
          </Form.Group>
          <Form.Group>
            <Form.Label className="fw-semibold">Reason (Optional)</Form.Label>
            <Form.Control as="textarea" rows={2}
              placeholder="Why do you need to reschedule?"
              value={rescheduleForm.reason}
              onChange={e => setRescheduleForm(prev => ({ ...prev, reason: e.target.value }))} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRescheduleModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmReschedule} disabled={rescheduleLoading}>
            {rescheduleLoading ? <Spinner size="sm" /> : 'Send Request'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Rate & Review Provider</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewSuccess ? (
            <div className="text-center py-3">
              <div style={{ fontSize: '3rem' }}>✅</div>
              <p className="text-success fw-bold mt-2">Review submitted successfully!</p>
            </div>
          ) : (
            <>
              <p className="text-muted small mb-3">
                Service: <strong>{selectedBooking?.serviceRequest?.title}</strong> —
                Provider: <strong>{selectedBooking?.provider?.name}</strong>
              </p>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Your Rating</Form.Label>
                <div className="d-flex gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} style={{ fontSize: '2rem', cursor: 'pointer' }}
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}>
                      {star <= reviewForm.rating ? '⭐' : '☆'}
                    </span>
                  ))}
                  <span className="ms-2 align-self-center text-muted small">{reviewForm.rating}/5</span>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Comment (Optional)</Form.Label>
                <Form.Control as="textarea" rows={3}
                  placeholder="Share your experience..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} />
              </Form.Group>
              <Form.Check type="checkbox" id="recommended"
                label="I would recommend this provider to others"
                checked={reviewForm.recommended}
                onChange={e => setReviewForm(prev => ({ ...prev, recommended: e.target.checked }))} />
            </>
          )}
        </Modal.Body>
        {!reviewSuccess && (
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReviewModal(false)}>Cancel</Button>
            <Button variant="warning" onClick={handleSubmitReview} disabled={reviewLoading}>
              {reviewLoading ? <><Spinner size="sm" className="me-1" />Submitting...</> : '⭐ Submit Review'}
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </div>
  );
};

export default MyBookingsPage;