const Message = require('../models/messageModel');

const createMessage = async (messageData) => {
    try {
        const message = new Message(messageData);
        await message.save();
        return message;
    } catch (err) {
        console.error('Error saving message:', err);
        throw err;
    }
};

const getMessages = async () => {
    try {
        console.log('Fetching messages from database...');
        const messages = await Message.find().sort({ createdAt: 1 });
        console.log('Messages fetched successfully:', messages);
        return messages;
    } catch (err) {
        console.error('Error fetching messages:', err);
        throw err;
    }
};

module.exports = {
    createMessage,
    getMessages,
};
