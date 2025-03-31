import React, { useState, useContext, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { UserContext } from '../UserContext'; // Get user info from context

export default function FloatingButtons() {
  const navigation = useNavigation();
  const { user } = useContext(UserContext); // Retrieve current user from context
  const [sound, setSound] = useState(null);

  const handleSOSPress = () => {
    const currentUserPhone = user ? user.phone : null;
    if (!currentUserPhone) {
      Alert.alert("Error", "User phone number not available. Please log in.");
      return;
    }
    // Pass the current user phone number to the SOS screen
    navigation.navigate('SOS', { phone: currentUserPhone });
  };

  const handleBuzzerPress = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.error('Error stopping buzzer sound:', error);
      }
      setSound(null);
    } else {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          require('../assets/buzzer.mp3')
        );
        await newSound.setIsLoopingAsync(true);
        setSound(newSound);
        await newSound.playAsync();
      } catch (error) {
        console.error('Error playing buzzer sound:', error);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <>
      <View style={styles.leftContainer}>
        <TouchableOpacity style={styles.button} onPress={handleBuzzerPress}>
          <Text style={styles.text}>Buzzer</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.rightContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSOSPress}>
          <Text style={styles.text}>SOS</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  leftContainer: {
    position: 'absolute',
    bottom: 100,  // lifted high  er from 100
    left: 20,
    zIndex: 100,
  },
  rightContainer: {
    position: 'absolute',
    bottom: 100,  // lifted higher from 100
    right: 20,
    zIndex: 100,
  },
  button: {
    backgroundColor: 'red',
    width: 80,   // slightly larger
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  text: {
    color: '#fff',
    fontSize: 18,  // increased font size
    fontWeight: 'bold',
  },
});
