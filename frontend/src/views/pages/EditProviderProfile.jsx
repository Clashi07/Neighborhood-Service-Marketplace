import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { getProviderProfile, updateProviderProfile } from '../../services/providerService';
import categoryService from '../../services/categoryService';

const EditProviderProfile = () => {
  const navigate = useNavigate();
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [serviceAreas, setServiceAreas] = useState('');
  
  // Now holds an array of detailed objects
  const [specializations, setSpecializations] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const catRes = await categoryService.getAllCategories();
      setAvailableCategories(catRes.data || []);

      const profRes = await getProviderProfile();
      if (profRes.data) {
        setBio(profRes.data.bio || '');
        setExperience(profRes.data.experience || 0);
        setHourlyRate(profRes.data.hourlyRate || 0);
        setServiceAreas(profRes.data.serviceAreas ? profRes.data.serviceAreas.join(', ') : '');
        
        // Format existing specializations for the form state
        if (profRes.data.specializations) {
          const formattedSpecs = profRes.data.specializations.map(spec => ({
            category: spec.category?._id || spec.category,
            priceMin: spec.priceMin || 0,
            priceMax: spec.priceMax || 0,
            description: spec.description || ''
          }));
          setSpecializations(formattedSpecs);
        }
      }
    };
    fetchData();
  }, []);

  // Add a new blank service block
  const handleAddService = () => {
    setSpecializations([...specializations, { category: '', priceMin: '', priceMax: '', description: '' }]);
  };

  // Remove a specific service block
  const handleRemoveService = (index) => {
    const updatedSpecs = specializations.filter((_, i) => i !== index);
    setSpecializations(updatedSpecs);
  };

  // Handle changes within a specific service block
  const handleServiceChange = (index, field, value) => {
    const updatedSpecs = [...specializations];
    updatedSpecs[index][field] = value;
    setSpecializations(updatedSpecs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const profileData = { bio, experience, hourlyRate, serviceAreas, specializations };
    await updateProviderProfile(profileData);
    navigate('/provider/profile');
  };

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="mb-4">Edit Provider Profile</h2>
          <Form onSubmit={handleSubmit}>
            {/* General Info Setup (Bio, Exp, etc.) */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Experience (Years)</Form.Label>
                  <Form.Control type="number" value={experience} onChange={(e) => setExperience(e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Base Hourly Rate ($)</Form.Label>
                  <Form.Control type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} required />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Service Areas (comma separated)</Form.Label>
              <Form.Control type="text" value={serviceAreas} onChange={(e) => setServiceAreas(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Bio</Form.Label>
              <Form.Control as="textarea" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} required />
            </Form.Group>

            {/* FR-5 Dynamic Services Section */}
            <div className="mb-4 pt-4 border-top">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">My Services & Pricing</h4>
                <Button variant="outline-success" size="sm" onClick={handleAddService}>
                  + Add Service Category
                </Button>
              </div>

              {specializations.length === 0 ? (
                <p className="text-muted fst-italic">No services added yet. Click above to add your first service.</p>
              ) : (
                specializations.map((spec, index) => (
                  <Card key={index} className="mb-3 bg-light border-0">
                    <Card.Body>
                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Select Category</Form.Label>
                            <Form.Control 
                              as="select" 
                              value={spec.category} 
                              onChange={(e) => handleServiceChange(index, 'category', e.target.value)} 
                              required
                            >
                              <option value="">-- Choose Category --</option>
                              {availableCategories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                              ))}
                            </Form.Control>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Min Price ($)</Form.Label>
                            <Form.Control 
                              type="number" 
                              value={spec.priceMin} 
                              onChange={(e) => handleServiceChange(index, 'priceMin', e.target.value)} 
                              required 
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Max Price ($)</Form.Label>
                            <Form.Control 
                              type="number" 
                              value={spec.priceMax} 
                              onChange={(e) => handleServiceChange(index, 'priceMax', e.target.value)} 
                              required 
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Service Description</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={2} 
                          placeholder="Describe what is included in this service..."
                          value={spec.description} 
                          onChange={(e) => handleServiceChange(index, 'description', e.target.value)} 
                          required 
                        />
                      </Form.Group>
                      <div className="text-end">
                        <Button variant="danger" size="sm" onClick={() => handleRemoveService(index)}>
                          Remove Service
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              )}
            </div>

            <Button variant="success" type="submit" size="lg" className="w-100">Save Complete Profile</Button>
            <Button variant="secondary" className="w-100 mt-2" onClick={() => navigate('/provider/profile')}>Cancel</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditProviderProfile;