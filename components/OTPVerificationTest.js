import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';

export default function OTPVerificationTest({ route, navigation }) {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    if (otp === '123456') {
      Alert.alert("Success", "OTP Verified Successfully!", [
        { 
          text: "OK", 
          onPress: () => {
            // Navigate directly to the main tabs screen
            navigation.replace('MainTabs');
          }
        }
      ]);
    } else {
      Alert.alert("Error", "Invalid OTP, please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.info}>Enter the OTP sent to {phone}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center', 
    backgroundColor: '#f5f5f5' 
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  info: { 
    textAlign: 'center', 
    marginBottom: 20 
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
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18 
  },
});
