const express = require('express');
const {
  createBid,
  getBidsForRequest,
  acceptBid,
  rejectBid,
  updateBid,
  withdrawBid,
  getMyBids
} = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Provider routes
router.post('/', protect, authorize('provider'), createBid);
router.get('/my-bids', protect, authorize('provider'), getMyBids);
router.put('/:id', protect, authorize('provider'), updateBid);
router.put('/:id/withdraw', protect, authorize('provider'), withdrawBid);

// Customer routes
router.get('/request/:requestId', protect, authorize('customer'), getBidsForRequest);
router.put('/:id/accept', protect, authorize('customer'), acceptBid);
router.put('/:id/reject', protect, authorize('customer'), rejectBid);

module.exports = router;