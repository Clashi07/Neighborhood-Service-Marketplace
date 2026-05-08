const express = require('express');
const {
  getAllUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  deactivateAccount,
  updateNotificationPreferences
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/pending', protect, authorize('admin'), getPendingUsers);
router.put('/:id/approve', protect, authorize('admin'), approveUser);
router.put('/:id/reject', protect, authorize('admin'), rejectUser);

// User routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, changePassword);
router.put('/deactivate', protect, deactivateAccount);
router.put('/notification-preferences', protect, updateNotificationPreferences);

module.exports = router;