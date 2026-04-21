const Message = require('../models/Message');
const Chat = require('../models/Chat');

// @desc    Get all messages for a chat
// @route   GET /api/messages/:chatId
// @access  Private
const allMessages = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        
        if (chat.ownerId.toString() !== req.userId && chat.buyerId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Unauthorized to view these messages' });
        }

        const messages = await Message.find({ chatId: req.params.chatId })
            .populate('senderId', 'name avatar email');
        
        res.json(messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    const { chatId, type, content, offerData } = req.body;

    if (!chatId || !type) {
        return res.status(400).json({ message: 'Invalid data passed into request' });
    }

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        
        if (chat.ownerId.toString() !== req.userId && chat.buyerId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Unauthorized to send messages to this chat' });
        }

        const newMessage = {
            senderId: req.userId,
            chatId: chatId,
            type: type,
            content: content,
            offerData: offerData || null,
            isSpamExpected: req.body.isSpamExpected || false
        };

        let message = await Message.create(newMessage);

        message = await message.populate('senderId', 'name avatar');

        // Update latest message in chat
        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

        res.json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update offer status
// @route   PUT /api/messages/:id/offer
// @access  Private
const updateOfferStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const message = await Message.findById(req.params.id);
        if (!message || message.type !== 'OFFER' && message.type !== 'COUNTER_OFFER') {
            return res.status(404).json({ message: 'Offer message not found' });
        }

        message.offerData.status = status;
        await message.save();

        res.json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const message = await Message.findById(req.params.id);
        
        if (!message) return res.status(404).json({ message: 'Message not found' });
        if (message.senderId.toString() !== req.userId && message.senderId._id?.toString() !== req.userId) {
            return res.status(401).json({ message: 'Not authorized to edit this message' });
        }

        message.content = content;
        await message.save();
        
        const updatedMessage = await Message.findById(message._id).populate('senderId', 'name avatar email');
        res.status(200).json(updatedMessage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        
        if (!message) return res.status(404).json({ message: 'Message not found' });
        if (message.senderId.toString() !== req.userId && message.senderId._id?.toString() !== req.userId) {
            return res.status(401).json({ message: 'Not authorized to delete this message' });
        }

        await message.deleteOne();
        res.status(200).json({ id: req.params.id, message: 'Message deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    allMessages,
    sendMessage,
    updateOfferStatus,
    updateMessage,
    deleteMessage
};
