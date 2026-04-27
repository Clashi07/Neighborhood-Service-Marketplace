import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import serviceRequestService from '../../services/serviceRequestService';

const statusColor = {
  open: 'success',
  bidding: 'warning',
  assigned: 'primary',
  completed: 'secondary',
  cancelled: 'danger',
};

const MyRequestsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await serviceRequestService.getMyRequests(filter ? { status: filter } : {});
      setRequests(res.data || []);
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
              <Nav.Link
                active={filter === s}
                onClick={() => setFilter(s)}
                className="px-3 py-1"
              >
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
            {requests.map((req) => (
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

                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/customer/requests/${req._id}/bids`)}
                      >
                        View Bids
                      </Button>
                      {req.bidCount === 0 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(req._id)}
                        >
                          Delete
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
    </div>
  );
};

export default MyRequestsPage;