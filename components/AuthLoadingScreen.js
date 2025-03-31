import React, { useContext, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { UserContext } from '../UserContext';

function AuthLoadingScreen({ navigation }) {
  const { user, isLoggedOut } = useContext(UserContext);

  useEffect(() => {
    // If user is loaded (even if null), navigate accordingly.
    // Here we treat a null user as "not logged in" and navigate to 'UserDetails'
    if (user) {
      if (!isLoggedOut) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('UserDetails');
      }
    } else {
      navigation.replace('UserDetails');
    }
  }, [user, isLoggedOut, navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default AuthLoadingScreen;
