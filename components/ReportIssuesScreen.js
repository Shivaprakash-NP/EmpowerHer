// ReportIssuesScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  SafeAreaView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { WebView } from 'react-native-webview';
import { collection, addDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { db } from '../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

export default function ReportIssuesScreen({ navigation }) {
  // Form state
  const [reportType, setReportType] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date());
  const [incidentTime, setIncidentTime] = useState(new Date());
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [isPublic, setIsPublic] = useState(false);

  // Map and location state
  const [mapRegion, setMapRegion] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(true);

  // Picker state for date/time pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // useRef for WebView and timeout
  const webViewRef = useRef(null);
  const timeoutRef = useRef(null);

  // On mount, fetch current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission not granted, using default location.');
          const defaultLatitude = 37.78825;
          const defaultLongitude = -122.4324;
          setMapRegion({
            latitude: defaultLatitude,
            longitude: defaultLongitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          setSelectedLocation({
            latitude: defaultLatitude,
            longitude: defaultLongitude,
          });
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 10000,
        });
        const { latitude, longitude } = loc.coords;
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setSelectedLocation({ latitude, longitude });
      } catch (err) {
        console.error('Error fetching location:', err);
        Alert.alert('Location Error', 'Could not fetch location. Using default location.');
        const defaultLatitude = 37.78825;
        const defaultLongitude = -122.4324;
        setMapRegion({
          latitude: defaultLatitude,
          longitude: defaultLongitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setSelectedLocation({
          latitude: defaultLatitude,
          longitude: defaultLongitude,
        });
      }
    })();
  }, []);

  // Date & Time picker handlers
  const onDateChange = (event, selected) => {
    if (selected) setIncidentDate(selected);
    setShowDatePicker(false);
  };
  const onTimeChange = (event, selected) => {
    if (selected) setIncidentTime(selected);
    setShowTimePicker(false);
  };

  // Image picker function
  const pickImage = async () => {
    console.log("Pick image button pressed");
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("MediaLibrary permission status:", status);
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Media library permissions are required!');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: false,
      });
      console.log("ImagePicker result:", JSON.stringify(result, null, 2));
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        console.log("Image URI:", pickedUri);
        setImage(pickedUri);
      } else {
        console.log("Image picking canceled or no assets");
      }
    } catch (error) {
      console.error("Error in image picker:", error);
      Alert.alert("Image Picker Error", error.message);
    }
  };

  // Generate HTML for OpenStreetMap view
  const getMapHTML = () => {
    const lat = selectedLocation?.latitude || mapRegion?.latitude || 37.78825;
    const lng = selectedLocation?.longitude || mapRegion?.longitude || -122.4324;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <title>Location Map</title>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
          <style>
            body { padding: 0; margin: 0; }
            html, body, #map { height: 100%; width: 100%; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              const map = L.map('map').setView([${lat}, ${lng}], 16);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19
              }).addTo(map);
              let marker = L.marker([${lat}, ${lng}]).addTo(map);
              map.on('click', function(e) {
                const latlng = e.latlng;
                if (marker) { map.removeLayer(marker); }
                marker = L.marker(latlng).addTo(map);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'location_selected',
                  latitude: latlng.lat,
                  longitude: latlng.lng
                }));
              });
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map_loaded' }));
            });
          </script>
        </body>
      </html>
    `;
  };

  // Handle WebView messages from map
  const handleMapLoaded = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'map_loaded') {
        setIsMapLoading(false);
      } else if (data.type === 'location_selected') {
        setSelectedLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
    }
  };

  // Report submission
  const handleSubmit = async () => {
    if (!reportType || !description || !selectedLocation) {
      Alert.alert('Validation Error', 'Please fill in all required fields and select a location.');
      return;
    }
    try {
      // For simplicity, we're saving the image URI as a string
      const imageUrl = image ? image : null;
      const reportData = {
        reportType,
        incidentDate: incidentDate.toISOString().split('T')[0],
        incidentTime: incidentTime.toLocaleTimeString(),
        description,
        location: new GeoPoint(selectedLocation.latitude, selectedLocation.longitude),
        imageUrl,
        isPublic,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'reports'), reportData);
      // Also add a default rating for the reported location
      await addDoc(collection(db, 'ratings'), {
        rating: 1,
        location: new GeoPoint(selectedLocation.latitude, selectedLocation.longitude),
        createdAt: serverTimestamp(),
      });
      Alert.alert('Success', 'Report submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setReportType('');
            setIncidentDate(new Date());
            setIncidentTime(new Date());
            setDescription('');
            setImage(null);
            setIsPublic(false);
            setSelectedLocation(mapRegion);
            navigation.navigate('Home');
          },
        },
      ]);
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert('Submission Error', error.message);
    }
  };

  // Handle WebView messages (if any additional messages are sent)
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (data.type === "routeComplete") {
        setIsLoading(false);
        setRouteError(null);
        console.log("Route details:", data.safetyDetails);
      } else if (data.type === "routeStarted") {
        console.log("Route calculation started");
      } else if (data.type === "error") {
        setIsLoading(false);
        setRouteError(data.message);
        Alert.alert("Route Error", data.message);
      } else if (data.type === "log") {
        console.log("WebView log:", data.message);
      }
    } catch (err) {
      console.error("Error parsing WebView message:", event.nativeEvent.data);
      setIsLoading(false);
      setRouteError("Communication error with map");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: deviceHeight / 15 }]}>
        <Text style={styles.header}>Safety Report</Text>

        {/* Report Type */}
        <Text style={styles.label}>Report Type:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={reportType}
            onValueChange={(val) => setReportType(val)}
            style={styles.picker}
          >
            <Picker.Item label="Select Report Type" value="" />
            <Picker.Item label="Harassment" value="harassment" />
            <Picker.Item label="Stalking" value="stalking" />
            <Picker.Item label="Verbal Abuse" value="verbal_abuse" />
            <Picker.Item label="Physical Assault" value="physical_assault" />
            <Picker.Item label="Unsafe Environment" value="unsafe_environment" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>

        {/* Incident Date */}
        <Text style={styles.label}>Incident Date:</Text>
        <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
          <Text>{incidentDate.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={incidentDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {/* Incident Time */}
        <Text style={styles.label}>Incident Time:</Text>
        <TouchableOpacity style={styles.dateInput} onPress={() => setShowTimePicker(true)}>
          <Text>{incidentTime.toLocaleTimeString()}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={incidentTime}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}

        {/* Description */}
        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Enter description"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* Image Upload */}
        <Text style={styles.label}>Image Upload (Optional):</Text>
        <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
          <Text style={styles.imageUploadButtonText}>{image ? 'Change Image' : 'Pick an Image'}</Text>
        </TouchableOpacity>
        {image && <Image source={{ uri: image }} style={styles.previewImage} />}

        {/* Public Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.label}>Show this report publicly:</Text>
          <Switch value={isPublic} onValueChange={setIsPublic} />
        </View>

        {/* Map */}
        <Text style={styles.label}>Select Location (Tap on map):</Text>
        <View style={styles.mapContainer}>
          {isMapLoading && (
            <View style={styles.mapLoadingContainer}>
              <ActivityIndicator size="large" color="#007BFF" />
              <Text style={{ marginTop: 10 }}>Loading map...</Text>
            </View>
          )}
          <WebView
            style={styles.map}
            originWhitelist={['*']}
            source={{ html: getMapHTML() }}
            onMessage={handleMapLoaded}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            geolocationEnabled={true}
            useWebKit={true}
            startInLoadingState={true}
            onMessage={handleWebViewMessage}
            onLoadEnd={() => { setIsMapLoading(false); }}
          />
        </View>

        {/* Display selected location */}
        {selectedLocation && (
          <Text style={styles.locationText}>
            Selected: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
          </Text>
        )}

        {/* Submit Button */}
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity style={[styles.submitButton, { width: deviceWidth / 2 }]} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f7f7f7', 
    paddingTop: 30 
  },
  scrollContainer: { 
    padding: 20 
  },
  header: { 
    fontSize: 24, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 20, 
    color: '#333' 
  },
  label: { 
    marginTop: 10, 
    fontWeight: '600', 
    fontSize: 16, 
    color: '#555' 
  },
  pickerContainer: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    marginTop: 5, 
    backgroundColor: '#fff' 
  },
  picker: { 
    height: 50, 
    width: '100%' 
  },
  dateInput: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 10, 
    borderRadius: 8, 
    marginTop: 5, 
    backgroundColor: '#fff' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 10, 
    marginTop: 5, 
    borderRadius: 8, 
    backgroundColor: '#fff' 
  },
  imageUploadButton: { 
    backgroundColor: '#28a745', 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 5, 
    alignItems: 'center' 
  },
  imageUploadButtonText: { 
    color: '#fff', 
    fontWeight: '700' 
  },
  previewImage: { 
    width: '100%', 
    height: 200, 
    marginTop: 10, 
    borderRadius: 8 
  },
  toggleContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 10, 
    paddingHorizontal: 5 
  },
  mapContainer: { 
    width: '100%', 
    height: 300, 
    marginVertical: 10, 
    borderRadius: 8, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: '#ddd' 
  },
  mapLoadingContainer: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.8)', 
    zIndex: 1 
  },
  map: { 
    flex: 1 
  },
  locationText: { 
    textAlign: 'center', 
    marginBottom: 10, 
    color: '#333' 
  },
  submitButtonContainer: { 
    marginTop: 30, 
    alignItems: 'center' 
  },
  submitButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700' 
  },
});