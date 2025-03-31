// components/JourneyPlannerScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Dimensions } from "react-native";

const { width: deviceWidth } = Dimensions.get("window");

// Default map center (Tamil Nadu, India)
const defaultLatitude = 11.1271;
const defaultLongitude = 78.6569;
const defaultZoom = 8;

export default function JourneyPlannerScreen() {
  // Input state for route search
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Markers: safe if avg rating ≥ 4; unsafe if avg rating ≤ 3
  const [safeMarkers, setSafeMarkers] = useState([]);
  const [unsafeMarkers, setUnsafeMarkers] = useState([]);

  // HTML content for the WebView (used by OSRM routing)
  const [htmlContent, setHtmlContent] = useState("");

  const webViewRef = useRef(null);
  const timeoutRef = useRef(null);

  // Fetch ratings from Firestore and classify markers
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const snapshot = await getDocs(collection(db, "ratings"));
        const groups = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.location && typeof data.rating === "number") {
            const lat = data.location.latitude;
            const lng = data.location.longitude;
            // Group nearby points by rounding to 2 decimals
            const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
            if (!groups[key]) {
              groups[key] = { total: 0, count: 0, lat, lng };
            }
            groups[key].total += data.rating;
            groups[key].count += 1;
          }
        });
        const safe = [];
        const unsafe = [];
        Object.keys(groups).forEach((key) => {
          const group = groups[key];
          const avg = group.total / group.count;
          if (avg >= 4) {
            safe.push({ id: key, latitude: group.lat, longitude: group.lng, avgRating: avg });
          } else if (avg <= 3) {
            unsafe.push({ id: key, latitude: group.lat, longitude: group.lng, avgRating: avg });
          }
        });
        setSafeMarkers(safe);
        setUnsafeMarkers(unsafe);
      } catch (err) {
        console.error("Error fetching ratings:", err);
        Alert.alert("Error", "Could not fetch location ratings");
      }
    };

    fetchRatings();
  }, []);

  // Build HTML content for the WebView
  useEffect(() => {
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
        <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
        <script src="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
          .leaflet-routing-alt { max-height: 150px; overflow-y: auto; font-size: 12px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          let map, routeControl, startMarker, endMarker, loadingIndicator;
          function sendLog(message) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'log', message }));
          }
          function showLoading(message) {
            hideLoading();
            loadingIndicator = document.createElement('div');
            loadingIndicator.style.position = 'absolute';
            loadingIndicator.style.top = '50%';
            loadingIndicator.style.left = '50%';
            loadingIndicator.style.transform = 'translate(-50%, -50%)';
            loadingIndicator.style.background = 'rgba(255,255,255,0.8)';
            loadingIndicator.style.padding = '15px';
            loadingIndicator.style.borderRadius = '5px';
            loadingIndicator.style.zIndex = '1000';
            loadingIndicator.style.textAlign = 'center';
            loadingIndicator.innerHTML = message + '<div style="margin-top:10px;"><div style="width:30px;height:30px;border:3px solid #3498db;border-radius:50%;border-top-color:transparent;animation:spin 1s linear infinite;margin:0 auto;"></div></div>';
            document.body.appendChild(loadingIndicator);
          }
          function hideLoading() {
            if (loadingIndicator) {
              loadingIndicator.remove();
              loadingIndicator = null;
            }
          }
          try {
            map = L.map('map').setView([${defaultLatitude}, ${defaultLongitude}], ${defaultZoom});
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors',
              maxZoom: 19
            }).addTo(map);
            sendLog("Map initialized successfully");
          } catch(e) {
            sendLog("Error initializing map: " + e.message);
          }
          
          // Haversine formula (km)
          function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
          }
          
          // Injected safe and unsafe zones from React Native
          const safeZones = ${JSON.stringify(safeMarkers)};
          const unsafeZones = ${JSON.stringify(unsafeMarkers)};
          
          // Add safe zone markers
          safeZones.forEach(zone => {
            L.marker([zone.latitude, zone.longitude], {
              icon: L.divIcon({
                className: 'custom-marker safe-marker',
                html: '<div style="width:24px;height:24px;border-radius:50%;background:green;border:2px solid white;display:flex;justify-content:center;align-items:center;color:white;font-size:14px;">S</div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })
            }).bindPopup("Safe Zone (Avg: " + zone.avgRating.toFixed(2) + ")").addTo(map);
          });
          
          // Add unsafe zone markers
          unsafeZones.forEach(zone => {
            L.marker([zone.latitude, zone.longitude], {
              icon: L.divIcon({
                className: 'custom-marker unsafe-marker',
                html: '<div style="width:24px;height:24px;border-radius:50%;background:red;border:2px solid white;display:flex;justify-content:center;align-items:center;color:white;font-size:14px;">U</div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })
            }).bindPopup("Unsafe Zone (Avg: " + zone.avgRating.toFixed(2) + ")").addTo(map);
          });
          
          // Enhanced route cost calculation: if any coordinate in the route is within 0.5 km of an unsafe zone, cost is Infinity.
          function calculateRouteCost(route) {
            const threshold = 0.5; // 0.5 km threshold
            // Ensure route.coordinates is an array
            const coords = Array.isArray(route.coordinates) ? route.coordinates : [];
            const nearUnsafe = coords.some(coord => {
              return unsafeZones.some(zone => {
                return calculateDistance(coord.lat, coord.lng, zone.latitude, zone.longitude) < threshold;
              });
            });
            if (nearUnsafe) {
              return { cost: Infinity };
            } else {
              let safeCount = 0;
              coords.forEach(coord => {
                const nearSafe = safeZones.some(zone => {
                  return calculateDistance(coord.lat, coord.lng, zone.latitude, zone.longitude) < threshold;
                });
                if (nearSafe) safeCount++;
              });
              const distanceKm = route.distance / 1000;
              const reward = 2;
              const cost = distanceKm - (safeCount * reward);
              return { cost, distanceKm, safeCount };
            }
          }
          
          // Custom router using OSRMv1 with enhanced safety filtering
          const customRouter = {
            route: function(waypoints, callback, context, options) {
              const router = L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'driving'
              });
              router.route(waypoints, function(err, routes) {
                if (err) {
                  callback.call(context, err);
                  return;
                }
                const routesWithCost = routes.map(route => {
                  const costObj = calculateRouteCost(route);
                  return { ...route, costObj };
                });
                routesWithCost.sort((a, b) => a.costObj.cost - b.costObj.cost);
                const bestRoute = routesWithCost[0];
                callback.call(context, null, [bestRoute]);
                // Simply log the safety details; no alert is shown to the user.
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'routeComplete',
                  safetyDetails: bestRoute.costObj
                }));
              }, context, options);
            }
          };
          
          // Geocode and route using OSRM and our customRouter
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
                if (!startResults || startResults.length === 0) throw new Error('Start location not found.');
                if (!endResults || endResults.length === 0) throw new Error('Destination location not found.');
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
                sendLog("Start: " + JSON.stringify(start));
                sendLog("End: " + JSON.stringify(end));
                startMarker = L.marker([start.lat, start.lng]).addTo(map).bindPopup('Starting Point: ' + start.displayName);
                endMarker = L.marker([end.lat, end.lng]).addTo(map).bindPopup('Destination: ' + end.displayName);
                showLoading("Calculating routes...");
                routeControl = L.Routing.control({
                  waypoints: [
                    L.latLng(start.lat, start.lng),
                    L.latLng(end.lat, end.lng)
                  ],
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
                    e.routes[0].coordinates.forEach(coord => {
                      routeBounds.extend([coord.lat, coord.lng]);
                    });
                  }
                  map.fitBounds(routeBounds, { padding: [50, 50] });
                });
                
                routeControl.on('routingerror', function(e) {
                  hideLoading();
                  const errorMsg = e.error && e.error.message ? e.error.message : 'Unknown routing error';
                  sendLog("Routing error: " + errorMsg);
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: errorMsg }));
                });
              }).catch(error => {
                hideLoading();
                sendLog(error.message);
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
    setHtmlContent(content);
  }, [safeMarkers, unsafeMarkers]);

  // Handle route calculation triggered by the "Find Safe Route" button
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

  // Listen for messages from the WebView
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
        console.log("Route Safety Details:", data.safetyDetails);
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Tamil Nadu Secure Journey Planner</Text>
        </View>

        {/* Search Inputs */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Text style={styles.searchLabel}>Starting Point</Text>
            <TextInput
              style={styles.searchInput}
              value={fromLocation}
              onChangeText={setFromLocation}
              placeholder="Enter starting location"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.searchInputWrapper}>
            <Text style={styles.searchLabel}>Destination</Text>
            <TextInput
              style={styles.searchInput}
              value={toLocation}
              onChangeText={setToLocation}
              placeholder="Enter destination"
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity
            style={[styles.searchButton, (!fromLocation || !toLocation || isLoading) && styles.buttonDisabled]}
            onPress={calculateRoute}
            disabled={isLoading || !fromLocation || !toLocation}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Find Safe Route</Text>
            )}
          </TouchableOpacity>
          {routeError && <Text style={styles.errorText}>{routeError}</Text>}
        </View>

        {/* Map */}
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
            onLoadEnd={resetRouteCalculation}
          />
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.legendMarker}>
              <Text style={styles.markerText}>S</Text>
            </View>
            <Text style={styles.legendText}> Safe Zones</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendMarker, { backgroundColor: "red" }]}>
              <Text style={styles.markerText}>U</Text>
            </View>
            <Text style={styles.legendText}> Unsafe Zones</Text>
          </View>
        </View>
        <Text style={styles.infoText}>
          Routes are selected to maximize safety by avoiding unsafe areas.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: "#4169E1",
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "ios" ? 40 : 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  searchContainer: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  searchInputWrapper: {
    marginBottom: 10,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#f5f5f5",
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#4169E1",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 5,
  },
  buttonDisabled: {
    backgroundColor: "#B0C4DE",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginTop: 5,
    textAlign: "center",
  },
  mapContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eaeaea",
  },
  map: {
    flex: 1,
  },
  legend: {
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  legendMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "green",
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  legendText: {
    fontSize: 14,
    marginLeft: 8,
    color: "#333",
  },
  markerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  infoText: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginTop: 10,
    padding: 10,
  },
});