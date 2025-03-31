import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserContext } from '../UserContext'; // Import the context

export default function UserDetailsScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { setUser } = useContext(UserContext); // Get the setter from context

  const handleNext = async () => {
    if (!name || !phone) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }
    
    try {
      // Use the phone number as the unique ID for the user document
      const userDocRef = doc(db, "users", phone);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // If the document does not exist, create it.
        await setDoc(userDocRef, {
          name,
          phone,
          createdAt: serverTimestamp(),
        });
        console.log(`User document created for ${phone}`);
      } else {
        console.log(`User document already exists for ${phone}`);
      }

      // Save the user data in context so that it is available globally.
      setUser({ phone, name });

      // Navigate to the OTP verification screen.
      navigation.navigate('OTPVerification', {
        phone,
        onVerified: () => navigation.replace('Home')
      });
    } catch (error) {
      console.error("Error creating user document:", error);
      Alert.alert("Error", "Failed to create user record. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Send OTP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
