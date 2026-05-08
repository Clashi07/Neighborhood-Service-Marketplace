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
    if (!window.confirm('Mark this job as complete? This will notify the customer.')) return;
    try {
      setCompleting(bookingId);
      await bookingService.completeBooking(bookingId);
      // Update status locally
      setBookings((prev) =>
        prev.map((b) => b._id === bookingId ? { ...b, status: 'completed' } : b)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete job.');
    } finally {
      setCompleting('');
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
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h6 className="fw-bold mb-0">{booking.serviceRequest?.title}</h6>
                      <Badge bg={statusColor[booking.status] || 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="small text-muted mb-1">
                      Customer: <strong>{booking.customer?.name}</strong>
                    </div>
                    <div className="small text-muted mb-1">
                      Agreed Price: <strong>৳{booking.agreedPrice}</strong>
                    </div>
                    <div className="small text-muted mb-3">
                      Scheduled: {new Date(booking.scheduledDate).toLocaleDateString()}
                    </div>

                    {booking.status === 'completed' ? (
                      <div className="text-success fw-semibold small">
                        ✅ Job Completed — Payment received
                      </div>
                    ) : (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleComplete(booking._id)}
                        disabled={completing === booking._id}
                      >
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