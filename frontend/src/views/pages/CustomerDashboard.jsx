import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Navbar, Nav, Badge } from 'react-bootstrap';
import ServiceBrowse from '../components/customer/ServiceBrowse';
import bookingService from '../../services/bookingService';
import serviceRequestService from '../../services/serviceRequestService';
import notificationService from '../../services/notificationService';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ requests: 0, bids: 0, bookings: 0, reviews: 0 });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchStats();
    fetchUnread();
  }, []);

  const fetchStats = async () => {
    try {
      const [reqRes, bookRes] = await Promise.all([
        serviceRequestService.getMyRequests({}),
        bookingService.getCustomerBookings()
      ]);
      const requests = reqRes.data || [];
      const bookings = bookRes.data || [];
      const totalBids = requests.reduce((sum, r) => sum + (r.bidCount || 0), 0);
      const reviews = bookings.filter(b => b.status === 'completed').length;
      setStats({
        requests: requests.filter(r => ['open', 'bidding', 'assigned'].includes(r.status)).length,
        bids: totalBids,
        bookings: bookings.length,
        reviews
      });
    } catch {}
  };

  const fetchUnread = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      setUnreadCount(res.unreadCount || 0);
    } catch {}
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand onClick={() => navigate('/customer/dashboard')} style={{ cursor: 'pointer' }}>
            🏘️ Marketplace
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link onClick={() => navigate('/customer/dashboard')}>Home</Nav.Link>
              <Nav.Link onClick={() => navigate('/customer/profile')}>Profile</Nav.Link>
              <Nav.Link onClick={() => navigate('/services')}>Browse Services</Nav.Link>
              <Nav.Link onClick={() => navigate('/providers')}>Browse Providers</Nav.Link>
              <Nav.Link onClick={() => navigate('/customer/my-requests')}>My Requests</Nav.Link>
              <Nav.Link onClick={() => navigate('/customer/my-bookings')}>My Bookings</Nav.Link>
              <Nav.Link onClick={() => navigate('/customer/notifications')} className="position-relative">
                🔔
                {unreadCount > 0 && (
                  <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.6rem' }}>
                    {unreadCount}
                  </Badge>
                )}
              </Nav.Link>
              <Button variant="outline-light" size="sm" onClick={handleLogout} className="ms-2">
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-5">
        {/* Welcome */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h2 className="mb-1">Welcome back, {user?.name}! 👋</h2>
                <p className="text-muted mb-0">Here's what's happening with your services today.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Stats */}
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center" style={{ cursor: 'pointer' }}
              onClick={() => navigate('/customer/my-requests')}>
              <Card.Body>
                <div className="display-4 mb-2">📋</div>
                <h3 className="h2 mb-0">{stats.requests}</h3>
                <p className="text-muted mb-0">Active Requests</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center" style={{ cursor: 'pointer' }}
              onClick={() => navigate('/customer/my-requests')}>
              <Card.Body>
                <div className="display-4 mb-2">💼</div>
                <h3 className="h2 mb-0">{stats.bids}</h3>
                <p className="text-muted mb-0">Received Bids</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center" style={{ cursor: 'pointer' }}
              onClick={() => navigate('/customer/my-bookings')}>
              <Card.Body>
                <div className="display-4 mb-2">📅</div>
                <h3 className="h2 mb-0">{stats.bookings}</h3>
                <p className="text-muted mb-0">Bookings</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center">
              <Card.Body>
                <div className="display-4 mb-2">⭐</div>
                <h3 className="h2 mb-0">{stats.reviews}</h3>
                <p className="text-muted mb-0">Completed Jobs</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h4 className="mb-3">Quick Actions</h4>
                <Row className="g-3">
                  <Col md={3}>
                    <Button variant="primary" className="w-100 py-3"
                      onClick={() => navigate('/customer/create-request')}>
                      📝 Create Request
                    </Button>
                  </Col>
                  <Col md={3}>
                    <Button variant="outline-primary" className="w-100 py-3"
                      onClick={() => navigate('/customer/my-requests')}>
                      📋 My Requests
                    </Button>
                  </Col>
                  <Col md={3}>
                    <Button variant="outline-primary" className="w-100 py-3"
                      onClick={() => navigate('/customer/my-bookings')}>
                      📅 My Bookings
                    </Button>
                  </Col>
                  <Col md={3}>
                    <Button variant="outline-primary" className="w-100 py-3"
                      onClick={() => navigate('/providers')}>
                      🔍 Browse Providers
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Services */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <ServiceBrowse />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Account Info */}
        <Row>
          <Col md={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h4 className="mb-3">Account Information</h4>
                <Row>
                  <Col md={6}>
                    <p><strong>Name:</strong> {user?.name}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Role:</strong> <span className="badge bg-primary">{user?.role}</span></p>
                    <p><strong>Status:</strong> <span className="badge bg-success">Active</span></p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CustomerDashboard;