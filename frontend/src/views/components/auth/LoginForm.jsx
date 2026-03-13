import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, error, setError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login({ email, password });
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0 rounded-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">Welcome Back!</h2>
                  <p className="text-muted">Login to your account</p>
                </div>

                {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

                <Form onSubmit={handleSubmit}>
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
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      size="lg"
                    />
                  </Form.Group>

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
                          Logging in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </Button>
                  </div>

                  <div className="text-center">
                    <Link to="/forgot-password" className="text-decoration-none">
                      Forgot Password?
                    </Link>
                  </div>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-decoration-none fw-bold">
                      Sign Up
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

export default LoginForm;