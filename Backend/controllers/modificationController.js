import Modification from '../models/Modification.js';

// Get all modifications with optional filtering
export const getModifications = async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }
    
    const modifications = await Modification.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: modifications.length,
      data: modifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching modifications',
      error: error.message
    });
  }
};

// Get single modification by ID
export const getModificationById = async (req, res) => {
  try {
    const modification = await Modification.findById(req.params.id);
    
    if (!modification) {
      return res.status(404).json({
        success: false,
        message: 'Modification not found'
      });
    }
    
    res.json({
      success: true,
      data: modification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching modification',
      error: error.message
    });
  }
};

// Create new modification
export const createModification = async (req, res) => {
  try {
    const modification = await Modification.create(req.body);
    
    res.status(201).json({
      success: true,
      data: modification
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating modification',
      error: error.message
    });
  }
};

// Update modification
export const updateModification = async (req, res) => {
  try {
    const modification = await Modification.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!modification) {
      return res.status(404).json({
        success: false,
        message: 'Modification not found'
      });
    }
    
    res.json({
      success: true,
      data: modification
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating modification',
      error: error.message
    });
  }
};

// Delete modification
export const deleteModification = async (req, res) => {
  try {
    const modification = await Modification.findByIdAndDelete(req.params.id);
    
    if (!modification) {
      return res.status(404).json({
        success: false,
        message: 'Modification not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Modification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting modification',
      error: error.message
    });
  }
};

// Search modifications
export const searchModifications = async (req, res) => {
  try {
    const { search } = req.query;
    
    const query = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    } : {};
    
    const modifications = await Modification.find(query).sort({ rating: -1 });
    
    res.json({
      success: true,
      count: modifications.length,
      data: modifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching modifications',
      error: error.message
    });
  }
};
