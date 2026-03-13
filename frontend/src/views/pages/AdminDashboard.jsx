import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Navbar, Nav, Badge, Table, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [pendingRes, allRes] = await Promise.all([
        axios.get('/api/users/pending', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setPendingUsers(pendingRes.data.data);
      setAllUsers(allRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, userName) => {
    if (!window.confirm(`Approve ${userName}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/users/${userId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage(`${userName} has been approved!`);
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve user');
    }
  };

  const handleReject = async (userId, userName) => {
    const reason = window.prompt(`Why are you rejecting ${userName}?`);
    if (!reason) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/users/${userId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(`${userName} has been rejected.`);
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject user');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const stats = {
    totalUsers: allUsers.length,
    customers: allUsers.filter(u => u.role === 'customer').length,
    providers: allUsers.filter(u => u.role === 'provider').length,
    pending: pendingUsers.length
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Navbar */}
      <Navbar bg="danger" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand>🏘️ Admin Panel</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="ms-auto">
              <Nav.Link href="#dashboard">Dashboard</Nav.Link>
              <Nav.Link href="#users">Manage Users</Nav.Link>
              <Nav.Link href="#categories">Categories</Nav.Link>
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
            <Card className="border-0 shadow-sm bg-danger text-white">
              <Card.Body className="p-4">
                <h2 className="mb-1">Admin Dashboard 🛡️</h2>
                <p className="mb-0 opacity-75">Welcome, {user?.name}!</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Messages */}
        {successMessage && <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {/* Stats */}
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="p-4">
                <div className="display-4 text-primary mb-2">👥</div>
                <h3 className="h2 mb-0">{stats.totalUsers}</h3>
                <p className="text-muted mb-0">Total Users</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="p-4">
                <div className="display-4 text-info mb-2">🛒</div>
                <h3 className="h2 mb-0">{stats.customers}</h3>
                <p className="text-muted mb-0">Customers</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="p-4">
                <div className="display-4 text-success mb-2">👷</div>
                <h3 className="h2 mb-0">{stats.providers}</h3>
                <p className="text-muted mb-0">Providers</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="p-4">
                <div className="display-4 text-warning mb-2">⏳</div>
                <h3 className="h2 mb-0">{stats.pending}</h3>
                <p className="text-muted mb-0">Pending Approval</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Pending Users */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h4 className="mb-3">⏳ Pending User Approvals</h4>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <p className="mb-0">✅ No pending approvals</p>
                  </div>
                ) : (
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Registered</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingUsers.map((pendingUser) => (
                        <tr key={pendingUser._id}>
                          <td>{pendingUser.name}</td>
                          <td>{pendingUser.email}</td>
                          <td>
                            <Badge bg={pendingUser.role === 'provider' ? 'success' : 'primary'}>
                              {pendingUser.role}
                            </Badge>
                          </td>
                          <td>{new Date(pendingUser.createdAt).toLocaleDateString()}</td>
                          <td>
                            <Button variant="success" size="sm" className="me-2"
                              onClick={() => handleApprove(pendingUser._id, pendingUser.name)}>
                              ✓ Approve
                            </Button>
                            <Button variant="danger" size="sm"
                              onClick={() => handleReject(pendingUser._id, pendingUser.name)}>
                              ✗ Reject
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* All Users */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h4 className="mb-3">All Users</h4>
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <Badge bg={u.role === 'provider' ? 'success' : u.role === 'admin' ? 'danger' : 'primary'}>
                            {u.role}
                          </Badge>
                        </td>
                        <td>
                          {u.isApproved ? (
                            <Badge bg="success">Approved</Badge>
                          ) : (
                            <Badge bg="warning">Pending</Badge>
                          )}
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;