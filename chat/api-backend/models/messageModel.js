const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    senderId: {
        type: String,
        required: true
    },
    recipientId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    userId: { 
        type: String, 
        required: true 
    },
});

module.exports = mongoose.model('Message', messageSchema);
