const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    payer: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    beneficiaries: [{
        type: String,
        required: true
    }],
    splitType: {
        type: String,
        enum: ['equal', 'unequal'],
        default: 'equal'
    },
    splits: {
        type: Map,
        of: Number,
        default: null
    },
    date: {
        type: String,
        default: () => new Date().toLocaleDateString()
    },
    timestamp: {
        type: Number,
        default: () => Date.now()
    }
});

module.exports = mongoose.model('Expense', expenseSchema);
