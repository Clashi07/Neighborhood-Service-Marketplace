import React, { useState, useEffect } from 'react';
import { getAllActiveServices } from '../../../services/providerService';
import categoryService from '../../../services/categoryService';
import BookNowModal from './BookNowModal'; // ← ADD
import './ServiceBrowse.css';

const ServiceBrowse = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null); // ← ADD
  const [showBookModal, setShowBookModal] = useState(false);       // ← ADD

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [svcRes, catRes] = await Promise.all([
          getAllActiveServices(),
          categoryService.getAllCategories(),
        ]);
        setServices(svcRes.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        setError('Failed to load services. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ← ADD
  const handleBookNow = (svc) => {
    const providerName = svc.provider?.user?.name || svc.provider?.businessName || 'Provider';
    const providerId = svc.provider?.user?._id || svc.provider?._id;
    setSelectedProvider({ _id: providerId, name: providerName });
    setShowBookModal(true);
  };

  const filtered =
    activeCategory === 'all'
      ? services
      : services.filter((s) => s.category._id === activeCategory);

  const formatPrice = (min, max) => {
    if (min && max) return `৳${Number(min).toLocaleString()} – ৳${Number(max).toLocaleString()}`;
    if (min) return `From ৳${Number(min).toLocaleString()}`;
    if (max) return `Up to ৳${Number(max).toLocaleString()}`;
    return 'Price on request';
  };

  const getInitials = (name = '') =>
    name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  if (loading) {
    return (
      <div className="sb-loading">
        <div className="sb-spinner" />
        <p>Loading services…</p>
      </div>
    );
  }

  if (error) return <div className="sb-error">{error}</div>;

  return (
    <div className="sb-container">
      <div className="sb-header">
        <h2 className="sb-title">Services available near you</h2>
        <p className="sb-subtitle">
          Browse verified providers and book a service in minutes.
        </p>
      </div>

      {categories.length > 0 && (
        <div className="sb-filters">
          <button
            className={`sb-filter-btn ${activeCategory === 'all' ? 'sb-filter-btn--active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`sb-filter-btn ${activeCategory === cat._id ? 'sb-filter-btn--active' : ''}`}
              onClick={() => setActiveCategory(cat._id)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="sb-empty">
          <span className="sb-empty-icon">🔍</span>
          <p>No services found in this category yet.</p>
        </div>
      ) : (
        <div className="sb-grid">
          {filtered.map((svc) => {
            const providerName =
              svc.provider?.user?.name || svc.provider?.businessName || 'Provider';
            return (
              <div key={svc._id} className="sb-card">
                <div className="sb-card-icon">{svc.category.icon}</div>
                <h3 className="sb-card-name">{svc.category.name}</h3>
                <div className="sb-provider-chip">
                  <div className="sb-avatar">{getInitials(providerName)}</div>
                  <div className="sb-provider-info">
                    <span className="sb-provider-name">{providerName}</span>
                    {svc.provider?.rating > 0 && (
                      <span className="sb-rating">
                        ★ {svc.provider.rating.toFixed(1)}{' '}
                        <span className="sb-rating-count">({svc.provider.totalReviews})</span>
                      </span>
                    )}
                  </div>
                </div>
                <p className="sb-card-desc">
                  {svc.description || svc.category.description}
                </p>
                <div className="sb-price-tag">
                  {formatPrice(svc.minPrice, svc.maxPrice)}
                </div>
                {/* ← CHANGED: was just a button, now calls handleBookNow */}
                <button
                  className="sb-book-btn"
                  onClick={() => handleBookNow(svc)}
                >
                  Book now
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ← ADD: Modal at bottom */}
      {selectedProvider && (
        <BookNowModal
          show={showBookModal}
          onHide={() => { setShowBookModal(false); setSelectedProvider(null); }}
          provider={selectedProvider}
        />
      )}
    </div>
  );
};

export default ServiceBrowse;