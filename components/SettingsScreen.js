// components/SettingsScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../UserContext';

export default function SettingsScreen({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const { user, logout } = useContext(UserContext);

  const handleManageSOSContacts = () => {
    if (user && user.phone) {
      navigation.navigate('SOSContacts', { phone: user.phone });
    } else {
      Alert.alert("Error", "User identifier not found");
    }
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    Alert.alert("Language Changed", `Language changed to ${lang === 'en' ? "English" : "Tamil"}`);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: 'cancel' },
        { 
          text: "Logout", 
          onPress: () => {
            logout();
            navigation.replace('UserDetails');
          }
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <TouchableOpacity style={styles.button} onPress={handleManageSOSContacts}>
        <Text style={styles.buttonText}>Manage SOS Contacts</Text>
      </TouchableOpacity>

      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Change Language</Text>
        <Picker
          selectedValue={selectedLanguage}
          style={styles.picker}
          onValueChange={(itemValue) => handleLanguageChange(itemValue)}
          mode="dropdown"
        >
          <Picker.Item label="English" value="en" />
          <Picker.Item label="Tamil" value="ta" />
        </Picker>
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="power" size={40} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: "#4169E1",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: 'center',
  },
  dropdownContainer: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  logoutContainer: {
    position: 'absolute',
    bottom: 250,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 10,
    fontWeight: "bold",
  },
});
