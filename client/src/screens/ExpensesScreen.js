import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, useTheme, Chip, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getExpenses } from '../services/api';

export default function ExpensesScreen() {
    const [expenses, setExpenses] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const theme = useTheme();

    const loadExpenses = async () => {
        try {
            const res = await getExpenses();
            setExpenses(res.data.reverse()); // Show newest first
        } catch (error) {
            console.error(error);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadExpenses().finally(() => setRefreshing(false));
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadExpenses();
        }, [])
    );

    const renderItem = ({ item }) => (
        <Card style={styles.expenseCard}>
            <Card.Content>
                <View style={styles.cardHeader}>
                    <Text variant="titleMedium" style={styles.amount}>
                        ₹{item.amount.toFixed(2)}
                    </Text>
                    <Chip
                        mode="flat"
                        compact
                        icon={item.splitType === 'unequal' ? 'not-equal-variant' : 'equal'}
                        style={[
                            styles.splitChip,
                            {
                                backgroundColor: item.splitType === 'unequal'
                                    ? theme.colors.tertiaryContainer
                                    : theme.colors.primaryContainer
                            }
                        ]}
                        textStyle={{
                            color: item.splitType === 'unequal'
                                ? theme.colors.onTertiaryContainer
                                : theme.colors.onPrimaryContainer
                        }}
                    >
                        {item.splitType === 'unequal' ? 'Unequal' : 'Equal'}
                    </Chip>
                </View>

                {item.description && (
                    <Text variant="bodyLarge" style={styles.description}>
                        {item.description}
                    </Text>
                )}

                <Text variant="bodyMedium" style={styles.payer}>
                    💳 Paid by <Text style={styles.highlight}>{item.payer}</Text>
                </Text>

                <View style={styles.beneficiariesRow}>
                    <Text variant="bodySmall" style={styles.beneficiariesLabel}>
                        👥 Split among:{' '}
                    </Text>
                    <Text variant="bodySmall" style={styles.beneficiariesText}>
                        {item.beneficiaries.join(', ')}
                    </Text>
                </View>

                {item.splitType === 'unequal' && item.splits && (
                    <View style={styles.splitsContainer}>
                        <Divider style={styles.splitsDivider} />
                        <Text variant="labelSmall" style={styles.splitsTitle}>Split Details:</Text>
                        {Object.entries(item.splits).map(([person, amt]) => (
                            <Text key={person} variant="bodySmall" style={styles.splitItem}>
                                {person}: ₹{parseFloat(amt).toFixed(2)}
                            </Text>
                        ))}
                    </View>
                )}

                <Text variant="bodySmall" style={styles.date}>
                    📅 {item.date}
                </Text>
            </Card.Content>
        </Card>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={expenses}
                renderItem={renderItem}
                keyExtractor={item => item.id || Math.random().toString()}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>No Expenses Yet</Text>
                        <Text style={styles.emptyText}>
                            Start adding expenses to see them here.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 16,
        paddingBottom: 32,
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
    splitChip: {
        // no fixed height - let it size naturally
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
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        opacity: 0.7,
    },
    emptyText: {
        opacity: 0.5,
        textAlign: 'center',
    },
});
