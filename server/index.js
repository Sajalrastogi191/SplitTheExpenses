require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const { calculateSettlement } = require('./logic');

// Models
const User = require('./models/User');
const Friend = require('./models/Friend');
const Group = require('./models/Group');
const Expense = require('./models/Expense');
const Journey = require('./models/Journey');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Middleware to extract userId from headers
const getUserId = (req) => {
    return req.headers['x-user-id'] || 'default-user';
};

// ===== USER ROUTES =====
app.post('/api/user/init', async (req, res) => {
    try {
        const { oderId } = req.body;
        if (!oderId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        let user = await User.findOne({ oderId });
        if (!user) {
            user = await User.create({ oderId });
        }
        res.json({ userId: user.oderId, isNew: user.createdAt > Date.now() - 5000 });
    } catch (error) {
        console.error('User init error:', error);
        res.status(500).json({ error: 'Failed to initialize user' });
    }
});

// ===== PEOPLE ROUTES =====
app.get('/api/people', async (req, res) => {
    try {
        const userId = getUserId(req);
        const friends = await Friend.find({ userId });
        res.json(friends.map(f => f.name));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch people' });
    }
});

app.post('/api/people', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const existing = await Friend.findOne({ userId, name: name.trim() });
        if (existing) {
            return res.status(400).json({ error: 'Person already exists' });
        }

        const friend = await Friend.create({ userId, name: name.trim() });
        res.status(201).json({ message: 'Person added', person: friend.name });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add person' });
    }
});

