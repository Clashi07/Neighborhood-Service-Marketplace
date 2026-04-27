const Bid = require('../models/Bid');
const ServiceRequest = require('../models/ServiceRequest');
const Booking = require('../models/Booking');

// @desc    Place bid on service request (FR-13)
// @route   POST /api/bids
// @access  Private/Provider
exports.createBid = async (req, res) => {
  try {
    const { serviceRequest, proposedPrice, estimatedDuration, message } = req.body;

    // FR-13.2, FR-13.3, FR-13.4: Validate required fields
    if (!serviceRequest || !proposedPrice || !estimatedDuration || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const request = await ServiceRequest.findById(serviceRequest);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // FR-13.5: Prevent providers from bidding on their own requests
    if (request.customer.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot bid on your own service request'
      });
    }

    // Check if request is still open for bidding
    if (!['open', 'bidding'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'This request is no longer accepting bids'
      });
    }

    // Check if provider already bid
    const existingBid = await Bid.findOne({
      serviceRequest,
      provider: req.user.id
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already placed a bid on this request'
      });
    }

    // FR-13.1: Create bid
    const bid = await Bid.create({
      serviceRequest,
      provider: req.user.id,
      proposedPrice,
      estimatedDuration,
      message
    });

    // FR-13.8: Update request status to "bidding" when first bid is placed
    if (request.bidCount === 0) {
      request.status = 'bidding';
    }
    request.bidCount += 1;
    await request.save();

    const populatedBid = await Bid.findById(bid._id)
      .populate('provider', 'name email profilePhoto')
      .populate('serviceRequest', 'title');

    res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      data: populatedBid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get bids for a service request (FR-14)
// @route   GET /api/bids/request/:requestId
// @access  Private/Customer
exports.getBidsForRequest = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.requestId);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Check if user is the customer who created the request
    if (serviceRequest.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view bids for this request'
      });
    }

    const { sortBy = 'createdAt' } = req.query;

    let sort = {};
    // FR-14.5, FR-14.6, FR-14.7: Sorting options
    switch (sortBy) {
      case 'price-low':
        sort = { proposedPrice: 1 };
        break;
      case 'price-high':
        sort = { proposedPrice: -1 };
        break;
      case 'rating':
        sort = { 'provider.rating.average': -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // FR-14.1, FR-14.2, FR-14.3: Get all bids with provider info
    const bids = await Bid.find({ serviceRequest: req.params.requestId })
     .populate('provider', 'name email profilePhoto')
     .sort(sort);

    // Mark bids as viewed
    await Bid.updateMany(
      { serviceRequest: req.params.requestId, isViewed: false },
      { isViewed: true }
    );

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept bid (FR-15)
// @route   PUT /api/bids/:id/accept
// @access  Private/Customer
exports.acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('serviceRequest');

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    const serviceRequest = bid.serviceRequest;

    // Check if user is the customer
    if (serviceRequest.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this bid'
      });
    }

    // FR-15.7: Prevent accepting multiple bids
    if (serviceRequest.acceptedBid) {
      return res.status(400).json({
        success: false,
        message: 'A bid has already been accepted for this request'
      });
    }

    // FR-15.1: Accept the bid
    bid.status = 'accepted';
    bid.respondedAt = Date.now();
    await bid.save();

    // FR-15.2: Auto-reject all other bids
    await Bid.updateMany(
      {
        serviceRequest: serviceRequest._id,
        _id: { $ne: bid._id },
        status: 'pending'
      },
      {
        status: 'rejected',
        respondedAt: Date.now()
      }
    );

    // FR-15.4: Create booking automatically
    const booking = await Booking.create({
      serviceRequest: serviceRequest._id,
      customer: serviceRequest.customer,
      provider: bid.provider,
      bid: bid._id,
      agreedPrice: bid.proposedPrice,
      scheduledDate: serviceRequest.preferredDate,
      status: 'pending'
    });

    // FR-15.5: Update request status to "assigned"
    serviceRequest.status = 'assigned';
    serviceRequest.acceptedBid = bid._id;
    serviceRequest.booking = booking._id;
    await serviceRequest.save();

    res.status(200).json({
      success: true,
      message: 'Bid accepted and booking created successfully',
      data: {
        bid,
        booking
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject bid (FR-15.3)
// @route   PUT /api/bids/:id/reject
// @access  Private/Customer
exports.rejectBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('serviceRequest');

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // Check if user is the customer
    if (bid.serviceRequest.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this bid'
      });
    }

    bid.status = 'rejected';
    bid.respondedAt = Date.now();
    await bid.save();

    res.status(200).json({
      success: true,
      message: 'Bid rejected successfully',
      data: bid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update bid (FR-13.6)
// @route   PUT /api/bids/:id
// @access  Private/Provider
exports.updateBid = async (req, res) => {
  try {
    let bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // Check ownership
    if (bid.provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this bid'
      });
    }

    // FR-13.6: Only allow editing if not viewed by customer yet
    if (bid.isViewed) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit bid after customer has viewed it'
      });
    }

    bid = await Bid.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('provider', 'name email');

    res.status(200).json({
      success: true,
      message: 'Bid updated successfully',
      data: bid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Withdraw bid (FR-13.7)
// @route   PUT /api/bids/:id/withdraw
// @access  Private/Provider
exports.withdrawBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('serviceRequest');

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // Check ownership
    if (bid.provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this bid'
      });
    }

    // Can only withdraw pending bids
    if (bid.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only withdraw pending bids'
      });
    }

    bid.status = 'withdrawn';
    await bid.save();

    // Update bid count
    const serviceRequest = await ServiceRequest.findById(bid.serviceRequest._id);
    serviceRequest.bidCount = Math.max(0, serviceRequest.bidCount - 1);
    await serviceRequest.save();

    res.status(200).json({
      success: true,
      message: 'Bid withdrawn successfully',
      data: bid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my bids (for providers)
// @route   GET /api/bids/my-bids
// @access  Private/Provider
exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ provider: req.user.id })
      .populate('serviceRequest', 'title status budget preferredDate')
      .populate('serviceRequest.customer', 'name profilePhoto')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};