import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';

export default function SettingsScreen({ navigation }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleDarkMode = () => {
    setIsDarkMode(prevState => !prevState);
  };

  const handleAddContact = () => {
    // Navigate to the SOS Contacts screen
    navigation.navigate('SOSContacts');
  };

  const handleLanguageChange = () => {
    // For demonstration purposes, simply show an alert with language options.
    Alert.alert(
      "Change Language",
      "Select a language",
      [
        { text: "English", onPress: () => Alert.alert("Language changed to English") },
        { text: "Spanish", onPress: () => Alert.alert("Language changed to Spanish") },
        { text: "Cancel", style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleLogout = () => {
    // Confirm logout and navigate back to the login/user details screen
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: 'cancel' },
        { text: "Logout", onPress: () => navigation.replace('UserDetails') },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}>
      <Text style={[styles.header, isDarkMode ? styles.darkText : styles.lightText]}>
        Settings
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={handleAddContact}>
        <Text style={styles.buttonText}>Add SOS Contact</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleLanguageChange}>
        <Text style={styles.buttonText}>Change Language</Text>
      </TouchableOpacity>
      
      <View style={styles.switchContainer}>
        <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>
          Dark Mode
        </Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  lightBackground: {
    backgroundColor: '#fff',
  },
  darkBackground: {
    backgroundColor: '#333',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  lightText: {
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});
