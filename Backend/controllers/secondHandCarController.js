import SecondHandCar from '../models/SecondHandCar.js';
import User from '../models/User.js';

// @desc    Get all second-hand car listings
// @route   GET /api/second-hand-cars
// @access  Public
export const getSecondHandCars = async (req, res) => {
  try {
    const listings = await SecondHandCar.find({ available: true }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get seller's own second-hand listings
// @route   GET /api/second-hand-cars/mine
// @access  Private
export const getMySecondHandCars = async (req, res) => {
  try {
    const listings = await SecondHandCar.find({ sellerId: req.userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single second-hand listing
// @route   GET /api/second-hand-cars/:id
// @access  Public
export const getSecondHandCarById = async (req, res) => {
  try {
    const listing = await SecondHandCar.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Second-hand listing not found'
      });
    }
    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create second-hand listing
// @route   POST /api/second-hand-cars
// @access  Private
export const createSecondHandCar = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    const payload = {
      ...req.body,
      category: 'second-hand',
      sellerId: req.userId,
      sellerName: user.name,
      sellerEmail: user.email
    };

    const listing = await SecondHandCar.create(payload);
    res.status(201).json({
      success: true,
      data: listing
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update second-hand listing
// @route   PUT /api/second-hand-cars/:id
// @access  Private (owner or admin)
export const updateSecondHandCar = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    const listing = await SecondHandCar.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Second-hand listing not found'
      });
    }

    const isOwner = String(listing.sellerId) === String(req.userId);
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this listing'
      });
    }

    const updated = await SecondHandCar.findByIdAndUpdate(
      req.params.id,
      { ...req.body, category: 'second-hand' },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
