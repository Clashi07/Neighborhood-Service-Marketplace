import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Badge, Button, Spinner,
  Alert, Form, Modal
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import serviceRequestService from '../../services/serviceRequestService';
import bidService from '../../services/bidService';
import categoryService from '../../services/categoryService';

const BrowseRequestsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ category: '', minBudget: '', maxBudget: '', location: '' });

  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [bidForm, setBidForm] = useState({
    proposedPrice: '',
    durationValue: '',
    durationUnit: 'hours',
    message: ''
  });
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchRequests();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAllCategories();
      setCategories(Array.isArray(res) ? res : res.data || []);
    } catch {}
  };

  const fetchRequests = async (f = filters) => {
    try {
      setLoading(true);
      const params = {};
      if (f.category) params.category = f.category;
      if (f.minBudget) params.minBudget = f.minBudget;
      if (f.maxBudget) params.maxBudget = f.maxBudget;
      if (f.location) params.location = f.location;
      const res = await serviceRequestService.getAllRequests(params);
      setRequests(res.data || []);
    } catch (err) {
      setError('Failed to load service requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchRequests(filters);
  };

  const openBidModal = (request) => {
    setSelectedRequest(request);
    setBidForm({ proposedPrice: '', durationValue: '', durationUnit: 'hours', message: '' });
    setBidError('');
    setShowModal(true);
  };

  const handleBidSubmit = async () => {
    if (!bidForm.proposedPrice || !bidForm.durationValue || !bidForm.message) {
      setBidError('All fields are required.');
      return;
    }
    try {
      setBidLoading(true);
      await bidService.createBid({
        serviceRequest: selectedRequest._id,
        proposedPrice: Number(bidForm.proposedPrice),
        estimatedDuration: {
          value: Number(bidForm.durationValue),
          unit: bidForm.durationUnit
        },
        message: bidForm.message,
      });
      setShowModal(false);
      setRequests((prev) =>
        prev.map((r) => r._id === selectedRequest._id ? { ...r, hasMyBid: true } : r)
      );
      alert('Bid placed successfully!');
    } catch (err) {
      setBidError(err.response?.data?.message || 'Failed to place bid.');
    } finally {
      setBidLoading(false);
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const statusColor = { open: 'success', bidding: 'warning', assigned: 'primary' };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">Browse Requests</span>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/provider/dashboard')}>Dashboard</button>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <Container className="py-4">
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Form onSubmit={handleFilterSubmit}>
              <Row className="g-2 align-items-end">
                <Col md={3}>
                  <Form.Label className="small fw-semibold">Category</Form.Label>
                  <Form.Select name="category" value={filters.category} onChange={handleFilterChange} size="sm">
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Label className="small fw-semibold">Min Budget</Form.Label>
                  <Form.Control name="minBudget" value={filters.minBudget} onChange={handleFilterChange} type="number" placeholder="e.g. 500" size="sm" />
                </Col>
                <Col md={2}>
                  <Form.Label className="small fw-semibold">Max Budget</Form.Label>
                  <Form.Control name="maxBudget" value={filters.maxBudget} onChange={handleFilterChange} type="number" placeholder="e.g. 5000" size="sm" />
                </Col>
                <Col md={3}>
                  <Form.Label className="small fw-semibold">Location</Form.Label>
                  <Form.Control name="location" value={filters.location} onChange={handleFilterChange} type="text" placeholder="City name" size="sm" />
                </Col>
                <Col md={2}>
                  <Button type="submit" variant="success" size="sm" className="w-100">Apply Filters</Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
        ) : requests.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
              <h5 className="mt-3">No open requests found</h5>
              <p className="text-muted">Try changing your filters or check back later.</p>
            </Card.Body>
          </Card>
        ) : (
          <>
            <div className="text-muted small mb-3">{requests.length} request(s) found</div>
            <Row className="g-3">
              {requests.map((req) => (
                <Col md={6} lg={4} key={req._id}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold mb-0" style={{ flex: 1 }}>{req.title}</h6>
                        <Badge bg={statusColor[req.status] || 'secondary'} className="ms-2">{req.status}</Badge>
                      </div>
                      <p className="text-muted small mb-2" style={{
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                      }}>
                        {req.description}
                      </p>
                      <div className="small text-muted mb-1">Category: {req.serviceCategory?.name}</div>
                      <div className="small text-muted mb-1">Budget: {req.budget?.min} - {req.budget?.max}</div>
                      <div className="small text-muted mb-1">Location: {req.location?.city}{req.location?.state ? `, ${req.location.state}` : ''}</div>
                      <div className="small text-muted mb-1">Date: {new Date(req.preferredDate).toLocaleDateString()}</div>
                      <div className="small text-muted mb-3">Customer: {req.customer?.name} | Bids: {req.bidCount || 0}</div>

                      {req.hasMyBid ? (
                        <div className="text-success small fw-semibold">You have already bid on this</div>
                      ) : (
                        <Button variant="success" size="sm" className="w-100" onClick={() => openBidModal(req)}>
                          Place Bid
                        </Button>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Place a Bid</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div className="bg-light rounded p-3 mb-3 small">
              <div className="fw-semibold">{selectedRequest.title}</div>
              <div className="text-muted">Budget: {selectedRequest.budget?.min} - {selectedRequest.budget?.max}</div>
            </div>
          )}
          {bidError && <Alert variant="danger" className="py-2">{bidError}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Proposed Price *</Form.Label>
            <Form.Control
              type="number" min="1" placeholder="e.g. 1500"
              value={bidForm.proposedPrice}
              onChange={(e) => setBidForm({ ...bidForm, proposedPrice: e.target.value })}
            />
          </Form.Group>

          <Form.Label className="fw-semibold small">Estimated Duration *</Form.Label>
          <Row className="mb-3 g-2">
            <Col xs={6}>
              <Form.Control
                type="number" min="1" placeholder="e.g. 3"
                value={bidForm.durationValue}
                onChange={(e) => setBidForm({ ...bidForm, durationValue: e.target.value })}
              />
            </Col>
            <Col xs={6}>
              <Form.Select
                value={bidForm.durationUnit}
                onChange={(e) => setBidForm({ ...bidForm, durationUnit: e.target.value })}
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
              </Form.Select>
            </Col>
          </Row>

          <Form.Group className="mb-2">
            <Form.Label className="fw-semibold small">Proposal Message *</Form.Label>
            <Form.Control
              as="textarea" rows={4}
              placeholder="Describe your experience and why you are the best fit..."
              value={bidForm.message}
              onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
              maxLength={1000}
            />
            <Form.Text className="text-muted">{bidForm.message.length}/1000</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={bidLoading}>Cancel</Button>
          <Button variant="success" onClick={handleBidSubmit} disabled={bidLoading}>
            {bidLoading ? <Spinner size="sm" /> : 'Submit Bid'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BrowseRequestsPage;