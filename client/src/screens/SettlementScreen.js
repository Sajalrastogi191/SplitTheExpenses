import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, useTheme, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getSettlement } from '../services/api';

export default function SettlementScreen() {
    const [settlements, setSettlements] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const theme = useTheme();

    const loadSettlement = async () => {
        try {
            const res = await getSettlement();
            setSettlements(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadSettlement().finally(() => setRefreshing(false));
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadSettlement();
        }, [])
    );

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>
                Settlement Plan
            </Text>

            {settlements.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text variant="bodyLarge">No debts to settle! 🎉</Text>
                </View>
            ) : (
                settlements.map((tx, index) => (
                    <Card key={index} style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <View style={styles.personContainer}>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{tx.from}</Text>
                                <Text variant="bodySmall">pays</Text>
                            </View>

                            <View style={styles.amountContainer}>
                                <Text variant="headlineSmall" style={{ color: theme.colors.secondary, fontWeight: 'bold' }}>
                                    ₹{tx.amount.toFixed(2)}
                                </Text>
                                <Text variant="bodyLarge">→</Text>
                            </View>

                            <View style={styles.personContainer}>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{tx.to}</Text>
                                <Text variant="bodySmall">receives</Text>
                            </View>
                        </Card.Content>
                    </Card>
                ))
            )}

            <Button mode="text" onPress={loadSettlement} style={{ marginTop: 20 }}>
                Refresh Calculation
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    title: {
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    card: {
        marginBottom: 12,
        elevation: 3,
    },
    cardContent: {
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
    emptyState: {
        alignItems: 'center',
        padding: 40,
        opacity: 0.7,
    }
});
