// RatingPlaceScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  SafeAreaView, 
  ActivityIndicator 
} from 'react-native';
import * as Location from 'expo-location';
import { collection, addDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { db } from '../firebase';
import { Ionicons } from '@expo/vector-icons';

export default function RatingPlaceScreen({ navigation }) {
  const [rating, setRating] = useState(0);
  const [location, setLocation] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to submit a rating.');
          if (mounted) setLocation(null);
          return;
        }
        
        // First, get the last known location for a fast response
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown && mounted) {
          setLocation(lastKnown.coords);
          setIsLocationLoading(false);
        }
        
        // Then, get a fresh location update with a balanced accuracy setting
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 5000,
        });
        if (mounted) {
          setLocation(loc.coords);
          setIsLocationLoading(false);
        }
      } catch (err) {
        console.error('Location error:', err);
        if (mounted) {
          setLocation(null);
          setIsLocationLoading(false);
          Alert.alert('Location Error', 'Could not fetch location.');
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const submitRating = async () => {
    if (!location || rating === 0) {
      Alert.alert('Error', 'Please select a rating and ensure your location is available.');
      return;
    }
    try {
      const ratingData = {
        rating,
        location: new GeoPoint(location.latitude, location.longitude),
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'ratings'), ratingData);
      Alert.alert('Success', 'Rating submitted successfully!');
      setRating(0);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Submission Error', error.message);
    }
  };

  if (isLocationLoading) {
    return (
      <View style={styles.container}>
        <Text>Fetching location...</Text>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  } else {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Rate This Place</Text>
        <Text style={styles.subheading}>How safe is your current location?</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((num) => (
            <TouchableOpacity key={num} onPress={() => setRating(num)}>
              <Ionicons
                name={num <= rating ? 'star' : 'star-outline'}
                size={50}
                color="#FFD700"
              />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={submitRating}>
          <Text style={styles.submitButtonText}>Submit Rating</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f8ff', 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: 20,
  },
  heading: { 
    fontSize: 32, 
    fontWeight: '800', 
    marginBottom: 10, 
    color: '#333',
    marginTop: 40,
  },
  subheading: { 
    fontSize: 20, 
    marginBottom: 30, 
    color: '#666',
  },
  ratingContainer: { 
    flexDirection: 'row', 
    marginBottom: 40,
  },
  submitButton: { 
    backgroundColor: '#007BFF', 
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  submitButtonText: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '700',
  },
});
