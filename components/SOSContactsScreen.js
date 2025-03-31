import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  StyleSheet 
} from 'react-native';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function SOSContactsScreen({ route, navigation }) {
  const { phone } = route.params || {};
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contacts, setContacts] = useState([]);

  // Ensure phone is provided
  if (!phone) {
    Alert.alert("Error", "User identifier missing");
    return null;
  }

  // Function to fetch SOS contacts from Firestore under users/{phone}/sosContacts
  const fetchContacts = async () => {
    try {
      const contactsRef = collection(db, "users", phone, "sosContacts");
      const snapshot = await getDocs(contactsRef);
      const contactList = [];
      snapshot.forEach(docSnap => {
        contactList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setContacts(contactList);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      Alert.alert("Error", "Failed to load contacts.");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Add a new SOS contact
  const addContact = async () => {
    if (contactName.trim() === '' || contactPhone.trim() === '') {
      Alert.alert('Error', 'Please fill both name and phone.');
      return;
    }
    try {
      const contactsRef = collection(db, "users", phone, "sosContacts");
      await addDoc(contactsRef, {
        name: contactName,
        phone: contactPhone,
        createdAt: serverTimestamp(),
      });
      Alert.alert("Success", "Contact added successfully.");
      setContactName('');
      setContactPhone('');
      fetchContacts();
    } catch (error) {
      console.error("Error adding contact:", error);
      Alert.alert("Error", "Failed to add contact.");
    }
  };

  // Edit an existing contact
  const handleEditContact = (contact) => {
    Alert.prompt(
      "Edit Contact",
      "Update name and phone (separated by a comma):",
      async (text) => {
        if (text) {
          const [newName, newPhone] = text.split(",");
          if (newName && newPhone) {
            try {
              const contactDocRef = doc(db, "users", phone, "sosContacts", contact.id);
              await updateDoc(contactDocRef, {
                name: newName.trim(),
                phone: newPhone.trim(),
              });
              Alert.alert("Success", "Contact updated.");
              fetchContacts();
            } catch (err) {
              console.error("Error updating contact:", err);
              Alert.alert("Error", "Failed to update contact.");
            }
          } else {
            Alert.alert("Error", "Please enter both name and phone separated by a comma.");
          }
        }
      },
      "plain-text",
      `${contact.name}, ${contact.phone}`
    );
  };

  // Delete a contact
  const handleDeleteContact = async (contactId) => {
    try {
      const contactDocRef = doc(db, "users", phone, "sosContacts", contactId);
      await deleteDoc(contactDocRef);
      Alert.alert("Success", "Contact deleted.");
      fetchContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
      Alert.alert("Error", "Failed to delete contact.");
    }
  };

  const renderContact = ({ item }) => (
    <TouchableOpacity 
      style={styles.contactItem} 
      onPress={() => handleEditContact(item)}
      onLongPress={() => handleDeleteContact(item.id)}
    >
      <Text style={styles.contactText}>{item.name}: {item.phone}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      <TextInput
        style={styles.input}
        placeholder="SOS Contact Name"
        value={contactName}
        onChangeText={setContactName}
      />
      <TextInput
        style={styles.input}
        placeholder="SOS Contact Phone"
        value={contactPhone}
        onChangeText={setContactPhone}
        keyboardType="phone-pad"
      />
      <TouchableOpacity style={styles.button} onPress={addContact}>
        <Text style={styles.buttonText}>Add SOS Contact</Text>
      </TouchableOpacity>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No contacts added yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20, 
    textAlign: 'center' 
  },
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
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777'
  }
});
