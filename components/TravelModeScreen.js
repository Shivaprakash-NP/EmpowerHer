import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function TravelModeScreen() {
  const [passwordSet, setPasswordSet] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes = 300 seconds
  const intervalRef = useRef(null);

  // Function to trigger SOS (placeholder)
  const triggerSOS = () => {
    Alert.alert('SOS Triggered', 'Emergency services have been alerted!');
    // Here, integrate your actual SOS functionality.
  };

  // Start or reset the timer whenever password is set or confirmed successfully.
  const startTimer = () => {
    // Clear any existing timer
    if (intervalRef.current) clearInterval(intervalRef.current);

    setTimer(300); // reset timer to 5 minutes

    intervalRef.current = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(intervalRef.current);
          // Timer expired: trigger SOS
          triggerSOS();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  // When the password is confirmed correctly, reset the timer.
  const handleConfirm = () => {
    if (confirmInput === password) {
      Alert.alert('Success', 'Password confirmed. Timer reset.');
      setConfirmInput('');
      startTimer();
    } else {
      // Wrong password triggers SOS immediately.
      Alert.alert('Incorrect Password', 'The password is incorrect. Triggering SOS.');
      clearInterval(intervalRef.current);
      triggerSOS();
    }
  };

  // Clean up the interval on unmount.
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Render view for setting password if not already set.
  if (!passwordSet) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Set Your Travel Mode Password</Text>
        <Text style={styles.instruction}>Enter a numeric password:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (password.length === 0) {
              Alert.alert('Error', 'Please enter a password.');
            } else {
              setPasswordSet(true);
              startTimer();
            }
          }}
        >
          <Text style={styles.buttonText}>Set Password</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render view for confirming password with a timer.
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Active Travel Mode</Text>
      <Text style={styles.timerText}>
        Time remaining: {Math.floor(timer / 60)
          .toString()
          .padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
      </Text>
      <Text style={styles.instruction}>
        Please re-enter your password to confirm you're safe:
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={confirmInput}
        onChangeText={setConfirmInput}
        placeholder="Re-enter password"
      />
      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Confirm Password</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.sosButton]}
        onPress={triggerSOS}
      >
        <Text style={styles.buttonText}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#eef',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  timerText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  sosButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
