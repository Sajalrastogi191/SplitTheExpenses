const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for faster queries
friendSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('Friend', friendSchema);
