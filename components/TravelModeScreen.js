import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { UserContext } from '../UserContext'; // Import user context

export default function TravelModeScreen({ navigation }) {
  // Get user data from UserContext instead of Firebase Auth
  const { user } = useContext(UserContext);
  const currentUserPhone = user ? user.phone : null;
  
  // Phases: 'setup' -> set password; 'waiting' -> no input for 2 min; 'prompt' -> ask for password for 1 min.
  const [phase, setPhase] = useState('setup');
  const [password, setPassword] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  
  // Timer in seconds (waiting: 120, prompt: 60)
  const [timer, setTimer] = useState(120);
  // Count consecutive check-in failures
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  // Count wrong attempts during a prompt
  const [wrongAttempts, setWrongAttempts] = useState(0);
  
  const intervalRef = useRef(null);
  const phaseRef = useRef(phase);

  // Always update phaseRef when phase changes.
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Function to trigger SOS by navigating to the SOS screen
  const triggerSOS = () => {
    clearInterval(intervalRef.current);
    if (!currentUserPhone) {
      Alert.alert("Error", "User phone number not available. Please log in.");
      return;
    }
    navigation.navigate('SOS', { phone: currentUserPhone });
  };

  // Start or reset the timer based on the phase
  const startTimer = (initialSeconds) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimer(initialSeconds);

    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onTimerExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Called when timer expires
  const onTimerExpired = () => {
    if (phaseRef.current === 'waiting') {
      // End of waiting phase: switch to prompt phase
      Alert.alert('Check-In Required', 'Please confirm your password now!');
      setPhase('prompt');
      setWrongAttempts(0);
      startTimer(60); // Start prompt timer (1 minute)
    } else if (phaseRef.current === 'prompt') {
      // Prompt expired: record failure
      Alert.alert('Check-In Failed', 'You did not confirm in time.');
      recordFailure();
    }
  };

  // Record a failure and decide whether to trigger SOS
  const recordFailure = () => {
    const newFailures = consecutiveFailures + 1;
    setConsecutiveFailures(newFailures);
    if (newFailures >= 2) {
      triggerSOS();
    } else {
      // Restart waiting phase
      setPhase('waiting');
      startTimer(120);
    }
  };

  // Handle password confirmation in prompt phase
  const handleConfirm = () => {
    if (confirmInput === password) {
      Alert.alert('Success', 'Password confirmed. Timer reset.');
      setConsecutiveFailures(0);
      setWrongAttempts(0);
      setConfirmInput('');
      setPhase('waiting');
      startTimer(120);
    } else {
      const attempts = wrongAttempts + 1;
      setWrongAttempts(attempts);
      if (attempts >= 3) {
        Alert.alert('Incorrect Password', 'You entered the wrong password 3 times.');
        triggerSOS();
      } else {
        Alert.alert('Incorrect Password', `Try again. (${attempts} of 3 attempts)`);
      }
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Setup phase: user sets the password
  if (phase === 'setup') {
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
              setPhase('waiting');
              startTimer(120); // Start waiting phase (2 minutes)
            }
          }}
        >
          <Text style={styles.buttonText}>Set Password</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Waiting and Prompt phases view
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Active Travel Mode</Text>
      <Text style={styles.timerText}>
        Time remaining: {Math.floor(timer / 60).toString().padStart(2, '0')}:
        {(timer % 60).toString().padStart(2, '0')}
      </Text>
      {phase === 'waiting' ? (
        <Text style={styles.instruction}>Waiting for check-in (no action required yet).</Text>
      ) : (
        <>
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
        </>
      )}
      {/* Modified SOS button to navigate to SosScreen */}
      <TouchableOpacity style={[styles.button, styles.sosButton]} onPress={triggerSOS}>
        <Text style={styles.buttonText}>SOS</Text>
      </TouchableOpacity>
      <Text style={styles.statusText}>
        {phase === 'waiting' ? 'Waiting Phase (2 minutes)' : 'Prompt Phase (1 minute)'}
      </Text>
      <Text style={styles.statusText}>
        Consecutive Check-In Failures: {consecutiveFailures}
      </Text>
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
  statusText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 5,
    color: '#555',
  },
});