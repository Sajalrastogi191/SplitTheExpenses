import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, useTheme, IconButton, Portal, Dialog, TextInput, Modal, List, Divider, TouchableRipple } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getExpenses, getPeople, getGroups, archiveJourney } from '../services/api';
import { useThemeContext } from '../context/ThemeContext';

export default function HomeScreen({ navigation }) {
    const theme = useTheme();
    const { toggleTheme, isDark } = useThemeContext();
    const [stats, setStats] = useState({
        totalAmount: 0,
        totalExpenses: 0,
        avgExpense: 0,
        peopleCount: 0
    });
    const [refreshing, setRefreshing] = useState(false);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [journeyDialogVisible, setJourneyDialogVisible] = useState(false);
    const [journeyName, setJourneyName] = useState('');
    const [saving, setSaving] = useState(false);
    const [groupDropdownVisible, setGroupDropdownVisible] = useState(false);

    const loadData = async () => {
        try {
            const [expensesRes, peopleRes, groupsRes] = await Promise.all([
                getExpenses(),
                getPeople(),
                getGroups()
            ]);

            const expenses = expensesRes.data;
            const people = peopleRes.data;
            const groupsData = groupsRes.data;

            const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            const totalExpenses = expenses.length;
            const avgExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

            setStats({
                totalAmount,
                totalExpenses,
                avgExpense,
                peopleCount: people.length
            });

            setGroups(groupsData);
            // Auto-select first group if none selected and groups exist
            setSelectedGroup(prev => {
                if (!prev && groupsData.length > 0) {
                    return groupsData[0];
                }
                // Keep current selection if it still exists in the updated groups
                if (prev && groupsData.length > 0) {
                    const stillExists = groupsData.find(g => g.id === prev.id);
                    return stillExists || groupsData[0];
                }
                return prev;
            });
        } catch (error) {
            console.error(error);
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

    const handleSaveJourney = async () => {
        if (!journeyName.trim()) {
            Alert.alert('Error', 'Please enter a journey name');
            return;
        }
        if (stats.totalExpenses === 0) {
            Alert.alert('Error', 'No expenses to save. Add some expenses first!');
            return;
        }

        setSaving(true);
        try {
            await archiveJourney(journeyName.trim());
            setJourneyDialogVisible(false);
            setJourneyName('');
            setSelectedGroup(null);
            await loadData();
            Alert.alert('Success', `Journey "${journeyName.trim()}" saved! Starting fresh.`);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to save journey');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Save & Start New Journey Button */}
                <Button
                    mode="contained-tonal"
                    onPress={() => setJourneyDialogVisible(true)}
                    icon="content-save-move"
                    style={styles.saveJourneyButton}
                    disabled={stats.totalExpenses === 0}
                >
                    Save & Start New Journey
                </Button>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                            ₹{stats.totalAmount.toFixed(2)}
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>Total Spent</Text>
                    </Card.Content>
                </Card>

                <View style={styles.row}>
                    <Card style={[styles.card, styles.halfCard]}>
                        <Card.Content>
                            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                                {stats.totalExpenses}
                            </Text>
                            <Text variant="bodySmall">Expenses</Text>
                        </Card.Content>
                    </Card>
                    <Card style={[styles.card, styles.halfCard]}>
                        <Card.Content>
                            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                                {selectedGroup?.members?.length || 0}
                            </Text>
                            <Text variant="bodySmall">Members</Text>
                        </Card.Content>
                    </Card>
                </View>

                <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>

                {/* Group Selector Dropdown */}
                {groups.length > 0 && (
                    <View style={styles.groupSelectorContainer}>
                        <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Select Group for Expense:</Text>
                        <TouchableRipple
                            onPress={() => setGroupDropdownVisible(true)}
                            style={[styles.groupSelector, { borderColor: theme.colors.outline }]}
                        >
                            <View style={styles.groupSelectorContent}>
                                <List.Icon icon="account-group" style={{ margin: 0 }} />
                                <Text style={{ flex: 1, marginLeft: 8, color: selectedGroup ? theme.colors.onSurface : theme.colors.onSurfaceDisabled }}>
                                    {selectedGroup?.name || "Select Group"}
                                </Text>
                                <List.Icon icon="chevron-down" style={{ margin: 0 }} />
                            </View>
                        </TouchableRipple>
                        {selectedGroup && (
                            <Text variant="bodySmall" style={{ marginTop: 8, opacity: 0.7 }}>
                                {selectedGroup.members.length} members: {selectedGroup.members.join(', ')}
                            </Text>
                        )}
                    </View>
                )}

                <View style={styles.buttonGrid}>
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('AddExpense', {
                            selectedGroup: selectedGroup
                        })}
                        style={styles.button}
                        icon="cash-plus"
                        contentStyle={styles.buttonContent}
                        disabled={groups.length > 0 && !selectedGroup}
                    >
                        Add Expense
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={() => navigation.navigate('Expenses')}
                        style={styles.button}
                        icon="format-list-bulleted"
                    >
                        View Expenses
                    </Button>
                    <Button
                        mode="contained-tonal"
                        onPress={() => navigation.navigate('Settlement')}
                        style={styles.button}
                        icon="scale-balance"
                    >
                        Settlement
                    </Button>
                </View>

                <Card style={[styles.card, { marginTop: 16 }]}>
                    <Card.Content>
                        <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                            💡 Tip
                        </Text>
                        <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                            Use the Groups tab to add friends and create expense groups.
                            Check the Activity tab to see your expense history.
                        </Text>
                    </Card.Content>
                </Card>
            </ScrollView>

            {/* Save Journey Dialog */}
            <Portal>
                <Dialog visible={journeyDialogVisible} onDismiss={() => setJourneyDialogVisible(false)}>
                    <Dialog.Title>Save Journey</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
                            Give your journey a name to save all expenses and settlements.
                            This will reset the app for a new journey.
                        </Text>
                        <TextInput
                            label="Journey Name"
                            value={journeyName}
                            onChangeText={setJourneyName}
                            mode="outlined"
                            placeholder="e.g., Goa Trip, Office Lunch"
                            autoFocus
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setJourneyDialogVisible(false)}>Cancel</Button>
                        <Button onPress={handleSaveJourney} loading={saving} disabled={saving}>
                            Save & Reset
                        </Button>
                    </Dialog.Actions>
                </Dialog>

                {/* Group Selection Modal */}
                <Modal
                    visible={groupDropdownVisible}
                    onDismiss={() => setGroupDropdownVisible(false)}
                    contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
                >
                    <Text variant="titleMedium" style={styles.modalTitle}>Select Group</Text>
                    <Divider />
                    <ScrollView style={styles.modalScrollView}>
                        {groups.map(group => (
                            <List.Item
                                key={group.id}
                                title={group.name}
                                description={`${group.members.length} members`}
                                onPress={() => {
                                    setSelectedGroup(group);
                                    setGroupDropdownVisible(false);
                                }}
                                left={props => <List.Icon {...props} icon={selectedGroup?.id === group.id ? "radiobox-marked" : "radiobox-blank"} />}
                                style={selectedGroup?.id === group.id ? { backgroundColor: theme.colors.primaryContainer } : undefined}
                            />
                        ))}
                    </ScrollView>
                    <Divider />
                    <Button onPress={() => setGroupDropdownVisible(false)} style={styles.modalCloseButton}>
                        Cancel
                    </Button>
                </Modal>
            </Portal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
        elevation: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    halfCard: {
        width: '48%',
    },
    sectionTitle: {
        marginBottom: 12,
        fontWeight: 'bold',
    },
    buttonGrid: {
        gap: 12,
    },
    button: {
        marginBottom: 8,
        borderRadius: 8,
    },
    buttonContent: {
        paddingVertical: 4,
    },
    groupSelectorContainer: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 8,
    },
    groupSelector: {
        borderWidth: 1,
        borderRadius: 4,
        padding: 12,
    },
    groupSelectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    saveJourneyButton: {
        marginBottom: 16,
        borderRadius: 8,
    },
    modalContainer: {
        margin: 20,
        borderRadius: 12,
        maxHeight: '70%',
    },
    modalTitle: {
        padding: 16,
        fontWeight: 'bold',
    },
    modalScrollView: {
        maxHeight: 300,
    },
    modalCloseButton: {
        marginVertical: 8,
    }
});

