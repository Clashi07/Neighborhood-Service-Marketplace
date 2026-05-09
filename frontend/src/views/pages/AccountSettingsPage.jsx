import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isProvider = user?.role === 'provider';

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Notification settings
  const [notifSettings, setNotifSettings] = useState({
    emailNotifications: true,
    bookingUpdates: true,
    newBids: true,
    rescheduleAlerts: true
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState('');

  // Deactivate modal
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');

  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await userService.getProfile();
      const u = res.data;
      setProfileForm({ name: u.name || '', email: u.email || '', phone: u.phone || '' });
      if (u.notificationSettings) {
        setNotifSettings(u.notificationSettings);
      }
    } catch {} finally {
      setPageLoading(false);
    }
  };

  // Update profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      setProfileError('');
      await userService.updateProfile(profileForm);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    try {
      setPasswordLoading(true);
      await userService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Update notifications
  const handleNotifChange = (key) => {
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNotifSave = async () => {
    try {
      setNotifLoading(true);
      await userService.updateNotificationSettings(notifSettings);
      setNotifSuccess('Notification settings saved!');
      setTimeout(() => setNotifSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save notification settings');
    } finally {
      setNotifLoading(false);
    }
  };

  // Deactivate account
  const handleDeactivate = async () => {
    if (!deactivatePassword) {
      setDeactivateError('Please enter your password.');
      return;
    }
    try {
      setDeactivateLoading(true);
      setDeactivateError('');
      await userService.deactivateAccount(deactivatePassword);
      await logout();
      navigate('/login');
    } catch (err) {
      setDeactivateError(err.response?.data?.message || 'Failed to deactivate account.');
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const dashboard = isProvider ? '/provider/dashboard' : '/customer/dashboard';
  const navColor = isProvider ? 'success' : 'primary';

  if (pageLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant={navColor} />
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className={`navbar navbar-expand-lg navbar-dark bg-${navColor} shadow-sm`}>
        <div className="container">
          <span className="navbar-brand fw-bold">⚙️ Account Settings</span>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-outline-light btn-sm"
              onClick={() => navigate(dashboard)}>Dashboard</button>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <Container className="py-4" style={{ maxWidth: 800 }}>

        {/* Profile header */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center gap-3">
              <div className={`rounded-circle bg-${navColor} text-white d-flex align-items-center
                justify-content-center fw-bold flex-shrink-0`}
                style={{ width: 64, height: 64, fontSize: '1.5rem' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h5 className="mb-0 fw-bold">{user?.name}</h5>
                <span className="text-muted small">{user?.email}</span>
                <div className="mt-1">
                  <Badge bg={navColor}>{user?.role}</Badge>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* FR-3.1 & Profile — Update Profile */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-4">👤 Personal Information</h5>
            {profileSuccess && <Alert variant="success" dismissible onClose={() => setProfileSuccess('')}>{profileSuccess}</Alert>}
            {profileError && <Alert variant="danger" dismissible onClose={() => setProfileError('')}>{profileError}</Alert>}
            <Form onSubmit={handleProfileSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Full Name</Form.Label>
                    <Form.Control type="text"
                      value={profileForm.name}
                      onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your full name" required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Phone Number</Form.Label>
                    <Form.Control type="text"
                      value={profileForm.phone}
                      onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Your phone number" />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Email Address (FR-3.2)</Form.Label>
                    <Form.Control type="email"
                      value={profileForm.email}
                      onChange={e => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Your email" required />
                    <Form.Text className="text-muted">
                      Changing your email will update your login credentials.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <Button type="submit" variant={navColor} className="mt-3" disabled={profileLoading}>
                {profileLoading ? <><Spinner size="sm" className="me-1" />Saving...</> : 'Save Changes'}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {/* FR-3.1 & FR-3.5 — Change Password */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-4">🔒 Change Password</h5>
            {passwordSuccess && <Alert variant="success" dismissible onClose={() => setPasswordSuccess('')}>{passwordSuccess}</Alert>}
            {passwordError && <Alert variant="danger" dismissible onClose={() => setPasswordError('')}>{passwordError}</Alert>}
            <Form onSubmit={handlePasswordSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Current Password</Form.Label>
                <Form.Control
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password" required />
              </Form.Group>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">New Password</Form.Label>
                    <Form.Control
                      type={showPasswords ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Min 6 characters" required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Confirm New Password</Form.Label>
                    <Form.Control
                      type={showPasswords ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Repeat new password" required />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Check type="checkbox" label="Show passwords" className="mb-3"
                checked={showPasswords}
                onChange={e => setShowPasswords(e.target.checked)} />
              <Button type="submit" variant={navColor} disabled={passwordLoading}>
                {passwordLoading ? <><Spinner size="sm" className="me-1" />Changing...</> : 'Change Password'}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {/* FR-3.3 — Notification Settings */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-4">🔔 Notification Settings</h5>
            {notifSuccess && <Alert variant="success" dismissible onClose={() => setNotifSuccess('')}>{notifSuccess}</Alert>}
            <div className="d-flex flex-column gap-3">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                { key: 'bookingUpdates', label: 'Booking Updates', desc: 'Get notified about booking status changes' },
                { key: 'newBids', label: isProvider ? 'New Requests' : 'New Bids', desc: isProvider ? 'Get notified about new service requests' : 'Get notified when providers place bids' },
                { key: 'rescheduleAlerts', label: 'Reschedule Alerts', desc: 'Get notified about reschedule requests and responses' },
              ].map(item => (
                <div key={item.key} className="d-flex justify-content-between align-items-center
                  p-3 bg-light rounded">
                  <div>
                    <div className="fw-semibold small">{item.label}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{item.desc}</div>
                  </div>
                  <Form.Check type="switch"
                    checked={notifSettings[item.key]}
                    onChange={() => handleNotifChange(item.key)} />
                </div>
              ))}
            </div>
            <Button variant={navColor} className="mt-3" onClick={handleNotifSave} disabled={notifLoading}>
              {notifLoading ? <><Spinner size="sm" className="me-1" />Saving...</> : 'Save Preferences'}
            </Button>
          </Card.Body>
        </Card>

        {/* FR-3.4 — Deactivate Account */}
        <Card className="border-0 shadow-sm border-start border-danger border-3 mb-4">
          <Card.Body className="p-4">
            <h5 className="fw-bold text-danger mb-2">⚠️ Danger Zone</h5>
            <p className="text-muted small mb-3">
              Deactivating your account will hide your profile and prevent you from logging in.
              You can contact support to reactivate it.
            </p>
            <Button variant="outline-danger"
              onClick={() => setShowDeactivateModal(true)}>
              Deactivate My Account
            </Button>
          </Card.Body>
        </Card>

      </Container>

      {/* Deactivate Modal */}
      <Modal show={showDeactivateModal} onHide={() => setShowDeactivateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">⚠️ Deactivate Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="small">
            This will deactivate your account. You won't be able to log in until support reactivates it.
          </Alert>
          {deactivateError && <Alert variant="danger">{deactivateError}</Alert>}
          <Form.Group>
            <Form.Label className="fw-semibold">Enter your password to confirm</Form.Label>
            <Form.Control type="password"
              placeholder="Your current password"
              value={deactivatePassword}
              onChange={e => setDeactivatePassword(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeactivateModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeactivate} disabled={deactivateLoading}>
            {deactivateLoading ? <Spinner size="sm" /> : 'Confirm Deactivation'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AccountSettingsPage;