const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: { 
    type: String, 
    default: 'hors ligne' 
  },
  lastActivity: { 
    type: Date, 
    default: null 
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;