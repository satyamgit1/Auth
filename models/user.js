const mongoose = require('mongoose');
require('dotenv').config();

const mongoDBUri = process.env.MONGODB_URI;

mongoose.connect(mongoDBUri)
 .then(() => console.log('MongoDB connected successfully'))
 .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    age: Number
});

module.exports = mongoose.model('User', userSchema);