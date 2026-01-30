import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme, Chip, Divider } from 'react-native-paper';

export default function JourneyDetailScreen({ route }) {
    const journey = route.params?.journey;
    const theme = useTheme();

    if (!journey) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <Text>Journey not found</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
        >
            {/* Journey Stats */}
            <Card style={styles.statsCard}>
                <Card.Content>
                    <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                        {journey.name}
                    </Text>
                    <Text variant="bodySmall" style={{ opacity: 0.7, marginBottom: 12 }}>
                        📅 {journey.date}
                    </Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                                ₹{journey.totalAmount?.toFixed(2) || '0.00'}
                            </Text>
                            <Text variant="bodySmall">Total Spent</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                                {journey.expenseCount || 0}
                            </Text>
                            <Text variant="bodySmall">Expenses</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                                {journey.peopleCount || 0}
                            </Text>
                            <Text variant="bodySmall">People</Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            {/* Settlements Section */}
            {journey.settlements && journey.settlements.length > 0 && (
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        ⚖️ Settlements
                    </Text>
                    {journey.settlements.map((tx, index) => (
                        <Card key={index} style={styles.settlementCard}>
                            <Card.Content style={styles.settlementContent}>
                                <View style={styles.personContainer}>
                                    <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>{tx.from}</Text>
                                    <Text variant="bodySmall">pays</Text>
                                </View>
                                <View style={styles.amountContainer}>
                                    <Text variant="titleMedium" style={{ color: theme.colors.secondary, fontWeight: 'bold' }}>
                                        ₹{tx.amount.toFixed(2)}
                                    </Text>
                                    <Text variant="bodyLarge">→</Text>
                                </View>
                                <View style={styles.personContainer}>
                                    <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>{tx.to}</Text>
                                    <Text variant="bodySmall">receives</Text>
                                </View>
                            </Card.Content>
                        </Card>
                    ))}
                </View>
            )}

            {/* Expenses Section */}
            <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                    💰 Expenses ({journey.expenses?.length || 0})
                </Text>
                {journey.expenses && journey.expenses.length > 0 ? (
                    journey.expenses.map((expense, index) => (
                        <Card key={expense.id || `expense-${index}`} style={styles.expenseCard}>
                            <Card.Content>
                                <View style={styles.cardHeader}>
                                    <Text variant="titleMedium" style={styles.amount}>
                                        ₹{expense.amount.toFixed(2)}
                                    </Text>
                                    <Chip
                                        mode="flat"
                                        compact
                                        icon={expense.splitType === 'unequal' ? 'not-equal-variant' : 'equal'}
                                        style={{
                                            backgroundColor: expense.splitType === 'unequal'
                                                ? theme.colors.tertiaryContainer
                                                : theme.colors.primaryContainer
                                        }}
                                        textStyle={{
                                            color: expense.splitType === 'unequal'
                                                ? theme.colors.onTertiaryContainer
                                                : theme.colors.onPrimaryContainer
                                        }}
                                    >
                                        {expense.splitType === 'unequal' ? 'Unequal' : 'Equal'}
                                    </Chip>
                                </View>

                                {expense.description && (
                                    <Text variant="bodyLarge" style={styles.description}>
                                        {expense.description}
                                    </Text>
                                )}

                                <Text variant="bodyMedium" style={styles.payer}>
                                    💳 Paid by <Text style={styles.highlight}>{expense.payer}</Text>
                                </Text>

                                <View style={styles.beneficiariesRow}>
                                    <Text variant="bodySmall" style={styles.beneficiariesLabel}>
                                        👥 Split among:{' '}
                                    </Text>
                                    <Text variant="bodySmall" style={styles.beneficiariesText}>
                                        {expense.beneficiaries.join(', ')}
                                    </Text>
                                </View>

                                {expense.splitType === 'unequal' && expense.splits && (
                                    <View style={styles.splitsContainer}>
                                        <Divider style={styles.splitsDivider} />
                                        <Text variant="labelSmall" style={styles.splitsTitle}>Split Details:</Text>
                                        {Object.entries(expense.splits).map(([person, amt]) => (
                                            <Text key={person} variant="bodySmall" style={styles.splitItem}>
                                                {person}: ₹{parseFloat(amt).toFixed(2)}
                                            </Text>
                                        ))}
                                    </View>
                                )}

                                <Text variant="bodySmall" style={styles.date}>
                                    📅 {expense.date}
                                </Text>
                            </Card.Content>
                        </Card>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No expenses in this journey</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    statsCard: {
        marginBottom: 16,
        elevation: 3,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    statItem: {
        alignItems: 'center',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 12,
    },
    settlementCard: {
        marginBottom: 10,
        elevation: 2,
    },
    settlementContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    personContainer: {
        alignItems: 'center',
        flex: 1,
    },
    amountContainer: {
        alignItems: 'center',
        flex: 1,
    },
    expenseCard: {
        marginBottom: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    amount: {
        fontWeight: 'bold',
    },
    description: {
        fontWeight: '500',
        marginBottom: 8,
    },
    payer: {
        marginBottom: 4,
    },
    highlight: {
        fontWeight: 'bold',
    },
    beneficiariesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    beneficiariesLabel: {
        opacity: 0.7,
    },
    beneficiariesText: {
        opacity: 0.8,
    },
    splitsContainer: {
        marginTop: 8,
    },
    splitsDivider: {
        marginBottom: 8,
    },
    splitsTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    splitItem: {
        paddingLeft: 8,
        opacity: 0.8,
    },
    date: {
        marginTop: 8,
        opacity: 0.6,
    },
    emptyText: {
        textAlign: 'center',
        opacity: 0.5,
        paddingVertical: 20,
    },
});
