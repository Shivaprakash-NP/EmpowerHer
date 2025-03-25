// components/JourneyPlannerScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";

export default function JourneyPlannerScreen() {
  // State for input fields
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const webViewRef = useRef(null);
  const timeoutRef = useRef(null);

  // Default map center - Tamil Nadu, India (centered on the state)
  const defaultLatitude = 11.1271;  // More central to Tamil Nadu
  const defaultLongitude = 78.6569; // More central to Tamil Nadu
  const defaultZoom = 8;  // Zoomed out to show more of Tamil Nadu

  // Sample safe zones around Tamil Nadu
  const safeZones = [
    { id: 1, latitude: 13.0827, longitude: 80.2707, title: "Chennai Central" },
    { id: 2, latitude: 11.0168, longitude: 76.9558, title: "Coimbatore" },
    { id: 3, latitude: 10.7905, longitude: 78.7047, title: "Trichy" },
    { id: 4, latitude: 9.9252, longitude: 78.1198, title: "Madurai" },
    { id: 5, latitude: 11.6643, longitude: 78.1460, title: "Salem" },
    { id: 6, latitude: 12.2253, longitude: 79.0747, title: "Vellore" },
    { id: 7, latitude: 8.7642, longitude: 78.1348, title: "Tuticorin" },
  ];

  // Sample unsafe areas around Tamil Nadu (now represented as single coordinates)
  const unsafeAreas = [
    {
      id: 1,
      title: "Construction Zone - Anna Salai, Chennai",
      // Use first coordinate as marker position
      coordinates: [{ latitude: 13.0590, longitude: 80.2639 }]
    },
    {
      id: 2,
      title: "Flood Prone Area - Velachery, Chennai",
      coordinates: [{ latitude: 12.9815, longitude: 80.2180 }]
    },
    {
      id: 3,
      title: "Landslide Risk - Ooty Road",
      coordinates: [{ latitude: 11.4126, longitude: 76.6982 }]
    },
    {
      id: 4,
      title: "Accident Prone - Dindigul Highway",
      coordinates: [{ latitude: 10.3676, longitude: 77.9776 }]
    },
  ];

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const calculateRoute = () => {
    if (webViewRef.current && fromLocation && toLocation) {
      setIsLoading(true);
      setRouteError(null);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        setRouteError("Route calculation timed out. Please try again.");
        Alert.alert("Timeout", "Route calculation is taking too long. Please try again.");
      }, 30000);
      webViewRef.current.injectJavaScript(`
        try {
          geocodeAndRoute("${fromLocation}", "${toLocation}");
          true;
        } catch(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Error: ' + e.message }));
          true;
        }
      `);
    }
  };

  const resetRouteCalculation = () => {
    setIsLoading(false);
    setRouteError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

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

  // Convert unsafeAreas into markers (using first coordinate)
  const unsafeAreasForLeaflet = unsafeAreas.map(area => ({
    id: area.id,
    title: area.title,
    coordinate: [area.coordinates[0].latitude, area.coordinates[0].longitude],
  }));

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <!-- Leaflet Routing Machine -->
      <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
      <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
      <!-- Leaflet Geocoding -->
      <script src="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
        .leaflet-routing-alt { max-height: 150px; overflow-y: auto; font-size: 12px; }
        .error-message {
          position: absolute; top: 10px; left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 0, 0, 0.7);
          color: white; padding: 10px;
          border-radius: 5px; z-index: 1000;
          max-width: 80%; text-align: center;
        }
        .loading-indicator {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.8);
          color: #333; padding: 15px;
          border-radius: 5px; z-index: 1000;
          text-align: center; box-shadow: 0 0 10px rgba(0,0,0,0.2);
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        function sendLog(message) {
          try {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'log', message: message }));
          } catch(e) {
            console.log("Failed to send log:", e);
          }
        }
        
        function showLoading(message) {
          hideLoading();
          loadingIndicator = document.createElement('div');
          loadingIndicator.className = 'loading-indicator';
          loadingIndicator.innerHTML = message + '<div style="margin-top:10px;"><div style="width:30px;height:30px;border:3px solid #3498db;border-radius:50%;border-top-color:transparent;animation:spin 1s linear infinite;margin:0 auto;"></div></div>';
          document.body.appendChild(loadingIndicator);
        }
        
        function hideLoading() {
          if (loadingIndicator) {
            loadingIndicator.remove();
            loadingIndicator = null;
          }
        }
        
        function showError(message) {
          const existingError = document.querySelector('.error-message');
          if (existingError) { existingError.remove(); }
          const errorDiv = document.createElement('div');
          errorDiv.className = 'error-message';
          errorDiv.textContent = message;
          document.body.appendChild(errorDiv);
          setTimeout(() => { errorDiv.remove(); }, 5000);
          hideLoading();
        }
        
        let map, loadingIndicator;
        let routeControl = null, startMarker = null, endMarker = null;
        try {
          map = L.map('map').setView([${defaultLatitude}, ${defaultLongitude}], ${defaultZoom});
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);
          sendLog("Map initialized successfully");
        } catch(e) {
          sendLog("Error initializing map: " + e.message);
          showError("Failed to initialize map: " + e.message);
        }
        
        // Add safe zone markers
        const safeZones = ${JSON.stringify(safeZones)};
        const safeZoneMarkers = safeZones.map(zone => {
          try {
            const marker = L.marker([zone.latitude, zone.longitude]).bindPopup(zone.title).addTo(map);
            const greenIcon = L.divIcon({
              className: 'custom-marker',
              html: '<div style="background-color: green; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 14px;">S</div>',
              iconSize: [24,24],
              iconAnchor: [12,12]
            });
            marker.setIcon(greenIcon);
            return marker;
          } catch(e) {
            sendLog("Error adding safe zone marker: " + e.message);
            return null;
          }
        }).filter(marker => marker !== null);
        
        // Add unsafe area markers (red markers) using single coordinate
        const unsafeAreas = ${JSON.stringify(unsafeAreasForLeaflet)};
        const unsafeMarkers = unsafeAreas.map(area => {
          try {
            const marker = L.marker(area.coordinate).bindPopup(area.title).addTo(map);
            const redIcon = L.divIcon({
              className: 'custom-marker',
              html: '<div style="background-color: red; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 14px;">U</div>',
              iconSize: [24,24],
              iconAnchor: [12,12]
            });
            marker.setIcon(redIcon);
            return marker;
          } catch(e) {
            sendLog("Error adding unsafe area marker: " + e.message);
            return null;
          }
        }).filter(marker => marker !== null);
        
        // Set up geocoder
        const geocoder = L.Control.Geocoder.nominatim({
          geocodingQueryParams: { countrycodes: 'in', viewbox: '77.0,8.0,81.0,14.0', bounded: 1 }
        });
        
        // Check if a point is near any unsafe marker
        function isNearUnsafeArea(lat, lng, threshold = 500) { // threshold in meters
          try {
            const point = L.latLng(lat, lng);
            for (let i = 0; i < unsafeMarkers.length; i++) {
              const markerPos = unsafeMarkers[i].getLatLng();
              if (point.distanceTo(markerPos) < threshold) return true;
            }
            return false;
          } catch(e) {
            sendLog("Error in isNearUnsafeArea: " + e.message);
            return false;
          }
        }
        
        // Custom router using OSRMv1
        const customRouter = {
          route: function(waypoints, callback, context, options) {
            const start = waypoints[0].latLng;
            const end = waypoints[waypoints.length - 1].latLng;
            if (isNearUnsafeArea(start.lat, start.lng)) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Starting point is near an unsafe area' }));
              return;
            }
            if (isNearUnsafeArea(end.lat, end.lng)) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Destination is near an unsafe area' }));
              return;
            }
            const router = L.Routing.osrmv1({
              serviceUrl: 'https://router.project-osrm.org/route/v1',
              profile: 'driving'
            });
            router.route(waypoints, function(err, routes) {
              if (err) { callback.call(context, err); return; }
              callback.call(context, null, routes);
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'routeComplete' }));
            }, context, options);
          }
        };
        
        function geocodeAndRoute(fromAddress, toAddress) {
          try {
            sendLog("Starting route calculation");
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'routeStarted' }));
            showLoading("Finding your route...");
            if (!fromAddress.toLowerCase().includes("tamil")) { fromAddress += ", Tamil Nadu, India"; }
            if (!toAddress.toLowerCase().includes("tamil")) { toAddress += ", Tamil Nadu, India"; }
            sendLog("From: " + fromAddress + ", To: " + toAddress);
            if (startMarker) map.removeLayer(startMarker);
            if (endMarker) map.removeLayer(endMarker);
            if (routeControl) map.removeControl(routeControl);
            
            Promise.all([
              fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(fromAddress) + '&countrycodes=in&limit=1').then(res => res.json()),
              fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(toAddress) + '&countrycodes=in&limit=1').then(res => res.json())
            ]).then(([startResults, endResults]) => {
              if (!startResults || startResults.length === 0) throw new Error('Start location not found. Please try a more specific address in Tamil Nadu.');
              if (!endResults || endResults.length === 0) throw new Error('Destination location not found. Please try a more specific address in Tamil Nadu.');
              const start = { 
                lat: parseFloat(startResults[0].lat), 
                lng: parseFloat(startResults[0].lon),
                displayName: startResults[0].display_name
              };
              const end = { 
                lat: parseFloat(endResults[0].lat), 
                lng: parseFloat(endResults[0].lon),
                displayName: endResults[0].display_name
              };
              const tamilNaduBounds = L.latLngBounds(L.latLng(8.0, 76.5), L.latLng(13.5, 81.0));
              if (!tamilNaduBounds.contains([start.lat, start.lng])) throw new Error('Starting point appears to be outside Tamil Nadu.');
              if (!tamilNaduBounds.contains([end.lat, end.lng])) throw new Error('Destination appears to be outside Tamil Nadu.');
              sendLog("Start coordinates: " + JSON.stringify(start));
              sendLog("End coordinates: " + JSON.stringify(end));
              if (isNearUnsafeArea(start.lat, start.lng)) throw new Error('Starting point is near an unsafe area. Please choose a different starting point.');
              if (isNearUnsafeArea(end.lat, end.lng)) throw new Error('Destination is near an unsafe area. Please choose a different destination.');
              
              startMarker = L.marker([start.lat, start.lng]).addTo(map).bindPopup('Starting Point: ' + start.displayName);
              endMarker = L.marker([end.lat, end.lng]).addTo(map).bindPopup('Destination: ' + end.displayName);
              
              showLoading("Calculating routes...");
              routeControl = L.Routing.control({
                waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
                router: customRouter,
                routeWhileDragging: false,
                showAlternatives: true,
                lineOptions: { styles: [{ color: '#0066CC', opacity: 0.7, weight: 6 }] },
                altLineOptions: { styles: [{ color: '#6600CC', opacity: 0.4, weight: 6 }] },
                createMarker: () => null,
                containerClassName: 'routing-container'
              }).addTo(map);
              
              routeControl.on('routesfound', function(e) {
                hideLoading();
                sendLog("Routes found: " + e.routes.length);
                const routeBounds = L.latLngBounds([start.lat, start.lng], [end.lat, end.lng]);
                if (e.routes && e.routes.length > 0 && e.routes[0].coordinates) {
                  e.routes[0].coordinates.forEach(coord => { routeBounds.extend([coord.lat, coord.lng]); });
                }
                map.fitBounds(routeBounds, { padding: [50, 50] });
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'routeComplete' }));
              });
              
              routeControl.on('routingerror', function(e) {
                hideLoading();
                const errorMsg = e.error && e.error.message ? e.error.message : 'Unknown routing error';
                sendLog("Routing error: " + errorMsg);
                showError("Error calculating route: " + errorMsg);
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: errorMsg }));
              });
            }).catch(error => {
              hideLoading();
              showError(error.message);
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: error.message }));
            });
          } catch(e) {
            hideLoading();
            sendLog("Critical error in geocodeAndRoute: " + e.message);
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Critical error: ' + e.message }));
          }
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Tamil Nadu Secure Journey Planner</Text>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>From:</Text>
          <TextInput
            style={styles.input}
            value={fromLocation}
            onChangeText={setFromLocation}
            placeholder="Enter starting location in Tamil Nadu"
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>To:</Text>
          <TextInput
            style={styles.input}
            value={toLocation}
            onChangeText={setToLocation}
            placeholder="Enter destination in Tamil Nadu"
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity
          style={[styles.button, (!fromLocation || !toLocation || isLoading) && styles.buttonDisabled]}
          onPress={calculateRoute}
          disabled={isLoading || !fromLocation || !toLocation}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Find Safe Route</Text>
          )}
        </TouchableOpacity>
        {routeError && <Text style={styles.errorText}>{routeError}</Text>}
      </View>
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onMessage={handleWebViewMessage}
          onLoadEnd={() => resetRouteCalculation()}
        />
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Map Legend:</Text>
        <Text style={styles.legendItem}>
          <View style={styles.legendMarker}>
            <Text style={styles.markerText}>S</Text>
          </View>
          <Text> Safe Zones</Text>
        </Text>
        <Text style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: "red" }]}></View>
          <Text> Unsafe Areas</Text>
        </Text>
      </View>
      <Text style={styles.infoText}>
        Routes are calculated to avoid unsafe areas when possible. Darker blue routes are safer.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  heading: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginVertical: 10, color: "#333" },
  inputContainer: { padding: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eaeaea" },
  inputWrapper: { marginBottom: 10 },
  inputLabel: { fontSize: 14, fontWeight: "600", marginBottom: 4, color: "#333" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 6, padding: 10, backgroundColor: "#f5f5f5", fontSize: 16 },
  button: { backgroundColor: "#4169E1", padding: 14, borderRadius: 6, alignItems: "center", marginTop: 5 },
  buttonDisabled: { backgroundColor: "#B0C4DE" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  errorText: { color: "red", marginTop: 5, textAlign: "center" },
  mapContainer: { flex: 1, overflow: "hidden" },
  map: { flex: 1 },
  infoContainer: { padding: 12, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#eaeaea" },
  legend: { marginVertical: 5 },
  legendTitle: { fontSize: 14, fontWeight: "600", marginBottom: 5, color: "#333" },
  legendItem: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  legendMarker: { width: 24, height: 24, borderRadius: 12, backgroundColor: "green", borderWidth: 2, borderColor: "white", justifyContent: "center", alignItems: "center" },
  markerText: { color: "white", fontWeight: "bold", fontSize: 14 },
  infoText: { textAlign: "center", fontSize: 14, color: "#555", marginTop: 5 },
});
