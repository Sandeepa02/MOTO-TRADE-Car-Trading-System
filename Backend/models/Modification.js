import mongoose from 'mongoose';

const modificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Modification name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Exterior', 'Interior', 'Performance', 'Suspension', 'Brakes', 'Wheels', 'Lighting', 'Electronics', 'Audio'],
    required: [true, 'Category is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  image: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  compatibleVehicles: [{
    type: String
  }],
  brand: {
    type: String
  },
  installationIncluded: {
    type: Boolean,
    default: false
  },
  warranty: {
    type: String
  },
  rating: {
    type: Number,
    min: [0, 'Minimum rating is 0'],
    max: [5, 'Maximum rating is 5'],
    default: 0
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
modificationSchema.index({ category: 1 });
modificationSchema.index({ price: 1 });

export default mongoose.model('Modification', modificationSchema);
