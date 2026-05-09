const express = require('express');
const {
  getAllUsers,
  getUserById,
  toggleUserActive,
  changeUserRole,
  deleteUser,
  getPendingUsers
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require admin
router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.get('/users/pending', getPendingUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/toggle-active', toggleUserActive);
router.put('/users/:id/change-role', changeUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;