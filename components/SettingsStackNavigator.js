// SettingsStackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SettingsScreen from './SettingsScreen';
import SOSContactsScreen from './SOSContactsScreen';

const Stack = createStackNavigator();

export default function SettingsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={({ navigation }) => ({
          title: 'Settings',
          // Override the back arrow behavior
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen 
        name="SOSContacts" 
        component={SOSContactsScreen} 
        options={{ title: 'SOS Contacts' }} 
      />
    </Stack.Navigator>
  );
}
