import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import directBookingService from '../../services/directBookingService';

const ProviderBookingRequestsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [agreedPrice, setAgreedPrice] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await directBookingService.getProviderRequests();
      setRequests(res.data || []);
    } catch (err) {
      setError('Failed to load booking requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setActionLoading(selected._id);
      await directBookingService.acceptBooking(selected._id, parseFloat(agreedPrice));
      setRequests(prev => prev.map(r =>
        r._id === selected._id ? { ...r, status: 'accepted', agreedPrice: parseFloat(agreedPrice) } : r
      ));
      setShowAcceptModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept booking.');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(selected._id);
      await directBookingService.rejectBooking(selected._id, rejectReason);
      setRequests(prev => prev.map(r =>
        r._id === selected._id ? { ...r, status: 'rejected' } : r
      ));
      setShowRejectModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject booking.');
    } finally {
      setActionLoading('');
    }
  };

  const statusColor = { pending: 'warning', accepted: 'success', rejected: 'danger', completed: 'secondary' };
  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">Booking Requests</span>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/provider/dashboard')}>Dashboard</button>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <Container className="py-4">
        <h4 className="fw-bold mb-4">Incoming Booking Requests</h4>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
        ) : requests.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
              <h5>No booking requests yet</h5>
              <p className="text-muted">Customers will send direct booking requests here.</p>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-3">
            {requests.map((req) => (
              <Col md={6} key={req._id}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="fw-bold mb-0">{req.customer?.name}</h6>
                        <small className="text-muted">{req.customer?.email}</small>
                      </div>
                      <Badge bg={statusColor[req.status] || 'secondary'}>{req.status}</Badge>
                    </div>

                    <div className="small text-muted mb-1">Phone: {req.customer?.phone || 'N/A'}</div>
                    <div className="small text-muted mb-1">
                      Scheduled: {new Date(req.scheduledDate).toLocaleDateString()}
                    </div>
                    <div className="small text-muted mb-1">Address: {req.address || 'N/A'}</div>
                    <p className="small bg-light p-2 rounded mb-3">{req.description}</p>

                    {req.status === 'accepted' && (
                      <div className="text-success small fw-semibold mb-2">
                        ✅ Accepted — Agreed Price: ৳{req.agreedPrice}
                      </div>
                    )}
                    {req.status === 'rejected' && (
                      <div className="text-danger small fw-semibold mb-2">❌ Rejected</div>
                    )}

                    {req.status === 'pending' && (
                      <div className="d-flex gap-2">
                        <Button variant="success" size="sm"
                          disabled={actionLoading === req._id}
                          onClick={() => { setSelected(req); setAgreedPrice(''); setShowAcceptModal(true); }}>
                          Accept
                        </Button>
                        <Button variant="outline-danger" size="sm"
                          disabled={actionLoading === req._id}
                          onClick={() => { setSelected(req); setRejectReason(''); setShowRejectModal(true); }}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Accept Modal */}
      <Modal show={showAcceptModal} onHide={() => setShowAcceptModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Accept Booking</Modal.Title></Modal.Header>
        <Modal.Body>
          <p className="text-muted small">Customer: <strong>{selected?.customer?.name}</strong></p>
          <Form.Group>
            <Form.Label>Your Price (৳)</Form.Label>
            <Form.Control type="number" placeholder="Enter agreed price"
              value={agreedPrice} onChange={e => setAgreedPrice(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAcceptModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleAccept} disabled={!agreedPrice}>Confirm Accept</Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Reject Booking</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason (Optional)</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Reason for rejection..."
              value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleReject}>Confirm Reject</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProviderBookingRequestsPage;