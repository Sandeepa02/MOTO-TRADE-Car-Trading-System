const mongoose = require('mongoose');

const offerDataSchema = new mongoose.Schema({
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED'],
        default: 'PENDING'
    }
}, { _id: false });

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['TEXT', 'IMAGE', 'PDF', 'OFFER', 'COUNTER_OFFER'],
        default: 'TEXT',
        required: true,
    },
    content: {
        type: String,
    },
    offerData: {
        type: offerDataSchema,
        default: null
    },
    isSpamExpected: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
