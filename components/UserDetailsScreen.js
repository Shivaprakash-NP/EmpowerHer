// components/UserDetailsScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserContext } from '../UserContext';

export default function UserDetailsScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(UserContext);

  const handleNext = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }
    
    setLoading(true);
    const cleanedName = name.trim();
    const cleanedPhone = phone.trim();

    try {
      // Use phone as unique identifier.
      const userDocRef = doc(db, "users", cleanedPhone);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          name: cleanedName,
          phone: cleanedPhone,
          createdAt: serverTimestamp(),
        });
        console.log(`User document created for ${cleanedPhone}`);
      } else {
        console.log(`User document already exists for ${cleanedPhone}`);
      }

      // Persist user details.
      login({ phone: cleanedPhone, name: cleanedName });

      // Navigate to OTP verification screen.
      navigation.navigate('OTPVerification', {
        phone: cleanedPhone,
        onVerified: () => navigation.replace('MainTabs')
      });
    } catch (error) {
      console.error("Error creating user document:", error);
      Alert.alert("Error", "Failed to create user record. Please try again.");
    } finally {
      setLoading(false);
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
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TouchableOpacity style={styles.button} onPress={handleNext} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 10, backgroundColor: '#fff' },
  button: { backgroundColor: '#007BFF', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18 },
});
