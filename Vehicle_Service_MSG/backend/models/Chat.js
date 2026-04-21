const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    listingId: {
        type: String,
        required: true,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    categoryType: {
        type: String,
        enum: ['Branded Cars', 'Second-Hand Cars', 'Spare Parts', 'Modification Items'],
        required: true,
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    },
    archivedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reports: [{
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        description: String,
        reportedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Ensure unique chat per listing+buyer combo
chatSchema.index({ listingId: 1, buyerId: 1 }, { unique: true });

module.exports = mongoose.model('Chat', chatSchema);
