const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: 'https://ui-avatars.com/api/?name=User'
    },
    status: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    },
    reputationScore: {
        type: Number,
        default: 100
    },
    role: {
        type: String,
        enum: ['Buyer', 'Seller'],
        default: 'Buyer'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