// ===== FRIENDS ROUTES =====
app.get('/api/friends', async (req, res) => {
    try {
        const userId = getUserId(req);
        const friends = await Friend.find({ userId }).sort({ createdAt: -1 });
        res.json(friends.map(f => ({ id: f._id.toString(), name: f.name })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
});

app.post('/api/friends', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const existing = await Friend.findOne({
            userId,
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });
        if (existing) {
            return res.status(400).json({ error: 'Friend already exists' });
        }

        const friend = await Friend.create({ userId, name: name.trim() });
        res.status(201).json({ id: friend._id.toString(), name: friend.name });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add friend' });
    }
});

app.delete('/api/friends/:id', async (req, res) => {
    try {
        const userId = getUserId(req);
        const result = await Friend.findOneAndDelete({ _id: req.params.id, userId });
        if (!result) {
            return res.status(404).json({ error: 'Friend not found' });
        }
        res.json({ message: 'Friend deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete friend' });
    }
});

// ===== GROUPS ROUTES =====
app.get('/api/groups', async (req, res) => {
    try {
        const userId = getUserId(req);
        const groups = await Group.find({ userId }).sort({ createdAt: -1 });
        res.json(groups.map(g => ({
            id: g._id.toString(),
            name: g.name,
            members: g.members
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});

app.post('/api/groups', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { name, members } = req.body;
        if (!name) return res.status(400).json({ error: 'Group name is required' });
        if (!members || members.length === 0) {
            return res.status(400).json({ error: 'At least one member is required' });
        }

        const existing = await Group.findOne({
            userId,
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });
        if (existing) {
            return res.status(400).json({ error: 'Group already exists' });
        }

        const group = await Group.create({ userId, name: name.trim(), members });
        res.status(201).json({ id: group._id.toString(), name: group.name, members: group.members });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create group' });
    }
});

app.delete('/api/groups/:id', async (req, res) => {
    try {
        const userId = getUserId(req);
        const result = await Group.findOneAndDelete({ _id: req.params.id, userId });
        if (!result) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.json({ message: 'Group deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete group' });
    }
});

// ===== EXPENSES ROUTES =====
app.get('/api/expenses', async (req, res) => {
    try {
        const userId = getUserId(req);
        const expenses = await Expense.find({ userId }).sort({ timestamp: -1 });
        res.json(expenses.map(e => ({
            id: e._id.toString(),
            payer: e.payer,
            amount: e.amount,
            description: e.description,
            beneficiaries: e.beneficiaries,
            splitType: e.splitType,
            splits: e.splits ? Object.fromEntries(e.splits) : null,
            date: e.date,
            timestamp: e.timestamp
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

app.post('/api/expenses', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { payer, amount, beneficiaries, description, splitType, splits } = req.body;

        if (!payer || !amount || !beneficiaries || beneficiaries.length === 0) {
            return res.status(400).json({ error: 'Invalid expense data' });
        }

        // Validate unequal splits if provided
        if (splitType === 'unequal' && splits) {
            const totalSplits = Object.values(splits).reduce((sum, val) => sum + parseFloat(val || 0), 0);
            if (Math.abs(totalSplits - parseFloat(amount)) > 0.01) {
                return res.status(400).json({ error: 'Split amounts must equal total expense amount' });
            }
        }

        const expense = await Expense.create({
            userId,
            payer,
            amount: parseFloat(amount),
            description: description || '',
            beneficiaries,
            splitType: splitType || 'equal',
            splits: splits || null
        });

        res.status(201).json({
            id: expense._id.toString(),
            payer: expense.payer,
            amount: expense.amount,
            description: expense.description,
            beneficiaries: expense.beneficiaries,
            splitType: expense.splitType,
            splits: expense.splits ? Object.fromEntries(expense.splits) : null,
            date: expense.date,
            timestamp: expense.timestamp
        });
    } catch (error) {
        console.error('Add expense error:', error);
        res.status(500).json({ error: 'Failed to add expense' });
    }
});

// ===== ACTIVITY ROUTE =====
app.get('/api/activity', async (req, res) => {
    try {
        const userId = getUserId(req);
        const expenses = await Expense.find({ userId }).sort({ timestamp: -1 });
        res.json(expenses.map(e => ({
            id: e._id.toString(),
            payer: e.payer,
            amount: e.amount,
            description: e.description,
            beneficiaries: e.beneficiaries,
            splitType: e.splitType,
            splits: e.splits ? Object.fromEntries(e.splits) : null,
            date: e.date,
            timestamp: e.timestamp
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

// ===== SETTLEMENT ROUTE =====
app.get('/api/settlement', async (req, res) => {
    try {
        const userId = getUserId(req);
        const friends = await Friend.find({ userId });
        const expenses = await Expense.find({ userId });

        const persons = friends.map(f => f.name);
        const expenseData = expenses.map(e => ({
            payer: e.payer,
            amount: e.amount,
            beneficiaries: e.beneficiaries,
            splitType: e.splitType,
            splits: e.splits ? Object.fromEntries(e.splits) : null
        }));

        const result = calculateSettlement(persons, expenseData);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to calculate settlement' });
    }
});

// ===== JOURNEYS ROUTES =====
app.get('/api/journeys', async (req, res) => {
    try {
        const userId = getUserId(req);
        const journeys = await Journey.find({ userId }).sort({ timestamp: -1 });
        res.json(journeys.map(j => ({
            id: j._id.toString(),
            name: j.name,
            date: j.date,
            timestamp: j.timestamp,
            expenses: j.expenses,
            settlements: j.settlements,
            totalAmount: j.totalAmount,
            expenseCount: j.expenseCount,
            peopleCount: j.peopleCount
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch journeys' });
    }
});

app.post('/api/journeys/archive', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Journey name is required' });

        // Get current data
        const friends = await Friend.find({ userId });
        const expenses = await Expense.find({ userId });

        const persons = friends.map(f => f.name);
        const expenseData = expenses.map(e => ({
            id: e._id.toString(),
            payer: e.payer,
            amount: e.amount,
            description: e.description,
            beneficiaries: e.beneficiaries,
            splitType: e.splitType,
            splits: e.splits ? Object.fromEntries(e.splits) : null,
            date: e.date,
            timestamp: e.timestamp
        }));

        // Calculate settlements
        const settlements = calculateSettlement(persons, expenseData);

        // Create journey archive
        const journey = await Journey.create({
            userId,
            name: name.trim(),
            expenses: expenseData,
            settlements,
            totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
            expenseCount: expenses.length,
            peopleCount: persons.length
        });

        // Delete only expenses (keep friends and groups)
        await Expense.deleteMany({ userId });

        res.status(201).json({
            id: journey._id.toString(),
            name: journey.name,
            date: journey.date,
            timestamp: journey.timestamp,
            expenses: journey.expenses,
            settlements: journey.settlements,
            totalAmount: journey.totalAmount,
            expenseCount: journey.expenseCount,
            peopleCount: journey.peopleCount
        });
    } catch (error) {
        console.error('Archive journey error:', error);
        res.status(500).json({ error: 'Failed to archive journey' });
    }
});

// ===== RESET ROUTE =====
app.post('/api/reset', async (req, res) => {
    try {
        const userId = getUserId(req);
        await Expense.deleteMany({ userId });
        res.json({ message: 'Data reset' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset data' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
