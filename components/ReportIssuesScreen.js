import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import * as SQLite from 'expo-sqlite';
import * as Location from 'expo-location';

export default function ReportIssuesScreen({ navigation }) {
  const [db, setDb] = useState(null);
  const [reportType, setReportType] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [description, setDescription] = useState('');
  
  // Map state
  const [markerPosition, setMarkerPosition] = useState(null);
  const [initialLocation, setInitialLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const webviewRef = useRef(null);

  // Get initial location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setInitialLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  // Database setup
  useEffect(() => {
    async function setupDatabase() {
      try {
        const database = await SQLite.openDatabaseAsync('reports.db');
        setDb(database);
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS unsafe_places (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            incident_datetime TEXT,
            latitude REAL,
            longitude REAL,
            description TEXT
          );
          CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            incident_datetime TEXT,
            latitude REAL,
            longitude REAL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log("Tables created successfully");
      } catch (error) {
        console.log("Error setting up database:", error);
      }
    }
    setupDatabase();
  }, []);

  // Leaflet HTML with OSM
  const leafletHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100%; width: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${initialLocation.latitude}, ${initialLocation.longitude}], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        var marker = null;
        
        map.on('click', function(e) {
          if (marker) {
            map.removeLayer(marker);
          }
          marker = L.marker(e.latlng).addTo(map);
          
          // Send location back to React Native
          window.ReactNativeWebView.postMessage(JSON.stringify({
            mapEvent: {
              eventType: 'onMapClicked',
              location: {
                lat: e.latlng.lat,
                lng: e.latlng.lng
              }
            }
          }));
        });
      </script>
    </body>
    </html>
  `;

  // Handle map click from WebView
  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.mapEvent && data.mapEvent.eventType === 'onMapClicked') {
        setMarkerPosition({
          lat: data.mapEvent.location.lat,
          lng: data.mapEvent.location.lng
        });
      }
    } catch (error) {
      console.log("Error parsing message:", error);
    }
  };

  // Submit report
  const handleSubmit = async () => {
    if (!db) {
      Alert.alert("Error", "Database not ready yet.");
      return;
    }
    if (!reportType || !incidentDate || !incidentTime || !markerPosition || !description) {
      Alert.alert("Error", "Please fill all fields and select a location.");
      return;
    }
    try {
      const incidentDateTime = `${incidentDate} ${incidentTime}`;
      await db.runAsync(
        "INSERT INTO unsafe_places (type, incident_datetime, latitude, longitude, description) VALUES (?, ?, ?, ?, ?);",
        [reportType, incidentDateTime, markerPosition.lat, markerPosition.lng, description]
      );
      await db.runAsync(
        "INSERT INTO reports (type, incident_datetime, latitude, longitude, description) VALUES (?, ?, ?, ?, ?);",
        [reportType, incidentDateTime, markerPosition.lat, markerPosition.lng, description]
      );
      Alert.alert("Success", "Reported successfully!", [
        { text: "OK", onPress: () => navigation.navigate("Home") }
      ]);
    } catch (error) {
      console.log("Error submitting report:", error);
      Alert.alert("Error", "Failed to report issue.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Report Type:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter report type"
        value={reportType}
        onChangeText={setReportType}
      />
      <Text style={styles.label}>Incident Date (YYYY-MM-DD):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter incident date"
        value={incidentDate}
        onChangeText={setIncidentDate}
      />
      <Text style={styles.label}>Incident Time (HH:MM):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter incident time"
        value={incidentTime}
        onChangeText={setIncidentTime}
      />
      <Text style={styles.label}>Select Location (Tap on map):</Text>
      <View style={styles.mapContainer}>
        <WebView
          ref={webviewRef}
          source={{ html: leafletHtml }}
          style={styles.map}
          onMessage={onMessage}
        />
      </View>
      {markerPosition && (
        <Text style={styles.label}>
          Selected Location: {markerPosition.lat.toFixed(4)}, {markerPosition.lng.toFixed(4)}
        </Text>
      )}
      <Text style={styles.label}>Description:</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Describe the place"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Button title="Submit Report" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { marginTop: 10, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginTop: 5,
    borderRadius: 4,
  },
  mapContainer: { 
    width: '100%', 
    height: 300, 
    marginVertical: 10 
  },
  map: { width: '100%', height: '100%' },
});