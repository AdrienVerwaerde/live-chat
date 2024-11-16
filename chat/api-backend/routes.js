const express = require('express');
const router = express.Router();
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
router.get('/', (req, res) => {
  res.send('Welcome to the API');
});

router.use('/users', userRoutes);
router.use('/messages', messageRoutes);

module.exports = router;