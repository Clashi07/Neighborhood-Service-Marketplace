import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import categoryService from '../../services/categoryService';
import serviceRequestService from '../../services/serviceRequestService';

const CreateServiceRequestPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceCategory: '',
    budgetMin: '',
    budgetMax: '',
    preferredDate: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setSelectedImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseInt(formData.budgetMin) > parseInt(formData.budgetMax)) {
      setError('Minimum budget cannot be higher than maximum budget');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (formData.preferredDate < today) {
      setError('Preferred date cannot be in the past');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('serviceCategory', formData.serviceCategory);
      data.append('budget[min]', formData.budgetMin);
      data.append('budget[max]', formData.budgetMax);
      data.append('preferredDate', formData.preferredDate);
      data.append('location[address]', formData.address);
      data.append('location[city]', formData.city);
      data.append('location[state]', formData.state);
      data.append('location[zipCode]', formData.zipCode);
      selectedImages.forEach((image) => data.append('images', image));

      await serviceRequestService.createServiceRequest(data);
      setSuccess(true);

      // Navigate to my-requests after 1.5 seconds
      setTimeout(() => navigate('/customer/my-requests'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create service request');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (success) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div style={{ fontSize: '4rem' }}>✅</div>
          <h3 className="mt-3 fw-bold">Request Created Successfully!</h3>
          <p className="text-muted">Redirecting to your requests...</p>
          <Spinner animation="border" variant="success" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand>🏘️ Create Service Request</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="ms-auto">
              <Nav.Link onClick={() => navigate('/customer/dashboard')}>Dashboard</Nav.Link>
              <Nav.Link onClick={() => navigate('/customer/my-requests')}>My Requests</Nav.Link>
              <Button variant="outline-light" size="sm" onClick={handleLogout} className="ms-2">Logout</Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-5">
                <h2 className="mb-2">Create Service Request</h2>
                <p className="text-muted mb-4">Fill out the form below. Providers will bid on your request.</p>

                {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Request Title *</Form.Label>
                    <Form.Control type="text" name="title" value={formData.title} onChange={handleChange}
                      placeholder="e.g., Need plumber for kitchen sink repair" required maxLength={100} />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Service Category *</Form.Label>
                    <Form.Select name="serviceCategory" value={formData.serviceCategory} onChange={handleChange} required>
                      <option value="">Select a category...</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description *</Form.Label>
                    <Form.Control as="textarea" rows={5} name="description" value={formData.description}
                      onChange={handleChange} placeholder="Describe the service you need in detail..."
                      required maxLength={2000} />
                    <Form.Text className="text-muted">{formData.description.length}/2000</Form.Text>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Minimum Budget (৳) *</Form.Label>
                        <Form.Control type="number" name="budgetMin" value={formData.budgetMin}
                          onChange={handleChange} placeholder="e.g., 500" min="1" required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Maximum Budget (৳) *</Form.Label>
                        <Form.Control type="number" name="budgetMax" value={formData.budgetMax}
                          onChange={handleChange} placeholder="e.g., 2000" min="1" required />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Preferred Service Date *</Form.Label>
                    <Form.Control type="date" name="preferredDate" value={formData.preferredDate}
                      onChange={handleChange} min={new Date().toISOString().split('T')[0]} required />
                  </Form.Group>

                  <h5 className="mb-3">Service Location</h5>

                  <Form.Group className="mb-3">
                    <Form.Label>Address *</Form.Label>
                    <Form.Control type="text" name="address" value={formData.address}
                      onChange={handleChange} placeholder="Street address" required />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>City *</Form.Label>
                        <Form.Control type="text" name="city" value={formData.city}
                          onChange={handleChange} placeholder="City" required />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>State</Form.Label>
                        <Form.Control type="text" name="state" value={formData.state}
                          onChange={handleChange} placeholder="State" />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Zip Code</Form.Label>
                        <Form.Control type="text" name="zipCode" value={formData.zipCode}
                          onChange={handleChange} placeholder="Zip" />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label>Upload Images (Optional)</Form.Label>
                    <Form.Control type="file" multiple accept="image/*" onChange={handleImageChange} />
                    <Form.Text className="text-muted">Maximum 5 images, 5MB each.</Form.Text>
                    {selectedImages.length > 0 && (
                      <div className="mt-1 text-success small">✓ {selectedImages.length} image(s) selected</div>
                    )}
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button variant="primary" size="lg" type="submit" disabled={loading}>
                      {loading ? <><Spinner animation="border" size="sm" className="me-2" />Creating...</> : 'Create Service Request'}
                    </Button>
                    <Button variant="outline-secondary" onClick={() => navigate('/customer/dashboard')} disabled={loading}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CreateServiceRequestPage;