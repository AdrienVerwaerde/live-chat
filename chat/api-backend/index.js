const express = require('express');
const app = express();
const port = 4001;
require('dotenv').config();
const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const messageController = require('./controllers/messageController');
const socketIo = require('socket.io');
const cors = require('cors');
const http = require('http');
const messageTimestamps = {};
const MAX_MESSAGES = 10;
const TIME_INTERVAL = 10000;

app.use(express.json());
app.use(cors());

// Socket IO CONFIG
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
})

let socketsConnected = new Set();
let users = {};

io.on('connection', (socket) => {
  console.log(`New user connected : ${socket.id}`)
  socketsConnected.add(socket.id);

  socket.on('setUsername', (username) => {
    users[socket.id] = username;
    console.log("Liste d'utilisateurs : ", users);
    io.emit('updateUserList', users);
  })

  socket.on('message', async (message) => {
    const currentTime = Date.now();
    
    if (!messageTimestamps[socket.id]) {
        messageTimestamps[socket.id] = [];
    }

    messageTimestamps[socket.id] = messageTimestamps[socket.id].filter(
        (timestamp) => currentTime - timestamp < TIME_INTERVAL
    );

    if (messageTimestamps[socket.id].length >= MAX_MESSAGES) {
        socket.emit('error', {
            message: `You can only send up to ${MAX_MESSAGES} messages every 10 seconds. Please wait.`,
        });
        return;
    }

    messageTimestamps[socket.id].push(currentTime);

    // Ajoutez `userId` basé sur `socket.id` ou un autre identifiant
    const newMessage = {
        ...message,
        userId: message.userId || socket.id, // Ajoutez un identifiant utilisateur stable
    };

    console.log("Message : ", newMessage);

    try {
        await messageController.createMessage(newMessage); // Enregistrez avec `userId`
    } catch (err) {
        console.error('Failed to save message:', err);
    }

    if (newMessage.recipientId === 'All') {
        io.emit('message', newMessage);
    } else {
        io.to(newMessage.recipientId).emit('privateMessage', newMessage);
        socket.emit('privateMessage', newMessage);
    }
});

socket.on('privateMessage', async ({ recipientId, message }) => {
  const privateMessage = {
      text: message,
      author: users[socket.id],
      date: new Date().toLocaleString(),
      senderId: socket.id,
      recipientId: recipientId,
  };
  const newPrivateMessage = new message(privateMessage);
  try {
      await newPrivateMessage.save();
      console.log('Message privé enregistré avec succès');
  } catch (err) {
      console.error('Erreur lors de l\'enregistrement du message privé:', err);
  }

  io.to(recipientId).emit('privateMessage', privateMessage);
  socket.emit('privateMessage', privateMessage);
});

  socket.on('typing', ({ recipientId, feedback }) => {
    if (recipientId === 'All') {
      socket.broadcast.emit('typing', { recipientId: 'All', feedback });
    } else {
      // Envoyer uniquement au destinataire
      socket.to(recipientId).emit('typing', { recipientId, feedback });
    }
  });

  socket.on('stopTyping', (recipientId) => {
    if (recipientId === 'All') {
      socket.broadcast.emit('typing', { recipientId, feedback: '' });
    } else {
      socket.to(recipientId).emit('typing', { recipientId, feedback: '' });
    }
  });

  io.emit('clientsTotal', socketsConnected.size);

  socket.on('disconnect', () => {
    console.log(`Client disconnected : ${socket.id}`)
    socketsConnected.delete(socket.id);
    delete users[socket.id];
    io.emit('updateUserList', users);
    io.emit('clientsTotal', socketsConnected.size);
  });

});

// ROUTES CONFIG
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// SWAGGER INIT CONFIG
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'NodeJS B3',
      version: '1.0',
      description: 'Une API de fou malade',
      contact: {
        name: 'Chris'
      },
      servers: [
        {
          url: 'http://localhost:4001'
        },
      ],
    },
  },
  apis: [
    `${__dirname}/routes.js`,
    `${__dirname}/routes/*.js`,
    `${__dirname}/models/*.js`,
    `${__dirname}/controllers/*.js`,
  ],
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connect to the database
mongoose.connect(mongoURI, {})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log(`MongoDB connection error: ${err}`))

app.get('/', (req, res) => {
  res.send("Hello, bienvue sur le serveur");
})

// Server.listen a la place de app.listen
server.listen(port, () => {
  console.log("Serveur en ligne port 4001");
})