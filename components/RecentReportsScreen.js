// components/RecentReportsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db } from '../firebase';

export default function RecentReportsScreen() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "reports"),
      where("isPublic", "==", true),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reportsData = [];
      querySnapshot.forEach((doc) => {
        reportsData.push({ id: doc.id, ...doc.data() });
      });
      setReports(reportsData);
    }, (error) => {
      console.error("Error fetching reports: ", error);
    });
    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.reportCard}>
      <Text style={styles.reportTitle}>{item.reportType}</Text>
      <Text style={styles.reportDetail}>Date: {item.incidentDate}</Text>
      <Text style={styles.reportDetail}>Time: {item.incidentTime}</Text>
      <Text style={styles.reportDetail}>Description: {item.description}</Text>
      <Text style={styles.reportDetail}>
        Location: {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
      </Text>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.reportImage} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Reports</Text>
      {reports.length > 0 ? (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noReports}>No reports available.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40, // Push heading a bit down
    marginBottom: 20,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  reportCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007BFF',
  },
  reportDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  reportImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 8,
  },
  noReports: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 20,
  },
});