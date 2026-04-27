import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CategorySelector from '../components/provider/CategorySelector';
import ServiceConfigForm from '../components/provider/ServiceConfigForm';
import { getAllCategories } from '../../services/categoryService';
import { setMyServices, getMyServices } from '../../services/providerService';

const ProviderCategoriesPage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // getAllCategories() already returns response.data from the service
        const catRes = await getAllCategories();
        const categoryList = Array.isArray(catRes) ? catRes : (catRes?.data || []);
        setCategories(categoryList);

        // Try loading existing services but don't fail the whole page if 404
        try {
          const myServicesRes = await getMyServices();
          const myServices = Array.isArray(myServicesRes)
            ? myServicesRes
            : (myServicesRes?.data || []);

          if (myServices.length > 0) {
            const preSelected = new Set();
            const preConfigs = {};
            myServices.forEach((svc) => {
              const catId = svc.category?._id;
              if (catId) {
                preSelected.add(catId);
                preConfigs[catId] = {
                  minPrice: svc.minPrice,
                  maxPrice: svc.maxPrice,
                  description: svc.description || '',
                };
              }
            });
            setSelected(preSelected);
            setConfigs(preConfigs);
          }
        } catch (svcErr) {
          // Backend route not ready yet — silently ignore, page still works
          console.warn('Could not load existing services:', svcErr?.response?.status);
        }
      } catch (err) {
        setError('Failed to load categories. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggle = useCallback((categoryId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
        setConfigs((c) => {
          const updated = { ...c };
          delete updated[categoryId];
          return updated;
        });
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const handleConfigChange = useCallback((categoryId, field, value) => {
    setConfigs((prev) => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], [field]: value },
    }));
  }, []);

  const validate = () => {
    for (const catId of selected) {
      const cfg = configs[catId] || {};
      if (!cfg.minPrice || !cfg.maxPrice) {
        const cat = categories.find((c) => c._id === catId);
        setError(`Please set a price range for "${cat?.name}"`);
        return false;
      }
      if (Number(cfg.minPrice) > Number(cfg.maxPrice)) {
        const cat = categories.find((c) => c._id === catId);
        setError(`Min price cannot exceed max price for "${cat?.name}"`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    if (selected.size === 0) {
      setError('Please select at least one service category.');
      return;
    }
    if (!validate()) return;

    const services = [...selected].map((catId) => ({
      categoryId: catId,
      minPrice: Number(configs[catId].minPrice),
      maxPrice: Number(configs[catId].maxPrice),
      description: configs[catId]?.description || '',
    }));

    try {
      setSubmitting(true);
      await setMyServices(services);
      setSuccessMsg('Your services are now live and visible to customers!');
      setTimeout(() => navigate('/provider/dashboard'), 2000);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Failed to publish services. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategories = categories.filter((c) => selected.has(c._id));

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
        <p className="text-muted">Loading categories…</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="fw-bold mb-2">Select Your Service Categories</h1>
      <p className="text-muted mb-4">
        Choose the categories that match the services you provide. You can select
        multiple categories.
      </p>

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError('')}
          />
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success" role="alert">
          {successMsg}
        </div>
      )}

      <CategorySelector
        categories={categories}
        selected={selected}
        onToggle={handleToggle}
      />

      <ServiceConfigForm
        selectedCategories={selectedCategories}
        configs={configs}
        onChange={handleConfigChange}
      />

      <div className="d-flex justify-content-end mt-4">
        <button
          className="btn btn-primary px-4 py-2"
          onClick={handleSubmit}
          disabled={selected.size === 0 || submitting}
        >
          {submitting
            ? 'Publishing…'
            : `Publish ${selected.size > 0 ? selected.size : ''} service${selected.size !== 1 ? 's' : ''} to customers`}
        </button>
      </div>
    </div>
  );
};

export default ProviderCategoriesPage;