const ServiceRequest = require('../models/ServiceRequest');
const Bid = require('../models/Bid');
const path = require('path');

// @desc    Create service request (FR-10)
// @route   POST /api/service-requests
// @access  Private/Customer
exports.createServiceRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      serviceCategory,
      budget,
      preferredDate,
      location
    } = req.body;

    // FR-10.1 to FR-10.6: Validate required fields
    if (!title || !description || !serviceCategory || !budget || !preferredDate || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Handle uploaded images (FR-10.5: max 5 images)
    let images = [];
    if (req.files && req.files.length > 0) {
      if (req.files.length > 5) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 5 images allowed'
        });
      }
      images = req.files.map(file => ({
        filename: file.filename,
        url: `/uploads/${file.filename}`
      }));
    }

    // FR-10.8: Create request with status "open"
    const serviceRequest = await ServiceRequest.create({
      customer: req.user.id,
      title,
      description,
      serviceCategory,
      budget,
      preferredDate,
      location,
      images,
      status: 'open'
    });

    const populatedRequest = await ServiceRequest.findById(serviceRequest._id)
      .populate('customer', 'name email phone')
      .populate('serviceCategory', 'name icon');

    res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      data: populatedRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my service requests (FR-11)
// @route   GET /api/service-requests/my-requests
// @access  Private/Customer
exports.getMyRequests = async (req, res) => {
  try {
    const { status } = req.query;

    // FR-11.4: Filter by status
    let query = { customer: req.user.id };
    if (status) {
      query.status = status;
    }

    // FR-11.1, FR-11.2, FR-11.3: Get all requests with bid count
    const requests = await ServiceRequest.find(query)
      .populate('serviceCategory', 'name icon')
      .populate('acceptedBid')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get service request by ID (FR-11.5)
// @route   GET /api/service-requests/:id
// @access  Private
exports.getServiceRequest = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id)
      .populate('customer', 'name email phone profilePhoto')
      .populate('serviceCategory', 'name icon description')
      .populate('acceptedBid');

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: serviceRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update service request (FR-11.6)
// @route   PUT /api/service-requests/:id
// @access  Private/Customer
exports.updateServiceRequest = async (req, res) => {
  try {
    let serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Check ownership
    if (serviceRequest.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    // FR-11.6: Only allow editing if no bids received
    if (serviceRequest.bidCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit request that has received bids'
      });
    }

    serviceRequest = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('serviceCategory', 'name icon');

    res.status(200).json({
      success: true,
      message: 'Service request updated successfully',
      data: serviceRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete service request (FR-11.7)
// @route   DELETE /api/service-requests/:id
// @access  Private/Customer
exports.deleteServiceRequest = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Check ownership
    if (serviceRequest.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request'
      });
    }

    // FR-11.7: Only allow deletion if no bids received
    if (serviceRequest.bidCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete request that has received bids'
      });
    }

    await serviceRequest.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Browse available service requests (FR-12)
// @route   GET /api/service-requests
// @access  Private/Provider
exports.getAllServiceRequests = async (req, res) => {
  try {
    const {
      category,
      minBudget,
      maxBudget,
      location,
      dateFrom,
      page = 1,
      limit = 12
    } = req.query;

    // FR-12.1: Display all open requests
    let query = { status: { $in: ['open', 'bidding'] }, isActive: true };

    // FR-12.2: Filter by category
    if (category) {
      query.serviceCategory = category;
    }

    // FR-12.3: Filter by budget range
    if (minBudget || maxBudget) {
      query['budget.min'] = {};
      if (minBudget) query['budget.min'].$gte = parseFloat(minBudget);
      if (maxBudget) query['budget.max'].$lte = parseFloat(maxBudget);
    }

    // FR-12.4: Filter by location
    if (location) {
      query['location.city'] = new RegExp(location, 'i');
    }

    // FR-12.5: Filter by date posted
    if (dateFrom) {
      query.createdAt = { $gte: new Date(dateFrom) };
    }

    const skip = (page - 1) * limit;

    // FR-12.6: Get requests with customer info
    const requests = await ServiceRequest.find(query)
      .populate('customer', 'name profilePhoto rating')
      .populate('serviceCategory', 'name icon')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    // FR-12.7: Check if provider has already bid
    const requestsWithBidStatus = await Promise.all(
      requests.map(async (request) => {
        const existingBid = await Bid.findOne({
          serviceRequest: request._id,
          provider: req.user.id
        });

        return {
          ...request.toObject(),
          hasMyBid: !!existingBid,
          myBidStatus: existingBid?.status
        };
      })
    );

    const total = await ServiceRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      count: requestsWithBidStatus.length,
      total,
      pages: Math.ceil(total / limit),
      data: requestsWithBidStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};