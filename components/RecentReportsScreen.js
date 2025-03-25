// components/RecentReportsScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RecentReportsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Reports</Text>
      <Text>This is the news or recent reports section.</Text>
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
