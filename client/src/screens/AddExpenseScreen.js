import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, useTheme, Text, Checkbox, ActivityIndicator, SegmentedButtons, Divider, Card, Portal, Modal, List, TouchableRipple } from 'react-native-paper';
import { getPeople, addExpense } from '../services/api';

export default function AddExpenseScreen({ navigation, route }) {
    const selectedGroup = route.params?.selectedGroup;

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [people, setPeople] = useState([]);
    const [payer, setPayer] = useState('');
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingPeople, setLoadingPeople] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
    const [splitType, setSplitType] = useState('equal');
    const [splits, setSplits] = useState({});

    const theme = useTheme();

    useEffect(() => {
        loadPeople();
    }, []);

    const loadPeople = async () => {
        try {
            const res = await getPeople();
            let availablePeople = res.data;

            // Filter by selected group if one is provided
            if (selectedGroup && selectedGroup.members) {
                availablePeople = selectedGroup.members;
            }

            setPeople(availablePeople);
            setBeneficiaries(availablePeople); // Select all by default
            // Initialize splits for all people
            const initialSplits = {};
            availablePeople.forEach(person => {
                initialSplits[person] = '';
            });
            setSplits(initialSplits);
        } catch (error) {
            Alert.alert('Error', 'Failed to load people');
        } finally {
            setLoadingPeople(false);
        }
    };

    const toggleBeneficiary = (person) => {
        if (beneficiaries.includes(person)) {
            setBeneficiaries(beneficiaries.filter(p => p !== person));
        } else {
            setBeneficiaries([...beneficiaries, person]);
        }
    };

    const updateSplit = (person, value) => {
        setSplits(prev => ({
            ...prev,
            [person]: value
        }));
    };

    const calculateEqualSplit = () => {
        if (beneficiaries.length === 0 || !amount) return 0;
        return parseFloat(amount) / beneficiaries.length;
    };

    const getTotalSplits = () => {
        return beneficiaries.reduce((sum, person) => {
            return sum + parseFloat(splits[person] || 0);
        }, 0);
    };

    const handleSubmit = async () => {
        if (!payer) {
            Alert.alert('Error', 'Please select a payer');
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }
        if (beneficiaries.length === 0) {
            Alert.alert('Error', 'Please select at least one beneficiary');
            return;
        }

        // Validate unequal splits
        if (splitType === 'unequal') {
            const totalSplits = getTotalSplits();
            if (Math.abs(totalSplits - parseFloat(amount)) > 0.01) {
                Alert.alert('Error', `Split amounts (₹${totalSplits.toFixed(2)}) must equal total amount (₹${parseFloat(amount).toFixed(2)})`);
                return;
            }
        }

        setLoading(true);
        try {
            const expenseData = {
                payer,
                amount: parseFloat(amount),
                description: description.trim(),
                beneficiaries,
                splitType
            };

            // Add splits only for unequal split
            if (splitType === 'unequal') {
                const beneficiarySplits = {};
                beneficiaries.forEach(person => {
                    beneficiarySplits[person] = parseFloat(splits[person] || 0);
                });
                expenseData.splits = beneficiarySplits;
            }

            await addExpense(expenseData);
            Alert.alert('Success', 'Expense added successfully');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to add expense');
        } finally {
            setLoading(false);
        }
    };

    if (loadingPeople) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (people.length === 0) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background, padding: 20 }]}>
                <Text>No people added yet. Add friends first in the Groups tab!</Text>
                <Button onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    Go Back
                </Button>
            </View>
        );
    }

    const equalAmount = calculateEqualSplit();

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>

                {/* Group Info Header */}
                {selectedGroup && (
                    <Card style={styles.groupHeader}>
                        <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text variant="bodyMedium" style={{ flex: 1 }}>
                                Adding expense for: <Text style={{ fontWeight: 'bold' }}>{selectedGroup.name}</Text>
                            </Text>
                            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                                {selectedGroup.members.length} members
                            </Text>
                        </Card.Content>
                    </Card>
                )}

                {/* Description Input */}
                <Text variant="titleMedium" style={styles.label}>Description</Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Dinner, Groceries, Uber..."
                />

                {/* Payer Selection */}
                <Text variant="titleMedium" style={styles.label}>Who Paid?</Text>
                <TouchableRipple
                    onPress={() => setMenuVisible(true)}
                    style={[styles.payerSelector, { borderColor: theme.colors.outline }]}
                >
                    <View style={styles.payerSelectorContent}>
                        <Text style={{ flex: 1, color: payer ? theme.colors.onSurface : theme.colors.onSurfaceDisabled }}>
                            {payer || "Select Payer"}
                        </Text>
                        <List.Icon icon="chevron-down" />
                    </View>
                </TouchableRipple>

                <Portal>
                    <Modal
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
                    >
                        <Text variant="titleMedium" style={styles.modalTitle}>Select Payer</Text>
                        <Divider />
                        <ScrollView style={styles.modalScrollView}>
                            {people.map(person => (
                                <List.Item
                                    key={person}
                                    title={person}
                                    onPress={() => {
                                        setPayer(person);
                                        setMenuVisible(false);
                                    }}
                                    left={props => <List.Icon {...props} icon={payer === person ? "radiobox-marked" : "radiobox-blank"} />}
                                    style={payer === person ? { backgroundColor: theme.colors.primaryContainer } : undefined}
                                />
                            ))}
                        </ScrollView>
                        <Divider />
                        <Button onPress={() => setMenuVisible(false)} style={styles.modalCloseButton}>
                            Cancel
                        </Button>
                    </Modal>
                </Portal>

                {/* Amount Input */}
                <Text variant="titleMedium" style={styles.label}>Amount (₹)</Text>
                <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                    placeholder="0.00"
                />

                {/* Split Type Toggle */}
                <Text variant="titleMedium" style={styles.label}>Split Type</Text>
                <SegmentedButtons
                    value={splitType}
                    onValueChange={setSplitType}
                    buttons={[
                        { value: 'equal', label: 'Equal', icon: 'equal' },
                        { value: 'unequal', label: 'Unequal', icon: 'not-equal-variant' },
                    ]}
                    style={styles.segmentedButtons}
                />

                {/* Beneficiaries */}
                <Text variant="titleMedium" style={styles.label}>
                    Who Benefited? ({beneficiaries.length} selected)
                </Text>

                {splitType === 'equal' && amount && beneficiaries.length > 0 && (
                    <Text variant="bodySmall" style={styles.splitInfo}>
                        Each person pays: ₹{equalAmount.toFixed(2)}
                    </Text>
                )}

                <View style={styles.beneficiaryList}>
                    {people.map(person => (
                        <View key={person}>
                            <View style={styles.checkboxRow}>
                                <Checkbox
                                    status={beneficiaries.includes(person) ? 'checked' : 'unchecked'}
                                    onPress={() => toggleBeneficiary(person)}
                                />
                                <Text
                                    onPress={() => toggleBeneficiary(person)}
                                    style={styles.personName}
                                >
                                    {person}
                                </Text>

                                {splitType === 'unequal' && beneficiaries.includes(person) && (
                                    <TextInput
                                        value={splits[person]}
                                        onChangeText={(value) => updateSplit(person, value)}
                                        keyboardType="numeric"
                                        mode="outlined"
                                        dense
                                        style={styles.splitInput}
                                        placeholder="₹0"
                                    />
                                )}
                            </View>
                            <Divider />
                        </View>
                    ))}
                </View>

                {/* Show total for unequal split */}
                {splitType === 'unequal' && amount && (
                    <View style={styles.totalRow}>
                        <Text variant="bodyMedium">
                            Total Splits: ₹{getTotalSplits().toFixed(2)}
                        </Text>
                        <Text
                            variant="bodyMedium"
                            style={{
                                color: Math.abs(getTotalSplits() - parseFloat(amount || 0)) < 0.01
                                    ? theme.colors.primary
                                    : theme.colors.error
                            }}
                        >
                            / ₹{parseFloat(amount || 0).toFixed(2)}
                        </Text>
                    </View>
                )}

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    style={styles.submitButton}
                    icon="check"
                >
                    Add Expense
                </Button>
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
        padding: 20,
    },
    label: {
        marginBottom: 8,
        marginTop: 8,
        fontWeight: 'bold',
    },
    input: {
        marginBottom: 16,
    },
    segmentedButtons: {
        marginBottom: 16,
    },
    splitInfo: {
        marginBottom: 8,
        opacity: 0.7,
        fontStyle: 'italic',
    },
    beneficiaryList: {
        marginBottom: 20,
        backgroundColor: 'rgba(0,0,0,0.02)',
        padding: 10,
        borderRadius: 8,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        paddingVertical: 4,
    },
    personName: {
        flex: 1,
        fontSize: 16,
    },
    splitInput: {
        width: 100,
        height: 40,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 8,
    },
    submitButton: {
        marginTop: 10,
        paddingVertical: 6,
    },
    groupHeader: {
        marginBottom: 16,
        backgroundColor: 'rgba(100, 100, 255, 0.08)',
    },
    payerSelector: {
        borderWidth: 1,
        borderRadius: 4,
        padding: 16,
        marginBottom: 16,
    },
    payerSelectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
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

