import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, useTheme, Text } from 'react-native-paper';
import { addPerson } from '../services/api';

export default function AddPersonScreen({ navigation }) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a name');
            return;
        }

        setLoading(true);
        try {
            await addPerson(name.trim());
            Alert.alert('Success', 'Person added successfully');
            setName('');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to add person');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <Text variant="titleMedium" style={{ marginBottom: 16 }}>Add a new person to the group</Text>

                <TextInput
                    label="Person Name"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                    autoFocus
                />

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                >
                    Add Person
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    input: {
        marginBottom: 20,
    },
    button: {
        paddingVertical: 6,
    }
});
