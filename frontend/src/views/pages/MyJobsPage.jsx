import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';

const statusColor = {
  pending: 'warning',
  confirmed: 'info',
  'in-progress': 'primary',
  completed: 'success',
  cancelled: 'danger',
};

const MyJobsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState('');
  const [rescheduleAction, setRescheduleAction] = useState('');

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getProviderBookings();
      setBookings(res.data || []);
    } catch (err) {
      setError('Failed to load your jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (bookingId) => {
    if (!window.confirm('Mark this job as complete?')) return;
    try {
      setCompleting(bookingId);
      await bookingService.completeBooking(bookingId);
      setBookings(prev =>
        prev.map(b => b._id === bookingId ? { ...b, status: 'completed' } : b)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete job.');
    } finally {
      setCompleting('');
    }
  };

  const handleRescheduleResponse = async (bookingId, action) => {
    try {
      setRescheduleAction(bookingId + action);
      await bookingService.respondReschedule(bookingId, action);
      setBookings(prev =>
        prev.map(b => {
          if (b._id !== bookingId) return b;
          const updated = {
            ...b,
            rescheduleRequest: { ...b.rescheduleRequest, status: action === 'approve' ? 'approved' : 'rejected' }
          };
          if (action === 'approve') {
            updated.scheduledDate = b.rescheduleRequest.newDate;
          }
          return updated;
        })
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to respond to reschedule.');
    } finally {
      setRescheduleAction('');
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">My Jobs</span>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/provider/dashboard')}>Dashboard</button>
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/provider/my-bids')}>My Bids</button>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <Container className="py-4">
        <h4 className="fw-bold mb-4">My Jobs</h4>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
        ) : bookings.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
              <h5>No jobs yet</h5>
              <p className="text-muted">Accepted bids will appear here as jobs.</p>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-3">
            {bookings.map((booking) => (
              <Col md={6} key={booking._id}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0">{booking.serviceRequest?.title}</h6>
                      <Badge bg={statusColor[booking.status] || 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="small text-muted mb-1">Customer: <strong>{booking.customer?.name}</strong></div>
                    <div className="small text-muted mb-1">Price: <strong>৳{booking.agreedPrice}</strong></div>
                    <div className="small text-muted mb-3">
                      Scheduled: {new Date(booking.scheduledDate).toLocaleDateString()}
                    </div>

                    {/* Reschedule request from customer */}
                    {booking.rescheduleRequest?.status === 'pending' && (
                      <div className="bg-warning bg-opacity-10 border border-warning rounded p-3 mb-3">
                        <div className="small fw-semibold mb-1">
                          ⏳ Customer requested reschedule
                        </div>
                        <div className="small text-muted mb-1">
                          New date: <strong>{new Date(booking.rescheduleRequest.newDate).toLocaleDateString()}</strong>
                        </div>
                        {booking.rescheduleRequest.reason && (
                          <div className="small text-muted mb-2">
                            Reason: {booking.rescheduleRequest.reason}
                          </div>
                        )}
                        <div className="d-flex gap-2">
                          <Button variant="success" size="sm"
                            disabled={rescheduleAction === booking._id + 'approve'}
                            onClick={() => handleRescheduleResponse(booking._id, 'approve')}>
                            {rescheduleAction === booking._id + 'approve'
                              ? <Spinner size="sm" /> : '✓ Approve'}
                          </Button>
                          <Button variant="outline-danger" size="sm"
                            disabled={rescheduleAction === booking._id + 'reject'}
                            onClick={() => handleRescheduleResponse(booking._id, 'reject')}>
                            {rescheduleAction === booking._id + 'reject'
                              ? <Spinner size="sm" /> : '✕ Reject'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {booking.rescheduleRequest?.status === 'approved' && (
                      <div className="small bg-success bg-opacity-10 border border-success rounded p-2 mb-3">
                        ✅ Reschedule approved
                      </div>
                    )}
                    {booking.rescheduleRequest?.status === 'rejected' && (
                      <div className="small bg-danger bg-opacity-10 border border-danger rounded p-2 mb-3">
                        ❌ Reschedule rejected
                      </div>
                    )}

                    {/* Complete button */}
                    {booking.status === 'completed' ? (
                      <div className="text-success fw-semibold small">
                        ✅ Job Completed
                      </div>
                    ) : booking.status !== 'cancelled' && (
                      <Button variant="success" size="sm"
                        onClick={() => handleComplete(booking._id)}
                        disabled={completing === booking._id}>
                        {completing === booking._id
                          ? <><Spinner size="sm" className="me-1" />Completing...</>
                          : '✅ Mark as Complete'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default MyJobsPage;