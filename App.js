import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import UserDetailsScreen from './components/UserDetailsScreen';
import OTPVerificationTest from './components/OTPVerificationTest';
import MainTabNavigator from './components/MainTabNavigator';
import SosScreen from './components/SosScreen';
import FloatingSOS from './components/FloatingSOS';
import TravelModeScreen from './components/TravelModeScreen';
import JourneyPlannerScreen from './components/JourneyPlannerScreen';
import AuthLoadingScreen from './components/AuthLoadingScreen'; // Add this import
import { UserProvider } from './UserContext';

const Stack = createStackNavigator();

// Wrap MainTabNavigator with additional components if needed
function AppContainer() {
  return (
    <>
      <MainTabNavigator />
      <FloatingSOS />
    </>
  );
}

function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="AuthLoading" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationTest} />
      <Stack.Screen name="MainTabs" component={AppContainer} />
      <Stack.Screen name="TravelMode" component={TravelModeScreen} />
      <Stack.Screen name="JourneyPlanner" component={JourneyPlannerScreen} />
      <Stack.Screen name="SOS" component={SosScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </UserProvider>
  );
}