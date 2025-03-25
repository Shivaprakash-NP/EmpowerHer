// MainTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import ReportIssuesScreen from './ReportIssuesScreen';
import RecentReportsScreen from './RecentReportsScreen';
import SettingsStackNavigator from './SettingsStackNavigator';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Hide the header on each tab screen
        headerShown: false,
        // Active color for icons
        tabBarActiveTintColor: '#007AFF',
        // Style for tab labels
        tabBarLabelStyle: { fontSize: 12 },
        // Style for the tab bar background
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 60,
        },
        // Return an icon based on the route name
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {
            return <Ionicons name="home" size={size} color={color} />;
          } else if (route.name === 'Report') {
            return <MaterialCommunityIcons name="file-document-outline" size={size} color={color} />;
          } else if (route.name === 'RecentReports') {
            return <Ionicons name="newspaper-outline" size={size} color={color} />;
          } else if (route.name === 'Settings') {
            return <Ionicons name="settings-outline" size={size} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Report"
        component={ReportIssuesScreen}
        options={{ tabBarLabel: 'Report' }}
      />
      <Tab.Screen
        name="RecentReports"
        component={RecentReportsScreen}
        options={{ tabBarLabel: 'Updates' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}
