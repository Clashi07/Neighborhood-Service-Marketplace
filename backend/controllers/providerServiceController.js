const ProviderService = require('../models/ProviderService');
const ServiceProvider = require('../models/ServiceProvider');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

const getOrCreateProviderProfile = async (userId) => {
  let profile = await ServiceProvider.findOne({ user: userId });
  if (!profile) {
    profile = await ServiceProvider.create({ user: userId });
  }
  return profile;
};

exports.setMyServices = catchAsyncErrors(async (req, res, next) => {
  const { services } = req.body;
  if (!services || !Array.isArray(services) || services.length === 0) {
    return next(new ErrorHandler('Please provide at least one service', 400));
  }
  const providerProfile = await getOrCreateProviderProfile(req.user.id);
  await ProviderService.deleteMany({ provider: providerProfile._id });
  const serviceData = services.map((s) => ({
    provider: providerProfile._id,
    category: s.categoryId,
    minPrice: s.minPrice,
    maxPrice: s.maxPrice,
    description: s.description || '',
    isActive: true,
  }));
  const created = await ProviderService.insertMany(serviceData);
  res.status(201).json({ success: true, message: 'Services published successfully', count: created.length, data: created });
});

exports.getMyServices = catchAsyncErrors(async (req, res, next) => {
  const providerProfile = await getOrCreateProviderProfile(req.user.id);
  const services = await ProviderService.find({ provider: providerProfile._id })
    .populate('category', 'name icon description');
  res.status(200).json({ success: true, count: services.length, data: services });
});

exports.updateMyService = catchAsyncErrors(async (req, res, next) => {
  const providerProfile = await getOrCreateProviderProfile(req.user.id);
  let service = await ProviderService.findOne({ _id: req.params.id, provider: providerProfile._id });
  if (!service) return next(new ErrorHandler('Service not found or not authorized', 404));
  const { minPrice, maxPrice, description, isActive } = req.body;
  service = await ProviderService.findByIdAndUpdate(req.params.id, { minPrice, maxPrice, description, isActive }, { new: true, runValidators: true }).populate('category', 'name icon description');
  res.status(200).json({ success: true, data: service });
});

exports.removeMyService = catchAsyncErrors(async (req, res, next) => {
  const providerProfile = await getOrCreateProviderProfile(req.user.id);
  const service = await ProviderService.findOne({ _id: req.params.id, provider: providerProfile._id });
  if (!service) return next(new ErrorHandler('Service not found or not authorized', 404));
  await service.deleteOne();
  res.status(200).json({ success: true, message: 'Service removed' });
});

exports.getAllActiveServices = catchAsyncErrors(async (req, res, next) => {
  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  const services = await ProviderService.find(filter)
    .populate('category', 'name icon description')
    .populate({ path: 'provider', select: 'businessName rating totalReviews', populate: { path: 'user', select: 'name profilePhoto' } })
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: services.length, data: services });
});