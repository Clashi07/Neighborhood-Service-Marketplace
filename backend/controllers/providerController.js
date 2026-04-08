const User = require('../models/User'); // Make sure to require User at the top if it isn't there

// @desc    Get all public providers with filtering & pagination
// @route   GET /api/providers/public
// @access  Private (Customers/Admins)
exports.getPublicProviders = async (req, res) => {
  try {
    const { search, location, category, page = 1, limit = 9 } = req.query;
    let query = {};

    // 1. Filter by Location (Service Areas)
    if (location) {
      query.serviceAreas = { $regex: location, $options: 'i' }; // Case-insensitive search
    }

    // 2. Filter by Category
    if (category) {
      query['specializations.category'] = category;
    }

    // 3. Filter by Name (Requires finding matching Users first)
    if (search) {
      const users = await User.find({ name: { $regex: search, $options: 'i' }, role: 'provider' });
      const userIds = users.map(u => u._id);
      query.user = { $in: userIds };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch matching providers, populate the user name and categories
    const providers = await ServiceProvider.find(query)
      .populate({
        path: 'user',
        select: 'name isApproved rating numOfReviews' 
      })
      .populate('specializations.category', 'name')
      .skip(skip)
      .limit(Number(limit));

    // Optional: Filter out providers whose User account isn't approved yet
    const approvedProviders = providers.filter(p => p.user && p.user.isApproved !== false);

    const total = await ServiceProvider.countDocuments(query);

    res.status(200).json({
      success: true,
      count: approvedProviders.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: approvedProviders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const ServiceProvider = require('../models/ServiceProvider');

exports.getProviderProfile = async (req, res) => {
  // Update: Populate the nested 'category' field inside specializations
  let profile = await ServiceProvider.findOne({ user: req.user.id }).populate('specializations.category');
  
  if (!profile) {
    profile = await ServiceProvider.create({ user: req.user.id });
  }

  res.status(200).json({
    success: true,
    data: profile
  });
};

exports.updateProviderProfile = async (req, res) => {
  const { bio, experience, hourlyRate, serviceAreas, specializations } = req.body;

  let profile = await ServiceProvider.findOne({ user: req.user.id });

  if (!profile) {
    profile = new ServiceProvider({ user: req.user.id });
  }

  profile.bio = bio || profile.bio;
  profile.experience = experience || profile.experience;
  profile.hourlyRate = hourlyRate || profile.hourlyRate;
  profile.serviceAreas = serviceAreas ? serviceAreas.split(',').map(area => area.trim()) : profile.serviceAreas;
  
  // Update: Save the new detailed array directly
  profile.specializations = specializations || profile.specializations;

  await profile.save();

  // Update: Populate the nested 'category' field before sending back
  const updatedProfile = await ServiceProvider.findOne({ user: req.user.id }).populate('specializations.category');

  res.status(200).json({
    success: true,
    message: 'Provider profile updated successfully',
    data: updatedProfile
  });
};

exports.deleteProviderProfile = async (req, res) => {
  await ServiceProvider.findOneAndDelete({ user: req.user.id });

  res.status(200).json({
    success: true,
    message: 'Profile deleted successfully'
  });
};