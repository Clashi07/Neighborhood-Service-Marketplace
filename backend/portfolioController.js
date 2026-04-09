const path = require('path');
const fs = require('fs');
const PortfolioImage = require('../models/PortfolioImage');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a valid image (JPEG/PNG, max 5MB)' });
    }

    // Check limit
    const count = await PortfolioImage.countDocuments({ provider: req.user.id });
    if (count >= 10) {
      // delete the uploaded file if limit reached
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Maximum 10 portfolio images allowed' });
    }

    const { description } = req.body;

    const newImage = await PortfolioImage.create({
      provider: req.user.id,
      filename: req.file.filename,
      description: description || '',
      order: count // append to end
    });

    res.status(201).json({ success: true, data: newImage });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPortfolio = async (req, res) => {
  try {
    const images = await PortfolioImage.find({ provider: req.user.id }).sort('order');
    res.status(200).json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const image = await PortfolioImage.findOne({ _id: req.params.id, provider: req.user.id });
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    const filePath = path.join(__dirname, '../uploads', image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await image.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDescription = async (req, res) => {
  try {
    const { description } = req.body;
    const image = await PortfolioImage.findOneAndUpdate(
      { _id: req.params.id, provider: req.user.id },
      { description },
      { new: true, runValidators: true }
    );
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    res.status(200).json({ success: true, data: image });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reorderImages = async (req, res) => {
  try {
    const { reorderedItems } = req.body; // array of { id, newOrder }
    if (!Array.isArray(reorderedItems)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }
    
    for (const item of reorderedItems) {
      await PortfolioImage.findOneAndUpdate(
        { _id: item.id, provider: req.user.id },
        { order: item.newOrder }
      );
    }
    res.status(200).json({ success: true, message: 'Reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
