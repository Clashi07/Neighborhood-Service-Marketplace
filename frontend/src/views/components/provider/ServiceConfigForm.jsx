import React from 'react';

const ServiceConfigForm = ({ selectedCategories, configs, onChange }) => {
  if (!selectedCategories || selectedCategories.length === 0) return null;

  return (
    <div className="card border rounded-3 p-4 mb-4">
      <h5 className="fw-bold mb-1">Configure your selected services</h5>
      <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
        Set a price range and description for each service you offer.
      </p>

      <div className="d-flex flex-column gap-4">
        {selectedCategories.map((cat) => {
          const cfg = configs[cat._id] || {};
          return (
            <div
              key={cat._id}
              className="border rounded-3 p-3"
              style={{ backgroundColor: '#f8f9fa' }}
            >
              {/* Header */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                <span className="fw-semibold fs-6">{cat.name}</span>
              </div>

              {/* Price row */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                  <label
                    htmlFor={`min-${cat._id}`}
                    className="form-label fw-medium"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Min price (৳)
                  </label>
                  <input
                    id={`min-${cat._id}`}
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="e.g. 500"
                    value={cfg.minPrice || ''}
                    onChange={(e) => onChange(cat._id, 'minPrice', e.target.value)}
                  />
                </div>

                <div className="col-12 col-sm-6">
                  <label
                    htmlFor={`max-${cat._id}`}
                    className="form-label fw-medium"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Max price (৳)
                  </label>
                  <input
                    id={`max-${cat._id}`}
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="e.g. 2000"
                    value={cfg.maxPrice || ''}
                    onChange={(e) => onChange(cat._id, 'maxPrice', e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor={`desc-${cat._id}`}
                  className="form-label fw-medium"
                  style={{ fontSize: '0.85rem' }}
                >
                  Your service description{' '}
                  <span className="text-muted fw-normal">(optional)</span>
                </label>
                <textarea
                  id={`desc-${cat._id}`}
                  className="form-control"
                  rows={3}
                  placeholder={`Describe what makes your ${cat.name.toLowerCase()} service special...`}
                  value={cfg.description || ''}
                  onChange={(e) => onChange(cat._id, 'description', e.target.value)}
                  maxLength={500}
                />
                <div className="text-end text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                  {(cfg.description || '').length}/500
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceConfigForm;