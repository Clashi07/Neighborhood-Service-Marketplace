import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Navbar, Nav } from 'react-bootstrap';


const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand href="#home">🏘️ Marketplace</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link onClick={() => navigate('/services')}>Browse Services</Nav.Link>
              <Nav.Link href="#requests">My Requests</Nav.Link>
              <Nav.Link href="#bookings">My Bookings</Nav.Link>
              <Nav.Link onClick={() => navigate('/customer/profile')}>My Profile</Nav.Link>
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
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h2 className="mb-1">Welcome back, {user?.name}! 👋</h2>
                <p className="text-muted mb-0">Here's what's happening with your services today.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center">
              <Card.Body>
                <div className="display-4 text-primary mb-2">📋</div>
                <h3 className="h2 mb-0">0</h3>
                <p className="text-muted mb-0">Active Requests</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center">
              <Card.Body>
                <div className="display-4 text-success mb-2">💼</div>
                <h3 className="h2 mb-0">0</h3>
                <p className="text-muted mb-0">Received Bids</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center">
              <Card.Body>
                <div className="display-4 text-warning mb-2">📅</div>
                <h3 className="h2 mb-0">0</h3>
                <p className="text-muted mb-0">Bookings</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center">
              <Card.Body>
                <div className="display-4 text-info mb-2">⭐</div>
                <h3 className="h2 mb-0">0</h3>
                <p className="text-muted mb-0">Reviews Given</p>
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
                  <Col md={4}>
                    <Button variant="primary" className="w-100 py-3">
                      📝 Create Service Request
                    </Button>
                  </Col>
                  <Col md={4}>
                    <Button 
                      variant="outline-primary" 
                      className="w-100 py-3"
                      onClick={() => navigate('/providers')}
                >
                      🔍 Browse Providers
                    </Button>
                  </Col>
                  <Col md={4}>
                    <Button variant="outline-primary" className="w-100 py-3"
                     onClick={() => navigate('/customer/profile')}>
                            👤 Edit Profile
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* User Info */}
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