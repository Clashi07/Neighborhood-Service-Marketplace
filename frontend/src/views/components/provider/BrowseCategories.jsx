import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import categoryService from '../../../services/categoryService';

const BrowseCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

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

  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-2 text-muted">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container className="py-4">
      <h3 className="mb-4">Select Your Service Categories</h3>
      <p className="text-muted mb-4">
        Choose the categories that match the services you provide. You can select multiple categories.
      </p>

      {selectedCategories.length > 0 && (
        <Alert variant="success" className="mb-4">
          ✓ {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
        </Alert>
      )}

      <Row className="g-4">
        {categories.map((category) => (
          <Col key={category._id} md={6} lg={4} xl={3}>
            <Card
              className={`h-100 border-2 ${
                selectedCategories.includes(category._id)
                  ? 'border-success bg-success bg-opacity-10'
                  : 'border-light'
              }`}
              style={{ cursor: 'pointer', transition: 'all 0.3s' }}
              onClick={() => toggleCategory(category._id)}
            >
              <Card.Body className="text-center p-4">
                <div className="display-3 mb-3">{category.icon}</div>
                <h5 className="mb-2">{category.name}</h5>
                <p className="text-muted small mb-3">{category.description}</p>
                
                {selectedCategories.includes(category._id) && (
                  <Badge bg="success" className="mt-2">
                    ✓ Selected
                  </Badge>
                )}

                {category.providerCount > 0 && (
                  <div className="mt-3 text-muted small">
                    {category.providerCount} {category.providerCount === 1 ? 'provider' : 'providers'}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default BrowseCategories;