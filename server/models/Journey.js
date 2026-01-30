const mongoose = require('mongoose');

const journeySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    date: {
        type: String,
        default: () => new Date().toLocaleDateString()
    },
    timestamp: {
        type: Number,
        default: () => Date.now()
    },
    expenses: [{
        payer: String,
        amount: Number,
        description: String,
        beneficiaries: [String],
        splitType: String,
        splits: Object,
        date: String,
        timestamp: Number
    }],
    settlements: [{
        from: String,
        to: String,
        amount: Number
    }],
    totalAmount: {
        type: Number,
        default: 0
    },
    expenseCount: {
        type: Number,
        default: 0
    },
    peopleCount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Journey', journeySchema);
