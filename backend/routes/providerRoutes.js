const express = require('express');
const {
  getProviderProfile,
  updateProviderProfile,
  deleteProviderProfile,
  getPublicProviders
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, authorize('provider'), getProviderProfile);
router.get('/public', protect, getPublicProviders);
router.put('/profile', protect, authorize('provider'), updateProviderProfile);
router.delete('/profile', protect, authorize('provider'), deleteProviderProfile);

module.exports = router;