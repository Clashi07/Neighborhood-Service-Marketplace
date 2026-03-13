import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Form, Button,
  Alert, Spinner, Nav, Badge, Navbar
} from 'react-bootstrap';
import { getUserProfile, updateUserProfile, changePassword } from '../../../services/userService';

const CustomerProfile = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profileData, setProfileData] = useState({
    name: '', email: '', phone: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfileData({
        name: data.data.name || '',
        email: data.data.email || '',
        phone: data.data.phone || ''
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setError(''); setSuccess('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setError(''); setSuccess('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await updateUserProfile(profileData);
      // Update localStorage so navbar stays in sync
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, ...data.data }));
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand>🏘️ Marketplace</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="ms-auto align-items-center">
              <Nav.Link onClick={() => navigate('/customer/dashboard')}>Dashboard</Nav.Link>
              <Nav.Link active>Profile</Nav.Link>
              <Button variant="outline-light" size="sm" onClick={handleLogout} className="ms-2">
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-5">
        <Row>
          {/* Sidebar */}
          <Col md={3} className="mb-4">
            <Card className="border-0 shadow-sm text-center p-4">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: 80, height: 80, fontSize: 32 }}
              >
                {profileData.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <h5 className="fw-bold mb-1">{profileData.name}</h5>
              <p className="text-muted small mb-2">{profileData.email}</p>
              <Badge bg="primary">Customer</Badge>
            </Card>

            <Card className="border-0 shadow-sm mt-3">
              <Card.Body className="p-0">
                <Nav className="flex-column">
                  {[
                    { key: 'profile', icon: '👤', label: 'Edit Profile' },
                    { key: 'password', icon: '🔒', label: 'Change Password' },
                    { key: 'settings', icon: '⚙️', label: 'Account Settings' }
                  ].map(item => (
                    <Nav.Link
                      key={item.key}
                      onClick={() => switchTab(item.key)}
                      className={`px-4 py-3 border-bottom ${activeTab === item.key ? 'text-primary fw-bold bg-light' : 'text-dark'}`}
                    >
                      {item.icon} {item.label}
                    </Nav.Link>
                  ))}
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          {/* Main Content */}
          <Col md={9}>
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            {/* Edit Profile */}
            {activeTab === 'profile' && (
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <h4 className="mb-4">👤 Edit Profile</h4>
                  <Form onSubmit={handleProfileSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleProfileChange}
                            placeholder="Your full name"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            placeholder="Your phone number"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        placeholder="Your email"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Profile Photo</Form.Label>
                      <Form.Control type="file" accept="image/*" disabled />
                      <Form.Text className="text-muted">Photo upload coming soon.</Form.Text>
                    </Form.Group>

                    <Button type="submit" variant="primary" disabled={saving}>
                      {saving ? <><Spinner size="sm" className="me-2" />Saving...</> : 'Save Changes'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            )}

            {/* Change Password */}
            {activeTab === 'password' && (
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <h4 className="mb-4">🔒 Change Password</h4>
                  <Form onSubmit={handlePasswordSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Min. 6 characters"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        required
                      />
                    </Form.Group>
                    <Button type="submit" variant="primary" disabled={saving}>
                      {saving ? <><Spinner size="sm" className="me-2" />Updating...</> : 'Update Password'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            )}

            {/* Account Settings */}
            {activeTab === 'settings' && (
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <h4 className="mb-4">⚙️ Account Settings</h4>

                  <Card className="border mb-3">
                    <Card.Body className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">Email Notifications</h6>
                        <p className="text-muted small mb-0">Receive updates about your bookings</p>
                      </div>
                      <Form.Check type="switch" defaultChecked />
                    </Card.Body>
                  </Card>

                  <Card className="border mb-3">
                    <Card.Body className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">SMS Notifications</h6>
                        <p className="text-muted small mb-0">Receive SMS alerts for important updates</p>
                      </div>
                      <Form.Check type="switch" />
                    </Card.Body>
                  </Card>

                  <Card className="border border-danger">
                    <Card.Body className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1 text-danger">Deactivate Account</h6>
                        <p className="text-muted small mb-0">Temporarily disable your account</p>
                      </div>
                      <Button variant="outline-danger" size="sm"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to deactivate your account?')) {
                            alert('Feature coming soon.');
                          }
                        }}
                      >
                        Deactivate
                      </Button>
                    </Card.Body>
                  </Card>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CustomerProfile;