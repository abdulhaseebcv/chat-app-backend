// Import required modules and libraries
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectToMongoDB = require('./dbConnection')
const dotenv = require('dotenv');
const Message = require('./models/messageModel');

// Middleware setup
app.use(cors());

// Load environment variables
dotenv.config(); 

// Create an HTTP server
const server = http.createServer(app);

// Establish MongoDB connection
connectToMongoDB(); 

// Set up Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "https://chat-app-b8oh.onrender.com",
    methods: ["GET", "POST"],
  },
});

// Event handling when a user connects to the socket
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Event handling when a user joins a specific room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User with ID: ${socket.id} joined room: ${roomId}`);

    // Retrieve previous messages from MongoDB for the joined room
    Message.find({ room: roomId })
      .then((previousMessages) => {
        // Emit the "previous_messages" event to the user who joined
        socket.emit("previous_messages", previousMessages);
      })
      .catch((error) => {
        console.log('Error fetching previous messages from MongoDB:', error);
      });
  });

  // Event handling when a user sends a message
  socket.on("send_message", (data) => {
    const { room, author, message, time } = data;

    // Save the message to MongoDB
    Message.create({
      room,
      author,
      message,
      time
    })
    .then(() => console.log('Data Added'))
    .catch((error) => console.log('Error saving message to MongoDB:', error));

    // Broadcast the message to all clients in the room
    socket.to(room).emit("receive_message", data);
  });

  // Event handling when a user disconnects
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Start the server on port 3001
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});
