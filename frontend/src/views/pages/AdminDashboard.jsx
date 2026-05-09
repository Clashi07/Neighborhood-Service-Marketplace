import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Navbar, Nav,
  Badge, Table, Spinner, Alert, Modal, Form
} from 'react-bootstrap';
import adminService from '../../services/adminService';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // User detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Role change modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleTarget, setRoleTarget] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [roleFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, pendingRes] = await Promise.all([
        adminService.getAllUsers(roleFilter),
        adminService.getPendingUsers()
      ]);
      setAllUsers(usersRes.data || []);
      setPendingUsers(pendingRes.data || []);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Approve/Reject (existing functionality)
  const handleApprove = async (userId, userName) => {
    if (!window.confirm(`Approve ${userName}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await api.put(`/users/${userId}/approve`, {});
      showSuccess(`${userName} approved successfully!`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve user');
    }
  };

  const handleReject = async (userId, userName) => {
    const reason = window.prompt(`Why are you rejecting ${userName}?`);
    if (!reason) return;
    try {
      await api.put(`/users/${userId}/reject`, { reason });
      showSuccess(`${userName} rejected.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject user');
    }
  };

  // Toggle active
  const handleToggleActive = async (userId, userName, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${userName}?`)) return;
    try {
      await adminService.toggleUserActive(userId);
      setAllUsers(prev =>
        prev.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u)
      );
      showSuccess(`${userName} ${action}d successfully!`);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} user`);
    }
  };

  // Delete user
  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Permanently delete ${userName}? This cannot be undone.`)) return;
    try {
      await adminService.deleteUser(userId);
      setAllUsers(prev => prev.filter(u => u._id !== userId));
      showSuccess(`${userName} deleted successfully.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // View details
  const handleViewDetails = async (userId) => {
    try {
      setDetailLoading(true);
      setShowDetailModal(true);
      const res = await adminService.getUserById(userId);
      setSelectedUser(res.data);
    } catch (err) {
      setError('Failed to load user details.');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Change role
  const handleOpenRoleModal = (u) => {
    setRoleTarget(u);
    setNewRole(u.role);
    setShowRoleModal(true);
  };

  const handleConfirmRoleChange = async () => {
    try {
      setRoleLoading(true);
      await adminService.changeUserRole(roleTarget._id, newRole);
      setAllUsers(prev =>
        prev.map(u => u._id === roleTarget._id ? { ...u, role: newRole } : u)
      );
      showSuccess(`${roleTarget.name}'s role changed to ${newRole}`);
      setShowRoleModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role');
    } finally {
      setRoleLoading(false);
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const stats = {
    total: allUsers.length,
    customers: allUsers.filter(u => u.role === 'customer').length,
    providers: allUsers.filter(u => u.role === 'provider').length,
    pending: pendingUsers.length,
    inactive: allUsers.filter(u => !u.isActive).length
  };

  const roleBadge = (role) => {
    const map = { admin: 'danger', provider: 'success', customer: 'primary' };
    return <Badge bg={map[role] || 'secondary'}>{role}</Badge>;
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Navbar bg="danger" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand>🏘️ Admin Panel</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="ms-auto">
              <Nav.Link onClick={() => navigate('/admin/dashboard')}>Dashboard</Nav.Link>
              <Nav.Link onClick={() => navigate('/admin/categories')}>Categories</Nav.Link>
              <Button variant="outline-light" size="sm" onClick={handleLogout} className="ms-2">
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4">
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

        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {/* Stats */}
        <Row className="g-3 mb-4">
          {[
            { label: 'Total Users', value: stats.total, icon: '👥', color: 'primary' },
            { label: 'Customers', value: stats.customers, icon: '🛒', color: 'info' },
            { label: 'Providers', value: stats.providers, icon: '👷', color: 'success' },
            { label: 'Pending', value: stats.pending, icon: '⏳', color: 'warning' },
            { label: 'Inactive', value: stats.inactive, icon: '🚫', color: 'danger' },
          ].map(s => (
            <Col key={s.label} md={2} sm={4} xs={6}>
              <Card className="border-0 shadow-sm text-center h-100">
                <Card.Body className="p-3">
                  <div className="fs-3 mb-1">{s.icon}</div>
                  <h4 className={`mb-0 text-${s.color}`}>{s.value}</h4>
                  <small className="text-muted">{s.label}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
          <Col md={2} sm={4} xs={6}>
            <Card className="border-0 shadow-sm text-center h-100" style={{ cursor: 'pointer' }}
              onClick={() => navigate('/admin/categories')}>
              <Card.Body className="p-3">
                <div className="fs-3 mb-1">⚙️</div>
                <h4 className="mb-0 text-danger">→</h4>
                <small className="text-muted">Categories</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Pending Approvals */}
        {pendingUsers.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card className="border-0 shadow-sm border-start border-warning border-3">
                <Card.Body className="p-4">
                  <h5 className="mb-3">⏳ Pending Approvals ({pendingUsers.length})</h5>
                  <Table hover responsive className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Registered</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingUsers.map(u => (
                        <tr key={u._id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{roleBadge(u.role)}</td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <Button variant="success" size="sm" className="me-1"
                              onClick={() => handleApprove(u._id, u.name)}>
                              ✓ Approve
                            </Button>
                            <Button variant="danger" size="sm"
                              onClick={() => handleReject(u._id, u.name)}>
                              ✗ Reject
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* All Users */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h5 className="mb-0">👥 All Users</h5>
                  {/* Role filter */}
                  <div className="d-flex gap-2">
                    {['', 'customer', 'provider', 'admin'].map(r => (
                      <button key={r}
                        className={`btn btn-sm ${roleFilter === r ? 'btn-danger' : 'btn-outline-secondary'}`}
                        onClick={() => setRoleFilter(r)}>
                        {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
                ) : allUsers.length === 0 ? (
                  <p className="text-center text-muted py-4">No users found.</p>
                ) : (
                  <Table hover responsive className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Active</th>
                        <th>Registered</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map(u => (
                        <tr key={u._id} className={!u.isActive ? 'table-secondary' : ''}>
                          <td className="fw-semibold">{u.name}</td>
                          <td className="text-muted small">{u.email}</td>
                          <td>{roleBadge(u.role)}</td>
                          <td>
                            <Badge bg={u.isApproved ? 'success' : 'warning'}>
                              {u.isApproved ? 'Approved' : 'Pending'}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={u.isActive ? 'success' : 'danger'}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="small">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="d-flex gap-1 flex-wrap">
                              {/* View details */}
                              <Button variant="outline-primary" size="sm"
                                onClick={() => handleViewDetails(u._id)}>
                                👁
                              </Button>
                              {/* Change role */}
                              {u._id !== user?.id && (
                                <Button variant="outline-secondary" size="sm"
                                  onClick={() => handleOpenRoleModal(u)}>
                                  🔄
                                </Button>
                              )}
                              {/* Toggle active */}
                              {u._id !== user?.id && (
                                <Button
                                  variant={u.isActive ? 'outline-warning' : 'outline-success'}
                                  size="sm"
                                  onClick={() => handleToggleActive(u._id, u.name, u.isActive)}>
                                  {u.isActive ? '🚫' : '✓'}
                                </Button>
                              )}
                              {/* Delete */}
                              {u._id !== user?.id && (
                                <Button variant="outline-danger" size="sm"
                                  onClick={() => handleDelete(u._id, u.name)}>
                                  🗑
                                </Button>
                              )}
                            </div>
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
      </Container>

      {/* User Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailLoading ? (
            <div className="text-center py-4"><Spinner animation="border" /></div>
          ) : selectedUser ? (
            <div>
              <div className="text-center mb-4">
                <div className="rounded-circle bg-danger text-white d-inline-flex
                  align-items-center justify-content-center fw-bold mb-2"
                  style={{ width: 64, height: 64, fontSize: '1.5rem' }}>
                  {selectedUser.name?.[0]?.toUpperCase()}
                </div>
                <h5 className="mb-0">{selectedUser.name}</h5>
                <small className="text-muted">{selectedUser.email}</small>
              </div>
              <Row className="g-2">
                {[
                  { label: 'Role', value: selectedUser.role },
                  { label: 'Phone', value: selectedUser.phone || 'N/A' },
                  { label: 'Active', value: selectedUser.isActive ? 'Yes' : 'No' },
                  { label: 'Approved', value: selectedUser.isApproved ? 'Yes' : 'No' },
                  { label: 'Email Verified', value: selectedUser.isEmailVerified ? 'Yes' : 'No' },
                  { label: 'Registered', value: new Date(selectedUser.createdAt).toLocaleDateString() },
                ].map(item => (
                  <Col xs={6} key={item.label}>
                    <div className="bg-light rounded p-2">
                      <div className="text-muted small">{item.label}</div>
                      <div className="fw-semibold">{item.value}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Change Role Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Role — {roleTarget?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="fw-semibold">Select New Role</Form.Label>
            <Form.Select value={newRole} onChange={e => setNewRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="provider">Provider</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>
          {newRole === 'admin' && (
            <Alert variant="warning" className="mt-3 small mb-0">
              ⚠️ This will give the user full admin access.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmRoleChange} disabled={roleLoading}>
            {roleLoading ? <Spinner size="sm" /> : 'Confirm Change'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;