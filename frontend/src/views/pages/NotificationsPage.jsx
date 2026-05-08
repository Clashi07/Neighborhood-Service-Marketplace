import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';

const iconMap = {
  booking_request: '📋',
  booking_accepted: '✅',
  booking_rejected: '❌',
  job_completed: '🎉',
  new_review: '⭐'
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getMyNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const dashboard = user?.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard';

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-dark shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">🔔 Notifications</span>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate(dashboard)}>Dashboard</button>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <Container className="py-4" style={{ maxWidth: 700 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Notifications</h4>
          {notifications.some(n => !n.read) && (
            <Button variant="outline-secondary" size="sm" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" /></div>
        ) : notifications.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
              <div style={{ fontSize: '3rem' }}>🔔</div>
              <h5 className="mt-3">No notifications yet</h5>
            </Card.Body>
          </Card>
        ) : (
          <div className="d-flex flex-column gap-2">
            {notifications.map(n => (
              <Card key={n._id} className={`border-0 shadow-sm ${!n.read ? 'border-start border-primary border-3' : ''}`}>
                <Card.Body className="py-3">
                  <div className="d-flex align-items-start gap-3">
                    <span style={{ fontSize: '1.5rem' }}>{iconMap[n.type] || '🔔'}</span>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <strong>{n.title}</strong>
                        {!n.read && <Badge bg="primary" pill>New</Badge>}
                      </div>
                      <p className="text-muted small mb-1">{n.message}</p>
                      <small className="text-muted">
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString()}
                      </small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default NotificationsPage;