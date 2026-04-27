import React from 'react';

const CategorySelector = ({ categories, selected, onToggle }) => {
  return (
    <div className="mb-4">
      {selected.size > 0 && (
        <div className="text-success mb-3 fw-semibold">
          ✓ {selected.size} categor{selected.size > 1 ? 'ies' : 'y'} selected
        </div>
      )}

      <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-3">
        {categories.map((cat) => {
          const isSelected = selected.has(cat._id);
          return (
            <div className="col" key={cat._id}>
              <div
                onClick={() => onToggle(cat._id)}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onToggle(cat._id)}
                className="card h-100 text-center p-3 position-relative"
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #198754' : '2px solid #dee2e6',
                  backgroundColor: isSelected ? '#f0fff4' : '',
                  transition: 'all 0.2s ease',
                  borderRadius: '12px',
                }}
              >
                {isSelected && (
                  <span
                    className="position-absolute top-0 end-0 m-2 badge bg-success"
                    style={{ fontSize: '0.7rem' }}
                  >
                    ✓
                  </span>
                )}
                <div style={{ fontSize: '2.2rem' }} className="mb-2">
                  {cat.icon}
                </div>
                <p className="fw-semibold mb-1" style={{ fontSize: '0.95rem' }}>
                  {cat.name}
                </p>
                <p className="text-muted mb-0" style={{ fontSize: '0.78rem' }}>
                  {cat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;