import mongoose from 'mongoose';

const sparePartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Part name is required'],
    trim: true
  },
  compatibleVehicle: {
    type: String,
    required: [true, 'Compatible vehicle information is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  originalPrice: {
    type: Number
  },
  discount: {
    type: Number,
    min: [0, 'Discount must be positive'],
    max: [100, 'Discount cannot exceed 100%']
  },
  image: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['Engine Parts', 'Lighting', 'Wheels & Tires', 'Brake System', 'Performance', 'Exhaust', 'Interior', 'Exterior', 'Electronics'],
    required: [true, 'Category is required']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  available: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: [0, 'Minimum rating is 0'],
    max: [5, 'Maximum rating is 5'],
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
sparePartSchema.index({ category: 1 });
sparePartSchema.index({ price: 1 });
sparePartSchema.index({ compatibleVehicle: 1 });

export default mongoose.model('SparePart', sparePartSchema);
