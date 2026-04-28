import SparePart from '../models/SparePart.js';

// Get all spare parts with optional filtering
export const getSpareParts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, compatibleVehicle } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }
    if (compatibleVehicle) {
      query.compatibleVehicle = { $regex: compatibleVehicle, $options: 'i' };
    }
    
    const spareParts = await SparePart.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: spareParts.length,
      data: spareParts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching spare parts',
      error: error.message
    });
  }
};

// Get single spare part by ID
export const getSparePartById = async (req, res) => {
  try {
    const sparePart = await SparePart.findById(req.params.id);
    
    if (!sparePart) {
      return res.status(404).json({
        success: false,
        message: 'Spare part not found'
      });
    }
    
    res.json({
      success: true,
      data: sparePart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching spare part',
      error: error.message
    });
  }
};

// Create new spare part
export const createSparePart = async (req, res) => {
  try {
    const sparePart = await SparePart.create(req.body);
    
    res.status(201).json({
      success: true,
      data: sparePart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating spare part',
      error: error.message
    });
  }
};

// Update spare part
export const updateSparePart = async (req, res) => {
  try {
    const sparePart = await SparePart.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!sparePart) {
      return res.status(404).json({
        success: false,
        message: 'Spare part not found'
      });
    }
    
    res.json({
      success: true,
      data: sparePart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating spare part',
      error: error.message
    });
  }
};

// Delete spare part
export const deleteSparePart = async (req, res) => {
  try {
    const sparePart = await SparePart.findByIdAndDelete(req.params.id);
    
    if (!sparePart) {
      return res.status(404).json({
        success: false,
        message: 'Spare part not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Spare part deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting spare part',
      error: error.message
    });
  }
};

// Search spare parts
export const searchSpareParts = async (req, res) => {
  try {
    const { search } = req.query;
    
    const query = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { compatibleVehicle: { $regex: search, $options: 'i' } }
      ]
    } : {};
    
    const spareParts = await SparePart.find(query).sort({ rating: -1 });
    
    res.json({
      success: true,
      count: spareParts.length,
      data: spareParts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching spare parts',
      error: error.message
    });
  }
};
