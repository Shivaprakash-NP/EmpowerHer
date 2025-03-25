import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PlannerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure Journey Planner</Text>
      <Text style={styles.description}>
        View a map that highlights safe and unsafe areas and get route suggestions based on safety.
      </Text>
      {/* Integrate map component (e.g., using react-native-maps) and safety overlays here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  description: { fontSize: 16, textAlign: 'center' }
});
