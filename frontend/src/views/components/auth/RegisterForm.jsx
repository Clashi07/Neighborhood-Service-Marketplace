import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, error, setError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { name, email, password, confirmPassword, phone, role } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const data = await register({ name, email, password, phone, role });
      
      // Show appropriate message based on role
      if (data.user.role === 'provider') {
        alert('✅ Registration successful!\n\n⏳ Your provider account is pending admin approval.\n\nYou will receive an email notification once your account is approved and you can login.');
        navigate('/login');
      } else if (data.user.role === 'customer') {
        alert('✅ Registration successful!\n\nYou can now access your dashboard.');
        navigate('/customer/dashboard');
      } else if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center py-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0 rounded-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">Create Account</h2>
                  <p className="text-muted">Join our marketplace today</p>
                </div>

                {(localError || error) && (
                  <Alert variant="danger" dismissible onClose={() => { setLocalError(''); setError(null); }}>
                    {localError || error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      size="lg"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      size="lg"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number (Optional)</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      size="lg"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>I want to</Form.Label>
                    <Form.Select
                      name="role"
                      value={role}
                      onChange={handleChange}
                      required
                      size="lg"
                    >
                      <option value="customer">Find Services (Customer)</option>
                      <option value="provider">Provide Services (Provider)</option>
                    </Form.Select>
                    {role === 'provider' && (
                      <Form.Text className="text-warning d-block mt-2">
                        ⚠️ Provider accounts require admin approval before you can login.
                      </Form.Text>
                    )}
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={password}
                          onChange={handleChange}
                          placeholder="Min. 6 characters"
                          required
                          size="lg"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm password"
                          required
                          size="lg"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-grid mb-3">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      type="submit" 
                      disabled={loading}
                      className="fw-bold"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Creating Account...
                        </>
                      ) : (
                        'Sign Up'
                      )}
                    </Button>
                  </div>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-decoration-none fw-bold">
                      Login
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterForm;