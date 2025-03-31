import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const handleTravelMode = () => {
    navigation.navigate("TravelMode");
  };

  const handlePlanner = () => {
    navigation.navigate("JourneyPlanner");
  };

  return (
    <ImageBackground 
      source={require('../assets/home_bg.png')}
      style={styles.background}
    >
      <View style={styles.overlay}>
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
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textDecorationLine: 'underline',
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 120,
  },
  circleButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    elevation: 4,
  },
  travelMode: {
    backgroundColor: 'rgba(0, 123, 255, 0.5)',  // Increased opacity
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 1)',      // Subtle white border to maintain shape
  },
  planner: {
    backgroundColor: 'rgba(40, 167, 69, 0.5)',    // Increased opacity
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 1)',        // Subtle white border
  },
  buttonLabel: {
    marginTop: 10,
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});