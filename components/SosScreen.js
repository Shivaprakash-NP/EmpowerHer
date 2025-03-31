import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function SosScreen({ route }) {
  const { phone } = route.params || {};
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (!phone) {
      Alert.alert("Error", "User identifier missing. Please log in again.");
      return;
    }
    const contactsRef = collection(db, 'users', phone, 'sosContacts');
    const unsubscribe = onSnapshot(contactsRef, (snapshot) => {
      const contactsData = [];
      snapshot.forEach((doc) => {
        contactsData.push({ id: doc.id, ...doc.data() });
      });
      setContacts(contactsData);
    }, (error) => {
      console.error("Error fetching SOS contacts:", error);
      Alert.alert("Error", "Failed to fetch SOS contacts.");
    });
    return () => unsubscribe();
  }, [phone]);

  const sendDemoAlert = () => {
    // Instead of sending SMS, simply show an alert with a message.
    Alert.alert(
      "SOS Alert",
      "Alert sent to all contacts, volunteers (women safety group members), and police. Please remain calm and help is on the way."
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOS Screen</Text>
      <Text>Emergency actions go here...</Text>
      <TouchableOpacity style={styles.sosButton} onPress={sendDemoAlert}>
        <Text style={styles.sosButtonText}>Send SOS Alert</Text>
      </TouchableOpacity>
      {contacts.length > 0 && (
        <Text style={styles.contactInfo}>
          Contacts: {contacts.map(contact => `${contact.name} (${contact.phone})`).join(", ")}
        </Text>
      )}
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
  sosButton: {
    marginTop: 20,
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  contactInfo: {
    marginTop: 20,
    fontSize: 16,
    color: '#333'
  }
});
