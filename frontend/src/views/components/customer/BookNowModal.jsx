import React, { useState } from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';
import directBookingService from '../../../services/directBookingService';

const BookNowModal = ({ show, onHide, provider }) => {
  const [form, setForm] = useState({ description: '', scheduledDate: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async () => {
    if (!form.description || !form.scheduledDate || !form.address) {
      setError('Please fill all required fields.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await directBookingService.createBooking({
        providerId: provider._id,
        description: form.description,
        scheduledDate: form.scheduledDate,
        address: form.address
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm({ description: '', scheduledDate: '', address: '' });
        onHide();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send booking request.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ description: '', scheduledDate: '', address: '' });
    setError('');
    setSuccess(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>📅 Book {provider?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {success ? (
          <div className="text-center py-4">
            <div style={{ fontSize: '3rem' }}>✅</div>
            <h5 className="text-success mt-3">Booking Request Sent!</h5>
            <p className="text-muted">The provider will be notified and will respond shortly.</p>
          </div>
        ) : (
          <>
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">What do you need? *</Form.Label>
              <Form.Control as="textarea" rows={3}
                placeholder="Describe the service you need in detail..."
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Preferred Date *</Form.Label>
              <Form.Control type="date" min={today}
                value={form.scheduledDate}
                onChange={e => setForm(prev => ({ ...prev, scheduledDate: e.target.value }))} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Your Address *</Form.Label>
              <Form.Control type="text" placeholder="Enter your full address"
                value={form.address}
                onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))} />
            </Form.Group>
          </>
        )}
      </Modal.Body>
      {!success && (
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="success" onClick={handleSubmit} disabled={loading}>
            {loading ? <><Spinner size="sm" className="me-1" />Sending...</> : '📅 Send Booking Request'}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default BookNowModal;