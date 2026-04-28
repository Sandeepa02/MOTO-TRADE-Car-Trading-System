import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  vehicleNumber: {
    type: String,
    trim: true
  },
  vehicleColor: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  priceFormatted: {
    type: String
  },
  rating: {
    type: Number,
    min: [0, 'Minimum rating is 0'],
    max: [5, 'Maximum rating is 5'],
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  features: [{
    type: String
  }],
  fuelType: {
    type: String,
    enum: {
      values: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
      message: 'Invalid fuel type'
    },
    required: [true, 'Fuel type is required']
  },
  transmission: {
    type: String,
    enum: {
      values: ['Automatic', 'Manual', 'CVT', 'AWD'],
      message: 'Invalid transmission type'
    },
    required: [true, 'Transmission is required']
  },
  vehicleType: {
    type: String,
    enum: {
      values: ['sedan', 'suv', 'hatchback', 'truck', 'coupe', 'convertible', 'van', 'cab'],
      message: 'Invalid vehicle type'
    },
    required: [true, 'Vehicle type is required']
  },
  usage: [{
    type: String
  }],
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  mileage: {
    type: Number,
    min: [0, 'Mileage must be positive']
  },
  condition: {
    type: String,
    enum: {
      values: ['New', 'Used - Excellent', 'Used - Very Good', 'Used - Good', 'Used - Fair'],
      message: 'Invalid condition'
    },
    default: 'New'
  },
  location: {
    city: String,
    state: String,
    country: {
      type: String,
      default: 'Sri Lanka'
    }
  },
  seller: {
    name: String,
    contact: String,
    email: String,
    company: String
  },
  ownerInformation: {
    ownerName: {
      type: String,
      trim: true
    },
    ownerAddress: {
      type: String,
      trim: true
    },
    ownerNICNumber: {
      type: String,
      trim: true
    },
    ownerPhoneNumber: {
      type: String,
      trim: true
    },
    ownerIdFrontImage: {
      type: String,
      default: ''
    },
    ownerIdBackImage: {
      type: String,
      default: ''
    }
  },
  available: {
    type: Boolean,
    default: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['branded', 'second-hand', 'new', 'spare-part', 'modification'],
    default: 'new'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
vehicleSchema.index({ brand: 1, model: 1 });
vehicleSchema.index({ vehicleType: 1 });
vehicleSchema.index({ price: 1 });
vehicleSchema.index({ year: -1 });
vehicleSchema.index({ rating: -1 });
vehicleSchema.index({ createdAt: -1 });

// Virtual for formatted price if not provided
vehicleSchema.pre('save', function(next) {
  if (!this.priceFormatted && this.price) {
    this.priceFormatted = `Rs. ${this.price.toLocaleString()}`;
  }
  next();
});

// Static method to search vehicles
vehicleSchema.statics.searchVehicles = function(criteria) {
  const query = {};
  
  if (criteria.brand) query.brand = { $regex: criteria.brand, $options: 'i' };
  if (criteria.vehicleType) query.vehicleType = criteria.vehicleType;
  if (criteria.fuelType) query.fuelType = criteria.fuelType;
  if (criteria.minPrice || criteria.maxPrice) {
    query.price = {};
    if (criteria.minPrice) query.price.$gte = criteria.minPrice;
    if (criteria.maxPrice) query.price.$lte = criteria.maxPrice;
  }
  if (criteria.year) query.year = criteria.year;
  if (criteria.available !== undefined) query.available = criteria.available;
  
  return this.find(query).sort({ createdAt: -1 });
};

export default mongoose.model('Vehicle', vehicleSchema);
