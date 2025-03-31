import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ImageBackground 
} from 'react-native';

const OTPVerificationTest = ({ route, navigation }) => {
  const { phone } = route.params || {}; // Only phone is passed
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    if (otp === '123456') {
      Alert.alert("Success", "OTP Verified Successfully!", [
        { text: "OK", onPress: () => navigation.replace('MainTabs') }
      ]);
    } else {
      Alert.alert("Error", "Invalid OTP, please try again.");
    }
  };

  const handleResend = () => {
    Alert.alert("Success", "OTP Resent Successfully!");
    setOtp('');
  };

  return (
    <ImageBackground 
      source={require('../assets/login_bg.png')}
      style={styles.background}
    >
      {/* Overlay for better readability */}
      <View style={styles.overlay} />
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  title: { 
    fontSize: 26, 
    marginBottom: 15, 
    textAlign: 'center', 
    fontWeight: 'bold',
    color: '#fff',
  },
  info: { 
    textAlign: 'center', 
    marginBottom: 20,
    color: '#ddd'
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    fontSize: 18,
  },
  button: { 
    width: '100%',
    paddingVertical: 15, 
    borderRadius: 8, 
    alignItems: 'center',
    marginBottom: 15,
  },
  resendButton: {
    backgroundColor: '#007BFF',
  },
  verifyButton: {
    backgroundColor: '#28a745',
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
  },
});

export default React.memo(OTPVerificationTest);
