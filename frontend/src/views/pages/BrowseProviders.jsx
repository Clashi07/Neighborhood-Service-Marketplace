import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getPublicProviders } from '../../services/providerService';
import categoryService from '../../services/categoryService';

const BrowseProviders = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Categories on load
  useEffect(() => {
    const loadCategories = async () => {
      const res = await categoryService.getAllCategories();
      setCategories(res.data || []);
    };
    loadCategories();
  }, []);

  // Fetch Providers whenever filters or page changes
  useEffect(() => {
    fetchProviders();
  }, [currentPage, selectedCategory]); 

  const fetchProviders = async () => {
    const params = { page: currentPage, limit: 6 };
    if (search) params.search = search;
    if (location) params.location = location;
    if (selectedCategory) params.category = selectedCategory;

    try {
      const res = await getPublicProviders(params);
      if (res.success) {
        setProviders(res.data);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error("Error fetching providers", err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchProviders();
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Find a Service Provider</h2>
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>Go Back</Button>
        </div>

        {/* Search & Filter Bar */}
        <Card className="border-0 shadow-sm mb-5">
          <Card.Body>
            <Form onSubmit={handleSearchSubmit}>
              <Row className="g-3">
                <Col md={3}>
                  <Form.Control 
                    placeholder="Search by name..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                  />
                </Col>
                <Col md={3}>
                  <Form.Control 
                    placeholder="City or Area..." 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                  />
                </Col>
                <Col md={4}>
                  <Form.Select 
                    value={selectedCategory} 
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Service Categories</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Button variant="success" type="submit" className="w-100">Search</Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Provider Grid (FR-7.5) */}
        <Row className="g-4 mb-5">
          {providers.length === 0 ? (
            <Col><p className="text-center text-muted">No providers found matching your criteria.</p></Col>
          ) : (
            providers.map((provider) => {
              // Calculate price range across all their services
              const prices = provider.specializations?.map(s => s.priceMin) || [];
              const minPrice = prices.length ? Math.min(...prices) : provider.hourlyRate;
              
              return (
                <Col md={4} key={provider._id}>
                  <Card className="h-100 border-0 shadow-sm provider-card text-center">
                    <Card.Body className="p-4">
                      {/* Avatar Placeholder */}
                      <div className="rounded-circle bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px', fontSize: '32px'}}>
                        {provider.user?.name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      
                      <Card.Title className="fw-bold mb-1">{provider.user?.name || 'Unknown Provider'}</Card.Title>
                      
                      <div className="mb-2 text-warning">
                         ⭐ {provider.user?.rating || '0.0'} <span className="text-muted small">({provider.user?.numOfReviews || 0} reviews)</span>
                      </div>

                      <p className="text-success fw-bold mb-3">Starting at ${minPrice}</p>

                      <div className="d-flex flex-wrap justify-content-center gap-1 mb-3">
                        {provider.specializations?.slice(0, 3).map((spec, idx) => (
                          <Badge bg="light" text="dark" className="border" key={idx}>
                            {spec.category?.name || 'Service'}
                          </Badge>
                        ))}
                        {provider.specializations?.length > 3 && (
                          <Badge bg="light" text="dark" className="border">+{provider.specializations.length - 3} more</Badge>
                        )}
                      </div>
                      
                      <div className="text-muted small mb-3">
                        📍 {provider.serviceAreas?.[0] || 'Remote'} 
                        {provider.serviceAreas?.length > 1 && ` +${provider.serviceAreas.length - 1} more`}
                      </div>

                      <Button 
                        variant="outline-success" 
                        className="w-100"
                        onClick={() => alert(`Navigating to profile details for ${provider.user?.name} (FR-9 coming next!)`)}
                      >
                        View Profile
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })
          )}
        </Row>

        {/* Pagination (FR-7.6) */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => prev - 1)} 
              />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item 
                  key={i + 1} 
                  active={i + 1 === currentPage}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(prev => prev + 1)} 
              />
            </Pagination>
          </div>
        )}
      </Container>
    </div>
  );
};

export default BrowseProviders;