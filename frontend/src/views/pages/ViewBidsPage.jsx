import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import serviceRequestService from '../../services/serviceRequestService';
import bidService from '../../services/bidService';

const ViewBidsPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => { fetchData(); }, [sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, bidsRes] = await Promise.all([
        serviceRequestService.getServiceRequest(requestId),
        bidService.getBidsForRequest(requestId, sortBy),
      ]);
      setRequest(reqRes.data);
      setBids(bidsRes.data || []);
    } catch (err) {
      setError('Failed to load bids.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bidId) => {
    if (!window.confirm('Accept this bid? All other bids will be rejected automatically.')) return;
    try {
      setActionLoading(bidId);
      await bidService.acceptBid(bidId);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept bid.');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async (bidId) => {
    if (!window.confirm('Reject this bid?')) return;
    try {
      setActionLoading(bidId);
      await bidService.rejectBid(bidId);
      setBids((prev) => prev.map((b) => b._id === bidId ? { ...b, status: 'rejected' } : b));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject bid.');
    } finally {
      setActionLoading('');
    }
  };

  const statusColor = { pending: 'warning', accepted: 'success', rejected: 'danger', withdrawn: 'secondary' };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">View Bids</span>
          <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/customer/my-requests')}>
            Back to My Requests
          </button>
        </div>
      </nav>

      <Container className="py-4">
        {error && <Alert variant="danger">{error}</Alert>}

        {request && (
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="fw-bold">{request.title}</h5>
                  <p className="text-muted small mb-1">Budget: {request.budget?.min} - {request.budget?.max}</p>
                  <p className="text-muted small mb-0">Preferred: {new Date(request.preferredDate).toLocaleDateString()}</p>
                </div>
                <Badge bg={request.status === 'assigned' ? 'primary' : 'warning'}>{request.status}</Badge>
              </div>
            </Card.Body>
          </Card>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">{bids.length} Bid(s) Received</h6>
          <Form.Select size="sm" style={{ width: 'auto' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Latest First</option>
            <option value="price-low">Price Low to High</option>
            <option value="price-high">Price High to Low</option>
          </Form.Select>
        </div>

        {bids.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
              <h5 className="mt-3">No bids yet</h5>
              <p className="text-muted">Providers have not placed bids on your request yet.</p>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-3">
            {bids.map((bid) => (
              <Col md={6} key={bid._id}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: 40, height: 40 }}>
                          {bid.provider?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold">{bid.provider?.name}</div>
                          <div className="text-muted small">{bid.provider?.email}</div>
                        </div>
                      </div>
                      <Badge bg={statusColor[bid.status] || 'secondary'}>{bid.status}</Badge>
                    </div>

                    <div className="mb-2">
                      <span className="fw-bold text-success fs-5">{bid.proposedPrice}</span>
                      <span className="text-muted small ms-2">proposed price</span>
                    </div>
                    <div className="text-muted small mb-2">
                             Duration: {bid.estimatedDuration?.value} {bid.estimatedDuration?.unit}
                    </div>
                    <p className="small mb-3 p-3 bg-light rounded">"{bid.message}"</p>
                    <div className="text-muted small mb-3">{new Date(bid.createdAt).toLocaleDateString()}</div>

                    {bid.status === 'pending' && request?.status !== 'assigned' && (
                      <div className="d-flex gap-2">
                        <Button variant="success" size="sm" onClick={() => handleAccept(bid._id)} disabled={actionLoading === bid._id}>
                          {actionLoading === bid._id ? <Spinner size="sm" /> : 'Accept'}
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleReject(bid._id)} disabled={actionLoading === bid._id}>
                          Reject
                        </Button>
                      </div>
                    )}
                    {bid.status === 'accepted' && (
                      <div className="text-success fw-semibold small">Bid Accepted - Booking Created</div>
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

export default ViewBidsPage;