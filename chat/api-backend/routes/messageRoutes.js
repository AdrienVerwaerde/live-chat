/**
 * @swagger
 * /:
 *   get:
 *     summary: Retrieve all messages
 *     description: Fetches a list of all messages from the server.
 *     tags:
 *       - Messages
 *     responses:
 *       200:
 *         description: A list of messages.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "12345"
 *                   text:
 *                     type: string
 *                     example: "Hello, world!"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-11-14T12:34:56Z"
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch messages"
 */

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.get('/', async (req, res) => {
    try {
        const messages = await messageController.getMessages();
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

module.exports = router;
