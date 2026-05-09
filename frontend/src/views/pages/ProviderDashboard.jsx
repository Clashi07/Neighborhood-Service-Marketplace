import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Navbar, Nav, Badge, Spinner } from 'react-bootstrap';
import bookingService from '../../services/bookingService';
import bidService from '../../services/bidService';
import notificationService from '../../services/notificationService';
import reviewService from '../../services/reviewService';

const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ bids: 0, completed: 0, rating: 0, earnings: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUnread();
  }, []);

  const fetchStats = async () => {
    try {
      const [jobsRes, bidsRes, reviewRes] = await Promise.all([
        bookingService.getProviderBookings(),
        bidService.getMyBids(),
        reviewService.getProviderReviews(user?.id)
      ]);
      const jobs = jobsRes.data || [];
      const bids = bidsRes.data || [];
      const completed = jobs.filter(j => j.status === 'completed');
      const earnings = completed.reduce((sum, j) => sum + (j.agreedPrice || 0), 0);
      setStats({
        bids: bids.filter(b => b.status === 'pending').length,
        completed: completed.length,
        rating: reviewRes.avgRating || 0,
        earnings
      });
    } catch {} finally {
      setLoadingStats(false);
    }
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
      <Navbar bg="success" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand onClick={() => navigate('/provider/dashboard')} style={{ cursor: 'pointer' }}>
            🏘️ Marketplace — Provider
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link onClick={() => navigate('/provider/dashboard')}>Dashboard</Nav.Link>
              <Nav.Link onClick={() => navigate('/provider/categories')}>My Services</Nav.Link>
              <Nav.Link onClick={() => navigate('/provider/browse-requests')}>Browse Requests</Nav.Link>
              <Nav.Link onClick={() => navigate('/provider/my-bids')}>My Bids</Nav.Link>
              <Nav.Link onClick={() => navigate('/provider/my-jobs')}>My Jobs</Nav.Link>
              <Nav.Link onClick={() => navigate('/provider/booking-requests')}>
              <Nav.Link onClick={() => navigate('/provider/settings')}>⚙️ Settings</Nav.Link>  
                Booking Requests
                {unreadCount > 0 && <Badge bg="danger" pill className="ms-1">{unreadCount}</Badge>}
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/provider/notifications')} className="position-relative">
                🔔
                {unreadCount > 0 && (
                  <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle"
                    style={{ fontSize: '0.6rem' }}>
                    {unreadCount}
                  </Badge>
                )}
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/provider/profile')}>Profile</Nav.Link>
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
            <Card className="border-0 shadow-sm bg-success text-white">
              <Card.Body className="p-4">
                <h2 className="mb-1">Welcome, {user?.name}! 👋</h2>
                <p className="mb-0 opacity-75">Manage your services and grow your business.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Stats */}
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center" style={{ cursor: 'pointer' }}
              onClick={() => navigate('/provider/my-bids')}>
              <Card.Body>
                <div className="display-4 mb-2">💼</div>
                {loadingStats ? <Spinner size="sm" /> : <h3 className="h2 mb-0">{stats.bids}</h3>}
                <p className="text-muted mb-0">Active Bids</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center" style={{ cursor: 'pointer' }}
              onClick={() => navigate('/provider/my-jobs')}>
              <Card.Body>
                <div className="display-4 mb-2">✅</div>
                {loadingStats ? <Spinner size="sm" /> : <h3 className="h2 mb-0">{stats.completed}</h3>}
                <p className="text-muted mb-0">Jobs Completed</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center">
              <Card.Body>
                <div className="display-4 mb-2">⭐</div>
                {loadingStats ? <Spinner size="sm" /> : <h3 className="h2 mb-0">{stats.rating}</h3>}
                <p className="text-muted mb-0">Average Rating</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center">
              <Card.Body>
                <div className="display-4 mb-2">💰</div>
                {loadingStats ? <Spinner size="sm" /> : <h3 className="h2 mb-0">৳{stats.earnings}</h3>}
                <p className="text-muted mb-0">Total Earnings</p>
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
                  <Col md={2}>
                    <Button variant="success" className="w-100 py-3"
                      onClick={() => navigate('/provider/categories')}>
                      Manage Services
                    </Button>
                  </Col>
                  <Col md={2}>
                    <Button variant="outline-success" className="w-100 py-3"
                      onClick={() => navigate('/provider/browse-requests')}>
                      Browse Requests
                    </Button>
                  </Col>
                  <Col md={2}>
                    <Button variant="outline-success" className="w-100 py-3"
                      onClick={() => navigate('/provider/my-bids')}>
                      My Bids
                    </Button>
                  </Col>
                  <Col md={2}>
                    <Button variant="outline-success" className="w-100 py-3"
                      onClick={() => navigate('/provider/my-jobs')}>
                      My Jobs
                    </Button>
                  </Col>
                  <Col md={2}>
                    <Button variant="outline-success" className="w-100 py-3 position-relative"
                      onClick={() => navigate('/provider/booking-requests')}>
                      Booking Requests
                      {unreadCount > 0 && (
                        <Badge bg="danger" pill className="position-absolute top-0 end-0 mt-1 me-1">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </Col>
                  <Col md={2}>
                    <Button variant="outline-success" className="w-100 py-3"
                      onClick={() => navigate('/provider/portfolio')}>
                      My Portfolio
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Account + Profile */}
        <Row>
          <Col md={8}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <h4 className="mb-3">Account Information</h4>
                <Row>
                  <Col md={6}>
                    <p><strong>Name:</strong> {user?.name}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Role:</strong> <Badge bg="success">{user?.role}</Badge></p>
                    <p><strong>Status:</strong> <Badge bg="success">Active</Badge></p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100 bg-light">
              <Card.Body className="p-4">
                <h5 className="mb-3">Complete Your Profile</h5>
                <p className="text-muted small">
                  Set up your provider profile to start receiving service requests.
                </p>
                <Button variant="success" className="w-100 mb-2"
                  onClick={() => navigate('/provider/categories')}>
                  Select Categories
                </Button>
                <Button variant="outline-success" className="w-100"
                  onClick={() => navigate('/provider/edit-profile')}>
                  Edit Profile
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProviderDashboard;