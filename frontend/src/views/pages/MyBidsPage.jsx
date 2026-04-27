import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bidService from '../../services/bidService';

const statusColor = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'danger',
  withdrawn: 'secondary',
};

const MyBidsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchBids(); }, []);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const res = await bidService.getMyBids();
      setBids(res.data || []);
    } catch (err) {
      setError('Failed to load your bids.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (bidId) => {
    if (!window.confirm('Withdraw this bid?')) return;
    try {
      await bidService.withdrawBid(bidId);
      setBids((prev) => prev.map((b) => b._id === bidId ? { ...b, status: 'withdrawn' } : b));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw bid.');
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">My Bids</span>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/provider/dashboard')}>Dashboard</button>
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/provider/browse-requests')}>Browse Requests</button>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <Container className="py-4">
        <h4 className="fw-bold mb-4">My Bids</h4>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
        ) : bids.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
              <h5>No bids placed yet</h5>
              <p className="text-muted">Browse open requests and place your first bid.</p>
              <Button variant="success" onClick={() => navigate('/provider/browse-requests')}>
                Browse Requests
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-3">
            {bids.map((bid) => (
              <Col md={6} lg={4} key={bid._id}>
                <Card className={`border-0 shadow-sm h-100 ${bid.status === 'accepted' ? 'border-success border-2' : ''}`}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0">{bid.serviceRequest?.title || 'Request'}</h6>
                      <Badge bg={statusColor[bid.status] || 'secondary'} className="ms-2">
                        {bid.status}
                      </Badge>
                    </div>

                    <div className="small text-muted mb-1">
                      Your Price: <strong>{bid.proposedPrice}</strong>
                    </div>
                    <div className="small text-muted mb-1">
                      Duration: {bid.estimatedDuration?.value} {bid.estimatedDuration?.unit}
                    </div>
                    <div className="small text-muted mb-1">
                      Request Budget: {bid.serviceRequest?.budget?.min} - {bid.serviceRequest?.budget?.max}
                    </div>
                    <div className="small text-muted mb-1">
                      Request Status: <Badge bg="secondary" className="ms-1">{bid.serviceRequest?.status}</Badge>
                    </div>
                    <div className="small text-muted mb-3">
                      Submitted: {new Date(bid.createdAt).toLocaleDateString()}
                    </div>

                    <p className="small bg-light p-2 rounded mb-3">"{bid.message}"</p>

                    {bid.status === 'accepted' && (
                      <div>
                        <div className="text-success fw-semibold small mb-2">
                          Your bid was accepted! Check My Jobs to manage this booking.
                        </div>
                        <Button variant="success" size="sm" onClick={() => navigate('/provider/my-jobs')}>
                          View Job
                        </Button>
                      </div>
                    )}
                    {bid.status === 'pending' && (
                      <Button variant="outline-danger" size="sm" onClick={() => handleWithdraw(bid._id)}>
                        Withdraw Bid
                      </Button>
                    )}
                    {bid.status === 'rejected' && (
                      <div className="text-danger small">This bid was not selected.</div>
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

export default MyBidsPage;