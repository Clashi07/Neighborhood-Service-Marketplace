const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  createServiceRequest,
  getMyRequests,
  getServiceRequest,
  updateServiceRequest,
  deleteServiceRequest,
  getAllServiceRequests
} = require('../controllers/serviceRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer configuration for service request images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `request-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: fileFilter
});

const uploadMiddleware = (req, res, next) => {
  const multerUpload = upload.array('images', 5); // Max 5 images
  multerUpload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Customer routes
router.post('/', protect, authorize('customer'), uploadMiddleware, createServiceRequest);
router.get('/my-requests', protect, authorize('customer'), getMyRequests);
router.put('/:id', protect, authorize('customer'), updateServiceRequest);
router.delete('/:id', protect, authorize('customer'), deleteServiceRequest);

// Provider routes
router.get('/', protect, authorize('provider'), getAllServiceRequests);

// Both customer and provider can view details
router.get('/:id', protect, getServiceRequest);

module.exports = router;