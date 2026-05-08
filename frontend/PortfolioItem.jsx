import React, { useState } from 'react';
import { Card, Button, Form } from 'react-bootstrap';

const PortfolioItem = ({ image, index, onDragStart, onDragEnd, onUpdateDescription, onDelete, isDragged }) => {
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(image.description || '');

  const handleSave = () => {
    onUpdateDescription(image._id, desc);
    setEditing(false);
  };

  return (
    <Card 
      className={`portfolio-item ${isDragged ? 'dragging' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="drag-handle">≡</div>
      <div className="portfolio-img-wrapper">
        <img 
          src={`http://localhost:5000/uploads/${image.filename}`} 
          alt="portfolio" 
          className="portfolio-img"
        />
        <Button variant="danger" className="delete-btn" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </div>
      <Card.Body className="p-3">
        {editing ? (
          <div>
            <Form.Control 
              as="textarea"
              rows={2}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="mb-2 description-input"
            />
            <Button variant="success" size="sm" onClick={handleSave}>Save</Button>
            <Button variant="secondary" size="sm" className="ms-2" onClick={() => { setEditing(false); setDesc(image.description); }}>Cancel</Button>
          </div>
        ) : (
          <div className="description-display" onClick={() => setEditing(true)}>
            {image.description ? <p className="mb-0 text-dark">{image.description}</p> : <p className="mb-0 text-muted fst-italic">Click to add description...</p>}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PortfolioItem;