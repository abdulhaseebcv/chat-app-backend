const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectToMongoDB = () => {
    const mongoURI = process.env.MONGO_URI;
    return mongoose.connect(mongoURI)
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch((error) => {
            console.log('Error in MongoDB connection:', error);
        });
};

module.exports = connectToMongoDB;
