import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Navbar, Nav, Badge } from 'react-bootstrap';

const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Navbar */}
      <Navbar bg="success" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand>🏘️ Marketplace - Provider</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link onClick={() => navigate('/provider/dashboard')}>Dashboard</Nav.Link>
              <Nav.Link onClick={() => navigate('/provider/categories')}>Categories</Nav.Link>
              <Nav.Link onClick={() => navigate('/provider/profile')}>My Profile</Nav.Link> 
              <Nav.Link href="#requests">Browse Requests</Nav.Link>
              <Nav.Link href="#bids">My Bids</Nav.Link>
              <Nav.Link href="#bookings">My Jobs</Nav.Link>
              <Button variant="outline-light" size="sm" onClick={handleLogout} className="ms-2">
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Dashboard Content */}
      <Container className="py-5">
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm bg-success text-white">
              <Card.Body className="p-4">
                <h2 className="mb-1">Welcome, {user?.name}! 🎯</h2>
                <p className="mb-0 opacity-75">Manage your services and grow your business.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center">
              <Card.Body>
                <div className="display-4 text-primary mb-2">💼</div>
                <h3 className="h2 mb-0">0</h3>
                <p className="text-muted mb-0">Active Bids</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center">
              <Card.Body>
                <div className="display-4 text-success mb-2">✅</div>
                <h3 className="h2 mb-0">0</h3>
                <p className="text-muted mb-0">Jobs Completed</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center">
              <Card.Body>
                <div className="display-4 text-warning mb-2">⭐</div>
                <h3 className="h2 mb-0">0.0</h3>
                <p className="text-muted mb-0">Average Rating</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center">
              <Card.Body>
                <div className="display-4 text-info mb-2">💰</div>
                <h3 className="h2 mb-0">$0</h3>
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
                  <Col md={3}>
                    <Button 
                      variant="success" 
                      className="w-100 py-3"
                      onClick={() => navigate('/provider/categories')}
                    >
                      📋 Browse Categories
                    </Button>
                  </Col>
                  <Col md={3}>
                    <Button 
                      variant="outline-success" 
                      className="w-100 py-3"
                      onClick={() => alert('Coming soon!')}
                    >
                      🔍 Browse Requests
                    </Button>
                  </Col>
                  <Col md={3}>
                    <Button 
                      variant="outline-success" 
                      className="w-100 py-3"
                      onClick={() => navigate('/provider/portfolio')}
                    >
                      🖼️ Manage Portfolio
                    </Button>
                  </Col>
                  <Col md={3}>
                    <Button 
                      variant="outline-success" 
                      className="w-100 py-3"
                      onClick={() => navigate('/provider/edit-profile')}
                    >
                      👤 Edit Profile
                    </Button>
                  </Col>

                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Profile Status */}
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
                <h5 className="mb-3">⚠️ Complete Your Profile</h5>
                <p className="text-muted small">Set up your provider profile to start receiving service requests.</p>
                <Button 
                  variant="success" 
                  className="w-100"
                  onClick={() => navigate('/provider/categories')}
                >
                  Select Categories
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