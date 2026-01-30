function calculateSettlement(persons, expenses) {
    if (expenses.length === 0) {
        return [];
    }

    const balances = {};

    // Initialize balances for all persons
    persons.forEach(person => {
        balances[person] = 0;
    });

    // Calculate balances
    expenses.forEach(({ payer, amount, beneficiaries, splitType, splits }) => {
        // Handle cases where payer might not be in the initial list
        if (!balances.hasOwnProperty(payer)) balances[payer] = 0;

        // Payer gets credited the full amount
        balances[payer] += amount;

        // Handle split based on type
        if (splitType === 'unequal' && splits) {
            // Unequal split - use the custom split amounts
            beneficiaries.forEach(person => {
                if (!balances.hasOwnProperty(person)) balances[person] = 0;
                const personSplit = parseFloat(splits[person] || 0);
                balances[person] -= personSplit;
            });
        } else {
            // Equal split (default)
            const splitAmount = amount / beneficiaries.length;
            beneficiaries.forEach(person => {
                if (!balances.hasOwnProperty(person)) balances[person] = 0;
                balances[person] -= splitAmount;
            });
        }
    });

    // Separate creditors and debtors
    const creditors = [], debtors = [];
    for (const person in balances) {
        const balance = parseFloat(balances[person].toFixed(2));
        if (balance > 0) creditors.push({ person, amount: balance });
        else if (balance < 0) debtors.push({ person, amount: -balance });
    }

    // Sort creditors and debtors by amount (descending)
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    // Settle debts
    const transactions = [];
    while (creditors.length > 0 && debtors.length > 0) {
        const creditor = creditors[0];
        const debtor = debtors[0];

        let settleAmount = Math.min(creditor.amount, debtor.amount);
        settleAmount = parseFloat(settleAmount.toFixed(2));

        transactions.push({
            from: debtor.person,
            to: creditor.person,
            amount: settleAmount
        });

        creditor.amount -= settleAmount;
        debtor.amount -= settleAmount;

        // Remove settled people
        if (Math.abs(creditor.amount) < 0.01) creditors.shift();
        if (Math.abs(debtor.amount) < 0.01) debtors.shift();
    }

    return transactions;
}

module.exports = { calculateSettlement };

