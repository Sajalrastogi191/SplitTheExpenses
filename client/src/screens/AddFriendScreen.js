import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, List, IconButton, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getFriends, addFriend, deleteFriend } from '../services/api';

export default function AddFriendScreen({ navigation }) {
    const theme = useTheme();
    const [friends, setFriends] = useState([]);
    const [newFriendName, setNewFriendName] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadFriends = async () => {
        try {
            const res = await getFriends();
            setFriends(res.data);
        } catch (error) {
            console.error('Error loading friends:', error);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadFriends().finally(() => setRefreshing(false));
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadFriends();
        }, [])
    );

    const handleAddFriend = async () => {
        if (!newFriendName.trim()) {
            Alert.alert('Error', 'Please enter a name');
            return;
        }

        setLoading(true);
        try {
            await addFriend(newFriendName.trim());
            setNewFriendName('');
            loadFriends();
            Alert.alert('Success', 'Friend added successfully!');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to add friend');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFriend = async (friend) => {
        Alert.alert(
            'Delete Friend',
            `Are you sure you want to remove ${friend.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteFriend(friend.id);
                            loadFriends();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete friend');
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.content}>
                {/* Add Friend Form */}
                <View style={styles.formContainer}>
                    <Text variant="titleMedium" style={styles.label}>Add a New Friend</Text>
                    <TextInput
                        label="Friend's Name"
                        value={newFriendName}
                        onChangeText={setNewFriendName}
                        mode="outlined"
                        style={styles.input}
                        placeholder="Enter name..."
                    />
                    <Button
                        mode="contained"
                        onPress={handleAddFriend}
                        loading={loading}
                        disabled={loading}
                        icon="account-plus"
                        style={styles.addButton}
                    >
                        Add Friend
                    </Button>
                </View>

                <Divider style={styles.divider} />

                {/* Friends List */}
                <Text variant="titleMedium" style={styles.label}>Your Friends ({friends.length})</Text>
                {friends.length === 0 ? (
                    <Text style={styles.emptyText}>No friends added yet</Text>
                ) : (
                    friends.map((friend) => (
                        <List.Item
                            key={friend.id}
                            title={friend.name}
                            left={props => <List.Icon {...props} icon="account" />}
                            right={props => (
                                <IconButton
                                    {...props}
                                    icon="delete"
                                    iconColor={theme.colors.error}
                                    onPress={() => handleDeleteFriend(friend)}
                                />
                            )}
                            style={styles.listItem}
                        />
                    ))
                )}
            </View>
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
    formContainer: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 12,
        fontWeight: 'bold',
    },
    input: {
        marginBottom: 12,
    },
    addButton: {
        paddingVertical: 4,
    },
    divider: {
        marginVertical: 20,
    },
    emptyText: {
        opacity: 0.6,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
    },
    listItem: {
        backgroundColor: 'rgba(0,0,0,0.02)',
        marginBottom: 4,
        borderRadius: 8,
    },
});
