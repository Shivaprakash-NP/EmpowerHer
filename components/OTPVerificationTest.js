import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet 
} from 'react-native';

const OTPVerificationTest = ({ route, navigation }) => {
  const { phone } = route.params || {};
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    if (otp === '123456') {
      Alert.alert("Success", "OTP Verified Successfully!", [
        { 
          text: "OK", 
          onPress: () => navigation.replace('MainTabs') 
        }
      ]);
    } else {
      Alert.alert("Error", "Invalid OTP, please try again.");
    }
  };

  // Resend OTP button: shows an alert and resets OTP input
  const handleResend = () => {
    Alert.alert("Success", "OTP Resended Successfully!");
    setOtp('');
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
      <TouchableOpacity style={[styles.button, styles.resendButton]} onPress={handleResend}>
        <Text style={styles.buttonText}>Resend OTP</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.verifyButton]} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center', 
    backgroundColor: '#f5f5f5' 
  },
  title: { 
    fontSize: 26, 
    marginBottom: 15, 
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
  info: { 
    textAlign: 'center', 
    marginBottom: 20,
    color: '#555'
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    fontSize: 18,
  },
  button: { 
    paddingVertical: 15, 
    borderRadius: 8, 
    alignItems: 'center',
    marginBottom: 15,
  },
  resendButton: {
    backgroundColor: '#007BFF', // Blue color for Resend
  },
  verifyButton: {
    backgroundColor: '#28a745', // Green color for Verify
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
  },
});

export default React.memo(OTPVerificationTest);
