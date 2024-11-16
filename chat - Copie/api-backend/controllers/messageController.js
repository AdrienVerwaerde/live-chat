const Message = require('../models/messageModel');

exports.createMessage = async (messageData) => {
    try {
        const message = new Message(messageData);
        await message.save();
        return message;
    } catch (err) {
        console.error('Error saving message:', err);
        throw err;
    }
};

exports.getMessages = async (filter = {}) => {
    try {
        return await Message.find(filter).sort({ date: -1 });
    } catch (err) {
        console.error('Error fetching messages:', err);
        throw err;
    }
};

