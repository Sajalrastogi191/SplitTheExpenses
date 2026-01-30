import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Checkbox, ActivityIndicator } from 'react-native-paper';
import { getFriends, addGroup } from '../services/api';

export default function AddGroupScreen({ navigation }) {
    const theme = useTheme();
    const [groupName, setGroupName] = useState('');
    const [friends, setFriends] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingFriends, setLoadingFriends] = useState(true);

    useEffect(() => {
        loadFriends();
    }, []);

    const loadFriends = async () => {
        try {
            const res = await getFriends();
            setFriends(res.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load friends');
        } finally {
            setLoadingFriends(false);
        }
    };

    const toggleMember = (friendName) => {
        if (selectedMembers.includes(friendName)) {
            setSelectedMembers(selectedMembers.filter(m => m !== friendName));
        } else {
            setSelectedMembers([...selectedMembers, friendName]);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            Alert.alert('Error', 'Please enter a group name');
            return;
        }
        if (selectedMembers.length === 0) {
            Alert.alert('Error', 'Please select at least one member');
            return;
        }

        setLoading(true);
        try {
            await addGroup({
                name: groupName.trim(),
                members: selectedMembers
            });
            Alert.alert('Success', 'Group created successfully!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    if (loadingFriends) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (friends.length === 0) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <Text style={styles.emptyText}>No friends available. Add friends first!</Text>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('AddFriend')}
                    style={{ marginTop: 16 }}
                >
                    Add Friends
                </Button>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <Text variant="titleMedium" style={styles.label}>Group Name</Text>
                <TextInput
                    label="Enter group name"
                    value={groupName}
                    onChangeText={setGroupName}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Trip to Goa, Roommates..."
                />

                <Text variant="titleMedium" style={styles.label}>
                    Select Members ({selectedMembers.length} selected)
                </Text>
                <View style={styles.membersList}>
                    {friends.map(friend => (
                        <View key={friend.id} style={styles.checkboxRow}>
                            <Checkbox
                                status={selectedMembers.includes(friend.name) ? 'checked' : 'unchecked'}
                                onPress={() => toggleMember(friend.name)}
                            />
                            <Text
                                onPress={() => toggleMember(friend.name)}
                                style={styles.memberName}
                            >
                                {friend.name}
                            </Text>
                        </View>
                    ))}
                </View>

                <Button
                    mode="contained"
                    onPress={handleCreateGroup}
                    loading={loading}
                    disabled={loading}
                    icon="folder-plus"
                    style={styles.createButton}
                >
                    Create Group
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
        padding: 20,
    },
    content: {
        padding: 16,
    },
    label: {
        marginBottom: 12,
        marginTop: 8,
        fontWeight: 'bold',
    },
    input: {
        marginBottom: 20,
    },
    membersList: {
        backgroundColor: 'rgba(0,0,0,0.02)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    memberName: {
        fontSize: 16,
    },
    createButton: {
        paddingVertical: 6,
        marginTop: 10,
    },
    emptyText: {
        opacity: 0.6,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});
