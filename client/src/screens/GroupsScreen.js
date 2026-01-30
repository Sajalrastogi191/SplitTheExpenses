import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, useTheme, Chip, IconButton, Portal, Dialog, TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getFriends, getGroups, addFriend, deleteGroup } from '../services/api';
import { useThemeContext } from '../context/ThemeContext';

export default function GroupsScreen({ navigation }) {
    const theme = useTheme();
    const { toggleTheme, isDark } = useThemeContext();
    const [friends, setFriends] = useState([]);
    const [groups, setGroups] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [newFriendName, setNewFriendName] = useState('');
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        try {
            const [friendsRes, groupsRes] = await Promise.all([
                getFriends(),
                getGroups()
            ]);
            setFriends(friendsRes.data);
            setGroups(groupsRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
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

    const handleQuickAddFriend = async () => {
        if (!newFriendName.trim()) {
            Alert.alert('Error', 'Please enter a name');
            return;
        }
        setLoading(true);
        try {
            await addFriend(newFriendName.trim());
            setDialogVisible(false);
            setNewFriendName('');
            loadData();
            Alert.alert('Success', 'Friend added!');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to add friend');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = (group) => {
        Alert.alert(
            'Delete Group',
            `Are you sure you want to delete "${group.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteGroup(group.id);
                            loadData();
                            Alert.alert('Success', 'Group deleted!');
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.error || 'Failed to delete group');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Friends Summary Card */}
                <Card style={styles.summaryCard}>
                    <Card.Content style={styles.summaryContent}>
                        <View style={styles.summaryLeft}>
                            <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                {friends.length}
                            </Text>
                            <Text variant="bodyMedium">Friends</Text>
                        </View>
                        <View style={styles.summaryActions}>
                            <Button
                                mode="contained-tonal"
                                onPress={() => setDialogVisible(true)}
                                icon="account-plus"
                                compact
                            >
                                Add
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={() => navigation.navigate('AddFriend')}
                                icon="account-cog"
                                compact
                                style={{ marginLeft: 8 }}
                            >
                                Manage
                            </Button>
                        </View>
                    </Card.Content>
                </Card>

                {/* Groups Section */}
                <Text variant="titleLarge" style={styles.sectionTitle}>
                    📁 Your Groups
                </Text>

                {groups.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content style={styles.emptyContent}>
                            <Text variant="headlineMedium" style={{ marginBottom: 8 }}>🤝</Text>
                            <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 8 }}>
                                No groups yet
                            </Text>
                            <Text variant="bodyMedium" style={styles.emptyText}>
                                Create a group with your friends to start splitting expenses together.
                            </Text>
                            <Button
                                mode="contained"
                                onPress={() => navigation.navigate('AddGroup')}
                                icon="folder-plus"
                                style={{ marginTop: 16 }}
                                disabled={friends.length === 0}
                            >
                                Create Your First Group
                            </Button>
                            {friends.length === 0 && (
                                <Text variant="bodySmall" style={styles.hintText}>
                                    Add some friends first to create a group
                                </Text>
                            )}
                        </Card.Content>
                    </Card>
                ) : (
                    <>
                        {groups.map((group) => (
                            <Card key={group.id} style={styles.groupCard}>
                                <Card.Content>
                                    <View style={styles.groupHeader}>
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold', flex: 1 }}>
                                            {group.name}
                                        </Text>
                                        <Chip compact mode="flat" icon="account-multiple" style={{ backgroundColor: theme.colors.secondaryContainer }}>
                                            {group.members.length}
                                        </Chip>
                                        <IconButton
                                            icon="delete-outline"
                                            size={20}
                                            onPress={() => handleDeleteGroup(group)}
                                            style={{ margin: 0 }}
                                        />
                                    </View>
                                    <View style={styles.membersRow}>
                                        {group.members.slice(0, 5).map((member, idx) => (
                                            <Chip
                                                key={idx}
                                                compact
                                                mode="outlined"
                                                style={styles.memberChip}
                                                textStyle={{ fontSize: 12 }}
                                            >
                                                {member}
                                            </Chip>
                                        ))}
                                        {group.members.length > 5 && (
                                            <Chip compact mode="outlined" style={styles.memberChip} textStyle={{ fontSize: 12 }}>
                                                +{group.members.length - 5} more
                                            </Chip>
                                        )}
                                    </View>
                                </Card.Content>
                            </Card>
                        ))}

                        <Button
                            mode="contained"
                            onPress={() => navigation.navigate('AddGroup')}
                            icon="folder-plus"
                            style={styles.createButton}
                            disabled={friends.length === 0}
                        >
                            Create New Group
                        </Button>
                    </>
                )}
            </ScrollView>

            {/* Quick Add Friend Dialog */}
            <Portal>
                <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
                    <Dialog.Title>Add Friend</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Friend's Name"
                            value={newFriendName}
                            onChangeText={setNewFriendName}
                            mode="outlined"
                            autoFocus
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
                        <Button onPress={handleQuickAddFriend} loading={loading}>Add</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    summaryCard: {
        marginBottom: 20,
        elevation: 3,
    },
    summaryContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    summaryLeft: {
        alignItems: 'center',
    },
    summaryActions: {
        flexDirection: 'row',
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    emptyCard: {
        elevation: 2,
    },
    emptyContent: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    emptyText: {
        opacity: 0.7,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    hintText: {
        opacity: 0.5,
        marginTop: 8,
        fontStyle: 'italic',
    },
    groupCard: {
        marginBottom: 12,
        elevation: 2,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    membersRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    memberChip: {
        marginRight: 6,
        marginBottom: 6,
    },
    createButton: {
        marginTop: 8,
    },
});
