import mongoose from 'mongoose';

const secondHandCarSchema = new mongoose.Schema(
  {
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
      required: [true, 'Vehicle number is required'],
      trim: true
    },
    vehicleColor: {
      type: String,
      required: [true, 'Vehicle color is required'],
      trim: true
    },
    year: {
      type: Number,
      required: [true, 'Year is required']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    mileage: {
      type: String,
      required: [true, 'Mileage is required']
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
      required: [true, 'Fuel type is required']
    },
    transmission: {
      type: String,
      enum: ['Automatic', 'Manual', 'CVT', 'AWD'],
      required: [true, 'Transmission is required']
    },
    condition: {
      type: String,
      enum: ['Used - Excellent', 'Used - Very Good', 'Used - Good', 'Used - Fair'],
      default: 'Used - Good'
    },
    image: {
      type: String,
      required: [true, 'Vehicle image is required']
    },
    vehicleImage: {
      type: String,
      default: ''
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
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sellerName: {
      type: String,
      trim: true
    },
    sellerEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    category: {
      type: String,
      default: 'second-hand'
    },
    available: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

secondHandCarSchema.index({ sellerId: 1, createdAt: -1 });
secondHandCarSchema.index({ brand: 1, model: 1 });
secondHandCarSchema.index({ price: 1 });

export default mongoose.model('SecondHandCar', secondHandCarSchema, 'second_hand_cars');
