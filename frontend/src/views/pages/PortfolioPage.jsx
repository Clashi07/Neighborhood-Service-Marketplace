import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Navbar, Nav, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import {
  getPortfolio,
  uploadPortfolioImage,
  deletePortfolioImage,
  updateImageDescription,
  reorderPortfolioImages
} from '../../services/portfolioService';

const MAX_IMAGES = 10;
const MAX_SIZE_MB = 5;
const API_URL = 'http://localhost:5000';

const PortfolioPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [description, setDescription] = useState('');
  const [fileError, setFileError] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingImage, setDeletingImage] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPortfolio();
      setImages(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load portfolio images.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setFileError('Only JPEG and PNG files are allowed.');
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File size must be under ${MAX_SIZE_MB}MB.`);
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const openUploadModal = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setDescription('');
    setFileError('');
    setShowUploadModal(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setFileError('Please select an image.');
      return;
    }
    try {
      setUploading(true);
      setFileError('');
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('description', description);
      await uploadPortfolioImage(formData);
      setSuccess('Image uploaded successfully!');
      setShowUploadModal(false);
      fetchPortfolio();
    } catch (err) {
      setFileError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const openDeleteModal = (img) => {
    setDeletingImage(img);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deletePortfolioImage(deletingImage._id);
      setSuccess('Image deleted.');
      setShowDeleteModal(false);
      fetchPortfolio();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (img) => {
    setEditingImage(img);
    setEditDescription(img.description || '');
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      setEditLoading(true);
      await updateImageDescription(editingImage._id, editDescription);
      setSuccess('Description updated.');
      setShowEditModal(false);
      fetchPortfolio();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDragStart = (index) => setDragIndex(index);

  const handleDrop = async (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    const updated = reordered.map((img, i) => ({ ...img, order: i }));
    setImages(updated);
    setDragIndex(null);
    try {
      await reorderPortfolioImages(updated.map((img) => ({ id: img._id, newOrder: img.order })));
      setSuccess('Order saved!');
    } catch (err) {
      setError('Failed to save order.');
      fetchPortfolio();
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f0f4f0' }}>
      <Navbar bg="success" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand>🏘️ Marketplace - Provider</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link onClick={() => navigate('/provider/dashboard')}>Dashboard</Nav.Link>
              <Nav.Link onClick={() => navigate('/provider/categories')}>Categories</Nav.Link>
              <Nav.Link onClick={() => navigate('/provider/portfolio')} active>Portfolio</Nav.Link>
              <Button variant="outline-light" size="sm" onClick={handleLogout} className="ms-2">
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-5">
        <Row className="mb-4 align-items-center">
          <Col>
            <h2 className="fw-bold mb-1">🖼️ My Portfolio</h2>
            <p className="text-muted mb-0">Showcase your work — up to {MAX_IMAGES} images. Drag to reorder.</p>
          </Col>
          <Col xs="auto">
            <Badge bg={images.length >= MAX_IMAGES ? 'danger' : 'success'} className="fs-6 me-3">
              {images.length} / {MAX_IMAGES}
            </Badge>
            <Button variant="success" onClick={openUploadModal} disabled={images.length >= MAX_IMAGES}>
              + Upload Image
            </Button>
          </Col>
        </Row>

        {error && <Alert variant="danger" dismissible onClose={clearMessages} className="mb-4">{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={clearMessages} className="mb-4">{success}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
            <p className="mt-3 text-muted">Loading portfolio...</p>
          </div>
        ) : images.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
              <div style={{ fontSize: '4rem' }}>📷</div>
              <h4 className="mt-3 text-muted">No images yet</h4>
              <p className="text-muted">Upload your first portfolio image to showcase your work.</p>
              <Button variant="success" onClick={openUploadModal}>Upload First Image</Button>
            </Card.Body>
          </Card>
        ) : (
          <>
            <p className="text-muted small mb-3">💡 <strong>Tip:</strong> Drag and drop cards to reorder your portfolio.</p>
            <Row className="g-4">
              {images.map((img, index) => (
                <Col md={4} key={img._id}>
                  <Card
                    className="border-0 shadow-sm h-100"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(index)}
                    style={{ cursor: 'grab', transition: 'transform 0.15s, box-shadow 0.15s', opacity: dragIndex === index ? 0.5 : 1 }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div style={{ position: 'relative', paddingTop: '66%', overflow: 'hidden', borderRadius: '0.375rem 0.375rem 0 0' }}>
                      <img
                        src={`${API_URL}/uploads/${img.filename}`}
                        alt={img.description || `Portfolio ${index + 1}`}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Badge bg="dark" style={{ position: 'absolute', top: 8, left: 8, opacity: 0.75 }}>#{index + 1}</Badge>
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <p className="text-muted small mb-3 flex-grow-1" style={{ minHeight: '2.5rem' }}>
                        {img.description || <em>No description</em>}
                      </p>
                      <div className="d-flex gap-2">
                        <Button variant="outline-success" size="sm" className="flex-grow-1" onClick={() => openEditModal(img)}>✏️ Edit</Button>
                        <Button variant="outline-danger" size="sm" className="flex-grow-1" onClick={() => openDeleteModal(img)}>🗑️ Delete</Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Container>

      {/* Upload Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Upload Portfolio Image</Modal.Title></Modal.Header>
        <Modal.Body>
          {fileError && <Alert variant="danger">{fileError}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Image File <span className="text-danger">*</span></Form.Label>
            <Form.Control type="file" accept="image/jpeg,image/png" ref={fileInputRef} onChange={handleFileChange} />
            <Form.Text className="text-muted">JPEG or PNG only, max 5MB</Form.Text>
          </Form.Group>
          {previewUrl && (
            <div className="mb-3 text-center">
              <img src={previewUrl} alt="Preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
            </div>
          )}
          <Form.Group>
            <Form.Label className="fw-semibold">Description <span className="text-muted fw-normal">(optional)</span></Form.Label>
            <Form.Control as="textarea" rows={3} maxLength={200} placeholder="Describe this work..." value={description} onChange={(e) => setDescription(e.target.value)} />
            <Form.Text className="text-muted">{description.length}/200</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowUploadModal(false)} disabled={uploading}>Cancel</Button>
          <Button variant="success" onClick={handleUpload} disabled={uploading || !selectedFile}>
            {uploading ? <><Spinner size="sm" className="me-2" />Uploading...</> : 'Upload'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Edit Description</Modal.Title></Modal.Header>
        <Modal.Body>
          {editingImage && (
            <div className="mb-3 text-center">
              <img src={`${API_URL}/uploads/${editingImage.filename}`} alt="Preview" style={{ maxHeight: 150, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
            </div>
          )}
          <Form.Group>
            <Form.Label className="fw-semibold">Description</Form.Label>
            <Form.Control as="textarea" rows={3} maxLength={200} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            <Form.Text className="text-muted">{editDescription.length}/200</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowEditModal(false)} disabled={editLoading}>Cancel</Button>
          <Button variant="success" onClick={handleEditSave} disabled={editLoading}>
            {editLoading ? <><Spinner size="sm" className="me-2" />Saving...</> : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Image</Modal.Title></Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this image? This action cannot be undone.</p>
          {deletingImage && (
            <div className="text-center">
              <img src={`${API_URL}/uploads/${deletingImage.filename}`} alt="To delete" style={{ maxHeight: 150, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <><Spinner size="sm" className="me-2" />Deleting...</> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PortfolioPage;