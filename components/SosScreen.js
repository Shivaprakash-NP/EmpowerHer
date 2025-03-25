// components/SosScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOS Screen</Text>
      <Text>Emergency information or actions go here...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff' 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
