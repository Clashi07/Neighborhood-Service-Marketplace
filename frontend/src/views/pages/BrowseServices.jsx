import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import categoryService from '../../services/categoryService';

const BrowseServices = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAllCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // When a category is clicked, go to Providers page with the category filter applied
  const handleCategoryClick = (categoryId) => {
    // We pass the category ID in the URL state so the Browse Providers page can read it
    navigate('/providers', { state: { selectedCategory: categoryId } });
  };

  if (loading) {
    return <Container className="py-5 text-center"><Spinner animation="border" variant="primary" /></Container>;
  }

  return (
    <div className="min-vh-100 bg-light py-5">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-bold">Explore Our Services</h2>
            <p className="text-muted">Select a category to find top-rated professionals near you.</p>
          </div>
          <Button variant="outline-secondary" onClick={() => navigate('/customer/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <Row className="g-4">
          {categories.length === 0 ? (
            <Col><p className="text-center text-muted">No service categories available at the moment.</p></Col>
          ) : (
            categories.map((category) => (
              <Col md={4} lg={3} key={category._id}>
                <Card 
                  className="h-100 border-0 shadow-sm category-card text-center" 
                  style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  onClick={() => handleCategoryClick(category._id)}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Card.Body className="p-4 d-flex flex-column justify-content-center align-items-center">
                    <div className="display-4 mb-3">
                      {category.icon || '🛠️'} {/* Fallback icon if you don't have icons in DB */}
                    </div>
                    <Card.Title className="fw-bold">{category.name}</Card.Title>
                    <Card.Text className="text-muted small">
                      {category.description || 'Find experts for this service.'}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>
    </div>
  );
};

export default BrowseServices;