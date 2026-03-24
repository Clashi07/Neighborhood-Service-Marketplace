import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge, Navbar, Nav } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import categoryService from '../../services/categoryService';

// Predefined categories with fixed icons
const AVAILABLE_CATEGORIES = [
  { name: 'Plumbing', icon: '🔧', description: 'Professional plumbing services including repairs, installations, and maintenance' },
  { name: 'Electrical', icon: '⚡', description: 'Licensed electricians for wiring, repairs, and electrical installations' },
  { name: 'Tutoring', icon: '📚', description: 'Educational tutoring services for all subjects and grade levels' },
  { name: 'Gardening', icon: '🌱', description: 'Lawn care, landscaping, and garden maintenance services' },
  { name: 'Cleaning', icon: '🧹', description: 'House cleaning, deep cleaning, and maintenance services' },
  { name: 'Carpentry', icon: '🪚', description: 'Custom woodwork, furniture repair, and carpentry services' },
  { name: 'Painting', icon: '🎨', description: 'Interior and exterior painting services' },
  { name: 'Moving', icon: '📦', description: 'Professional moving and relocation services' },
  { name: 'IT Support', icon: '💻', description: 'Computer repair, network setup, and technical support' },
  { name: 'Photography', icon: '📸', description: 'Professional photography for events and portraits' },
  { name: 'Catering', icon: '🍽️', description: 'Professional catering services for events and parties' },
  { name: 'Pet Care', icon: '🐾', description: 'Pet sitting, dog walking, and grooming services' },
  { name: 'Auto Repair', icon: '🔧', description: 'Vehicle maintenance and repair services' },
  { name: 'HVAC', icon: '❄️', description: 'Heating, ventilation, and air conditioning services' },
  { name: 'Roofing', icon: '🏠', description: 'Roof repair, replacement, and maintenance' },
  { name: 'Locksmith', icon: '🔑', description: 'Lock installation, repair, and emergency lockout services' }
];

const ManageCategoriesPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setSelectedCategory(category.name);
    } else {
      setEditingCategory(null);
      setSelectedCategory('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setSelectedCategory('');
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    try {
      const selectedCategoryData = AVAILABLE_CATEGORIES.find(cat => cat.name === selectedCategory);
      
      const categoryData = {
        name: selectedCategoryData.name,
        description: selectedCategoryData.description,
        icon: selectedCategoryData.icon
      };

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, categoryData);
        setSuccess('Category updated successfully');
      } else {
        await categoryService.createCategory(categoryData);
        setSuccess('Category created successfully');
      }

      handleCloseModal();
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" category?`)) return;

    try {
      await categoryService.deleteCategory(id);
      setSuccess('Category deleted successfully');
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get available categories that haven't been added yet
  const availableToAdd = AVAILABLE_CATEGORIES.filter(
    availCat => !categories.some(cat => cat.name === availCat.name)
  );

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Navbar */}
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

      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2>Manage Service Categories</h2>
                <p className="text-muted">Add or remove service categories</p>
              </div>
              <Button 
                variant="success" 
                onClick={() => handleOpenModal()}
                disabled={availableToAdd.length === 0}
              >
                + Add Category
              </Button>
            </div>
          </Col>
        </Row>

        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {availableToAdd.length === 0 && (
          <Alert variant="info">
            ℹ️ All available categories have been added!
          </Alert>
        )}

        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p>No categories added yet. Click "Add Category" to get started.</p>
              </div>
            ) : (
              <Table hover responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Providers</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id}>
                      <td className="fs-3">{category.icon}</td>
                      <td><strong>{category.name}</strong></td>
                      <td>{category.description.substring(0, 60)}...</td>
                      <td>{category.providerCount || 0}</td>
                      <td>
                        <Badge bg={category.isActive ? 'success' : 'secondary'}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(category._id, category.name)}
                          disabled={category.providerCount > 0}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Add Category Modal */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Add Category</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Select Category</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  required
                >
                  <option value="">Choose a category...</option>
                  {availableToAdd.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {selectedCategory && (
                <Alert variant="info">
                  <strong>Description:</strong><br />
                  {AVAILABLE_CATEGORIES.find(cat => cat.name === selectedCategory)?.description}
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
};

export default ManageCategoriesPage;
