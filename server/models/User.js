const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    oderId: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
