const express = require('express');
const {
  setMyServices,
  getMyServices,
  updateMyService,
  removeMyService,
  getAllActiveServices,
} = require('../controllers/providerServiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// ── Public (Customer) ──────────────────────────────────
// GET /api/provider-services              → browse all active services
router.get('/', getAllActiveServices);

// ── Provider (authenticated) ───────────────────────────
// GET  /api/provider-services/my-services → get my own services
// POST /api/provider-services/my-services → publish / replace my services
router
  .route('/my-services')
  .get(protect, authorize('provider'), getMyServices)
  .post(protect, authorize('provider'), setMyServices);

// PUT    /api/provider-services/:id  → update one service
// DELETE /api/provider-services/:id  → remove one service
router
  .route('/:id')
  .put(protect, authorize('provider'), updateMyService)
  .delete(protect, authorize('provider'), removeMyService);

module.exports = router;