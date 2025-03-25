// components/SOSContactsScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';

export default function SOSContactsScreen() {
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contacts, setContacts] = useState([]);

  const addContact = () => {
    if (contactName.trim() === '' || contactPhone.trim() === '') {
      Alert.alert('Error', 'Please fill both name and phone.');
      return;
    }
    setContacts([...contacts, { id: Date.now().toString(), name: contactName, phone: contactPhone }]);
    setContactName('');
    setContactPhone('');
  };

  const renderContact = ({ item }) => (
    <View style={styles.contactItem}>
      <Text style={styles.contactText}>{item.name}: {item.phone}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      <TextInput
        style={styles.input}
        placeholder="Contact Name"
        value={contactName}
        onChangeText={setContactName}
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Phone"
        value={contactPhone}
        onChangeText={setContactPhone}
        keyboardType="phone-pad"
      />
      <TouchableOpacity style={styles.button} onPress={addContact}>
        <Text style={styles.buttonText}>Add Contact</Text>
      </TouchableOpacity>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No contacts added yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { 
    height: 50, 
    borderColor: '#ccc', 
    borderWidth: 1, 
    borderRadius: 8, 
    marginBottom: 15, 
    paddingHorizontal: 10, 
    backgroundColor: '#fff' 
  },
  button: { 
    backgroundColor: '#007BFF', 
    paddingVertical: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 20 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18 
  },
  contactItem: { 
    padding: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc' 
  },
  contactText: { 
    fontSize: 16 
  }
});
