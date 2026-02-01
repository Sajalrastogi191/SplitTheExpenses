import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, useTheme, IconButton, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getActivity, getJourneys, deleteJourney } from '../services/api';
import { useThemeContext } from '../context/ThemeContext';

export default function ActivityScreen({ navigation }) {
    const theme = useTheme();
    const { toggleTheme, isDark } = useThemeContext();
    const [activities, setActivities] = useState([]);
    const [journeys, setJourneys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const [activityRes, journeysRes] = await Promise.all([
                getActivity(),
                getJourneys()
            ]);
            setActivities(activityRes.data);
            setJourneys(journeysRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData().finally(() => setRefreshing(false));
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <IconButton
                    icon={isDark ? 'weather-sunny' : 'weather-night'}
                    iconColor="#fff"
                    onPress={toggleTheme}
                />
            ),
        });
    }, [navigation, isDark]);

    const handleDeleteJourney = (journey) => {
        Alert.alert(
            'Delete Journey',
            `Are you sure you want to delete "${journey.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteJourney(journey.id);
                            loadData(); // Refresh the list
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete journey');
                        }
                    }
                }
            ]
        );
    };

    // Group activities by date
    const groupedActivities = activities.reduce((groups, activity) => {
        const date = activity.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(activity);
        return groups;
    }, {});

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Past Journeys Section */}
            {journeys.length > 0 && (
                <View style={styles.journeysSection}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        📚 Past Journeys
                    </Text>
                    {journeys.map((journey) => (
                        <Card key={journey.id} style={styles.journeyCard}>
                            <Card.Content>
                                <View style={styles.journeyHeader}>
                                    <TouchableOpacity
                                        style={{ flex: 1 }}
                                        onPress={() => navigation.navigate('JourneyDetail', { journey })}
                                        activeOpacity={0.7}
                                    >
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                            {journey.name}
                                        </Text>
                                    </TouchableOpacity>
                                    <Chip compact mode="flat" style={{ backgroundColor: theme.colors.primaryContainer }}>
                                        ₹{journey.totalAmount?.toFixed(0) || 0}
                                    </Chip>
                                    <IconButton
                                        icon="delete-outline"
                                        iconColor={theme.colors.error}
                                        size={20}
                                        onPress={() => handleDeleteJourney(journey)}
                                        style={{ margin: 0, marginLeft: 4 }}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('JourneyDetail', { journey })}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.journeyMeta}>
                                        <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                                            📅 {journey.date}
                                        </Text>
                                        <Text variant="bodySmall" style={{ opacity: 0.7, marginLeft: 16 }}>
                                            {journey.expenseCount || 0} expenses • {journey.peopleCount || 0} people
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </Card.Content>
                        </Card>
                    ))}
                    <Divider style={{ marginVertical: 16 }} />
                </View>
            )}

            {/* Current Activity Section */}
            {activities.length === 0 && journeys.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>No Activity Yet</Text>
                    <Text style={styles.emptyText}>
                        Start adding expenses to see your activity history here.
                    </Text>
                </View>
            ) : activities.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>No Current Expenses</Text>
                    <Text style={styles.emptyText}>
                        Start a new journey by adding expenses!
                    </Text>
                </View>
            ) : (
                Object.entries(groupedActivities).map(([date, dateActivities]) => (
                    <View key={date} style={styles.dateGroup}>
                        <Text variant="titleSmall" style={[styles.dateHeader, { color: theme.colors.primary }]}>
                            📅 {date}
                        </Text>
                        {dateActivities.map((activity) => (
                            <Card key={activity.id} style={styles.activityCard}>
                                <Card.Content>
                                    <View style={styles.cardHeader}>
                                        <Text variant="titleMedium" style={styles.amount}>
                                            ₹{activity.amount.toFixed(2)}
                                        </Text>
                                        <Chip
                                            mode="flat"
                                            compact
                                            icon={activity.splitType === 'unequal' ? 'not-equal-variant' : 'equal'}
                                            style={[
                                                styles.splitChip,
                                                {
                                                    backgroundColor: activity.splitType === 'unequal'
                                                        ? theme.colors.tertiaryContainer
                                                        : theme.colors.primaryContainer
                                                }
                                            ]}
                                            textStyle={{
                                                color: activity.splitType === 'unequal'
                                                    ? theme.colors.onTertiaryContainer
                                                    : theme.colors.onPrimaryContainer
                                            }}
                                        >
                                            {activity.splitType === 'unequal' ? 'Unequal' : 'Equal'}
                                        </Chip>
                                    </View>

                                    {activity.description && (
                                        <Text variant="bodyLarge" style={styles.description}>
                                            {activity.description}
                                        </Text>
                                    )}

                                    <Text variant="bodyMedium" style={styles.payer}>
                                        💳 Paid by <Text style={styles.highlight}>{activity.payer}</Text>
                                    </Text>

                                    <View style={styles.beneficiariesRow}>
                                        <Text variant="bodySmall" style={styles.beneficiariesLabel}>
                                            👥 Split among:
                                        </Text>
                                        <Text variant="bodySmall" style={styles.beneficiariesText}>
                                            {activity.beneficiaries.join(', ')}
                                        </Text>
                                    </View>

                                    {activity.splitType === 'unequal' && activity.splits && (
                                        <View style={styles.splitsContainer}>
                                            <Divider style={styles.splitsDivider} />
                                            <Text variant="labelSmall" style={styles.splitsTitle}>Split Details:</Text>
                                            {Object.entries(activity.splits).map(([person, amt]) => (
                                                <Text key={person} variant="bodySmall" style={styles.splitItem}>
                                                    {person}: ₹{parseFloat(amt).toFixed(2)}
                                                </Text>
                                            ))}
                                        </View>
                                    )}
                                </Card.Content>
                            </Card>
                        ))}
                    </View>
                ))
            )}
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
    dateGroup: {
        marginBottom: 20,
    },
    dateHeader: {
        fontWeight: 'bold',
        marginBottom: 10,
        paddingLeft: 4,
    },
    activityCard: {
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
    journeysSection: {
        marginBottom: 8,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 12,
    },
    journeyCard: {
        marginBottom: 10,
        elevation: 3,
    },
    journeyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    journeyMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
});
