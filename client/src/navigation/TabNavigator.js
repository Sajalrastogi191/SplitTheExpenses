import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme, Icon } from 'react-native-paper';

// Home Tab Screens
import HomeScreen from '../screens/HomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import SettlementScreen from '../screens/SettlementScreen';

// Groups Tab Screens
import GroupsScreen from '../screens/GroupsScreen';
import AddFriendScreen from '../screens/AddFriendScreen';
import AddGroupScreen from '../screens/AddGroupScreen';

// Activity Tab Screen
import ActivityScreen from '../screens/ActivityScreen';
import JourneyDetailScreen from '../screens/JourneyDetailScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const GroupsStack = createStackNavigator();
const ActivityStack = createStackNavigator();

const screenOptions = (theme) => ({
    headerStyle: {
        backgroundColor: theme.colors.primary,
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
        fontWeight: 'bold',
    },
});

function HomeStackNavigator() {
    const theme = useTheme();
    return (
        <HomeStack.Navigator screenOptions={screenOptions(theme)}>
            <HomeStack.Screen
                name="HomeMain"
                component={HomeScreen}
                options={{ title: 'Hisaab 💰' }}
            />
            <HomeStack.Screen
                name="AddExpense"
                component={AddExpenseScreen}
                options={{ title: 'Add Expense 💳' }}
            />
            <HomeStack.Screen
                name="Expenses"
                component={ExpensesScreen}
                options={{ title: 'All Expenses 📋' }}
            />
            <HomeStack.Screen
                name="Settlement"
                component={SettlementScreen}
                options={{ title: 'Settlement ⚖️' }}
            />
        </HomeStack.Navigator>
    );
}

function GroupsStackNavigator() {
    const theme = useTheme();
    return (
        <GroupsStack.Navigator screenOptions={screenOptions(theme)}>
            <GroupsStack.Screen
                name="GroupsMain"
                component={GroupsScreen}
                options={{ title: 'Groups 👥' }}
            />
            <GroupsStack.Screen
                name="AddFriend"
                component={AddFriendScreen}
                options={{ title: 'Add Friend 🤝' }}
            />
            <GroupsStack.Screen
                name="AddGroup"
                component={AddGroupScreen}
                options={{ title: 'Create Group 📁' }}
            />
        </GroupsStack.Navigator>
    );
}

function ActivityStackNavigator() {
    const theme = useTheme();
    return (
        <ActivityStack.Navigator screenOptions={screenOptions(theme)}>
            <ActivityStack.Screen
                name="ActivityMain"
                component={ActivityScreen}
                options={{ title: 'Activity 📊' }}
            />
            <ActivityStack.Screen
                name="JourneyDetail"
                component={JourneyDetailScreen}
                options={({ route }) => ({
                    title: route.params?.journey?.name || 'Journey Details 📋'
                })}
            />
        </ActivityStack.Navigator>
    );
}

export default function TabNavigator() {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.outline,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.outlineVariant,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Groups') {
                        iconName = focused ? 'account-group' : 'account-group-outline';
                    } else if (route.name === 'Activity') {
                        iconName = focused ? 'history' : 'history';
                    }
                    return <Icon source={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeStackNavigator} />
            <Tab.Screen name="Groups" component={GroupsStackNavigator} />
            <Tab.Screen name="Activity" component={ActivityStackNavigator} />
        </Tab.Navigator>
    );
}
