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
      <Text style={styles.heading}>EmpowerHer</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.circleButton, styles.travelMode]}
          onPress={handleTravelMode}
        >
          <Ionicons name="walk" size={60} color="#fff" />
          <Text style={styles.buttonLabel}>Travel Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.circleButton, styles.planner]}
          onPress={handlePlanner}
        >
          <Ionicons name="map" size={60} color="#fff" />
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
    paddingTop: 50,
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    textAlign: 'center',
    marginTop: 50,
    fontWeight: '700',
    color: '#333',
    textShadowColor: '#ccc',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textDecorationLine: 'underline',
  },  
  heading2: {
    fontSize: 25,
    textAlign: 'center',    
    fontWeight: '700',
    color: '#333',
    textShadowColor: '#ccc',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 120,
  },
  circleButton: {
    width: 180, // increased size
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20, // more space between buttons
    elevation: 4,
  },
  travelMode: {
    backgroundColor: '#007BFF',
  },
  planner: {
    backgroundColor: '#28a745',
  },
  buttonLabel: {
    marginTop: 10,
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});