const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  uploadImage,
  getPortfolio,
  deleteImage,
  updateDescription,
  reorderImages
} = require('../controllers/portfolioController');

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Images must be JPEG or PNG'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

const uploadMiddleware = (req, res, next) => {
  const multerUpload = upload.single('image');
  multerUpload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.post('/', protect, authorize('provider'), uploadMiddleware, uploadImage);
router.get('/', protect, authorize('provider'), getPortfolio);
router.put('/reorder', protect, authorize('provider'), reorderImages);
router.put('/:id', protect, authorize('provider'), updateDescription);
router.delete('/:id', protect, authorize('provider'), deleteImage);

module.exports = router;
