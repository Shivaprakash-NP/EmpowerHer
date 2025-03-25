import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const handleTravelMode = () => {
    navigation.navigate("TravelMode");
  };

  const handlePlanner = () => {
    navigation.navigate("JourneyPlanner");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>EmpowerHer Safety Dashboard</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.circleButton, styles.travelMode]}
          onPress={handleTravelMode}
        >
          <Ionicons name="walk" size={50} color="#fff" />
          <Text style={styles.buttonLabel}>Travel Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.circleButton, styles.planner]}
          onPress={handlePlanner}
        >
          <Ionicons name="map" size={50} color="#fff" />
          <Text style={styles.buttonLabel}>Journey Planner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 40,
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Prevent pushing SOS button if it's rendered at bottom separately.
    paddingBottom: 120,
  },
  circleButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    elevation: 3,
  },
  travelMode: {
    backgroundColor: '#007BFF',
  },
  planner: {
    backgroundColor: '#28a745',
  },
  buttonLabel: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
