// NavigationBar.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import ReportIssuesScreen from './ReportIssuesScreen';
import RatingPlaceScreen from './RatingPlaceScreen';  // Added import
import RecentReportsScreen from './RecentReportsScreen';
import SettingsStackNavigator from './SettingsStackNavigator';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {
            return <Ionicons name="home" size={size} color={color} />;
          } else if (route.name === 'Report') {
            return <MaterialCommunityIcons name="file-document-outline" size={size} color={color} />;
          } else if (route.name === 'Rating') {
            return <Ionicons name="star" size={size} color={color} />;
          } else if (route.name === 'Recent') {
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
        name="Rating"
        component={RatingPlaceScreen}
        options={{ tabBarLabel: 'Rating' }}
      />
      <Tab.Screen
        name="Recent"
        component={RecentReportsScreen}
        options={{ tabBarLabel: 'Recent' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}