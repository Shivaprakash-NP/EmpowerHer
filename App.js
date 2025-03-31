// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import UserDetailsScreen from './components/LoginScreen';
import OTPVerificationTest from './components/OTPVerificationTest';
import MainTabNavigator from './components/MainTabNavigator';
import SosScreen from './components/SosScreen';
import FloatingSOS from './components/FloatingSOS';
import TravelModeScreen from './components/TravelModeScreen';
import JourneyPlannerScreen from './components/JourneyPlannerScreen';
import { UserProvider } from './UserContext';

const Stack = createStackNavigator();

function AppContainer() {
  return (
    <>
      <MainTabNavigator />
      <FloatingSOS />
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="UserDetails" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
          <Stack.Screen name="OTPVerification" component={OTPVerificationTest} />
          <Stack.Screen name="MainTabs" component={AppContainer} />
          <Stack.Screen name="TravelMode" component={TravelModeScreen} />
          <Stack.Screen name="JourneyPlanner" component={JourneyPlannerScreen} />
          <Stack.Screen name="SOS" component={SosScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
