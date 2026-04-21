const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Archive or Unarchive a chat
// @route   PUT /api/chats/:id/archive
// @access  Private
const archiveChat = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Initialize array for older chat documents that didn't have it
        if (!chat.archivedBy) {
            chat.archivedBy = [];
        }

        // Toggle logic: check using .toString() because Mongoose ObjectId arrays don't strictly equal Strings
        const isArchived = chat.archivedBy.some(id => id.toString() === req.userId.toString());
        
        if (isArchived) {
            chat.archivedBy = chat.archivedBy.filter(id => id.toString() !== req.userId.toString());
        } else {
            chat.archivedBy.push(req.userId);
        }

        await chat.save();
        
        const fullChat = await Chat.findById(req.params.id)
            .populate('ownerId', '-password')
            .populate('buyerId', '-password')
            .populate('lastMessage');

        res.status(200).json(fullChat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Report a conversation
// @route   POST /api/chats/:id/report
// @access  Private
const reportChat = async (req, res) => {
    try {
        const { reason, description } = req.body;
        const chat = await Chat.findById(req.params.id);
        
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        
        const alreadyReported = chat.reports?.some(r => r.reportedBy.toString() === req.userId.toString());
        if (alreadyReported) {
             return res.status(400).json({ message: 'You have already reported this conversation.' });
        }

        if (!chat.reports) {
            chat.reports = [];
        }

        chat.reports.push({
            reportedBy: req.userId,
            reason,
            description
        });

        await chat.save();
        res.status(200).json(chat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Fetch all chats for a user
// @route   GET /api/chats
// @access  Private
const fetchChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            $or: [{ ownerId: req.userId }, { buyerId: req.userId }]
        })
        .populate('ownerId', 'name avatar email')
        .populate('buyerId', 'name avatar email')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

        res.status(200).json(chats);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create or fetch a one-on-one chat for a listing
// @route   POST /api/chats
// @access  Private
const accessChat = async (req, res) => {
    const { listingId, ownerId, categoryType } = req.body;

    if (!listingId || !ownerId || !categoryType) {
        return res.status(400).json({ message: 'Missing parameters. Need listingId, ownerId, categoryType.' });
    }

    // Owner cannot chat with themselves
    if (ownerId === req.userId) {
        return res.status(400).json({ message: 'You cannot initiate a chat as a buyer on your own listing.' });
    }

    try {
        // Find existing chat for this listing and buyer
        let chat = await Chat.findOne({
            listingId,
            buyerId: req.userId
        })
        .populate('ownerId', '-password')
        .populate('buyerId', '-password')
        .populate('lastMessage');

        if (chat) {
            return res.status(200).json(chat);
        }

        // If not exists, create new chat
        const chatData = {
            listingId,
            ownerId,
            buyerId: req.userId,
            categoryType
        };

        const createdChat = await Chat.create(chatData);

        const fullChat = await Chat.findOne({ _id: createdChat._id })
            .populate('ownerId', '-password')
            .populate('buyerId', '-password');

        res.status(200).json(fullChat);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a chat configuration
// @route   DELETE /api/chats/:id
// @access  Private
const deleteChat = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        
        const currentUserId = req.userId.toString();
        // Ensure user is part of the chat
        if (chat.ownerId?.toString() !== currentUserId && chat.buyerId?.toString() !== currentUserId) {
             return res.status(403).json({ message: 'Not authorized to delete this chat' });
        }

        await Chat.findByIdAndDelete(req.params.id);
        const Message = require('../models/Message');
        await Message.deleteMany({ chatId: req.params.id });

        res.status(200).json({ id: req.params.id, message: 'Chat deleted correctly' });
    } catch (error) {
         res.status(400).json({ message: error.message });
    }
};

module.exports = {
    fetchChats,
    accessChat,
    archiveChat,
    reportChat,
    deleteChat
};
