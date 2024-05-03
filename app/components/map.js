import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Alert, Image, Text } from 'react-native';
import styles from '../styles/mapStyle';
import MapView from "react-native-map-clustering";
import { Marker, Cluster, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../styles/customMap';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '../assets/icons/marker';
import Picko from '../assets/images/picko.png';
import { fetchNearbyPlaces } from '../api/fetchNearbyPlaces';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import haversine from 'haversine-distance';

const overpassUrl = 'https://overpass-api.de/api/interpreter';

export default function Map({ location }) {

    const [resetPressing, setResetPressing] = useState(false);
    const hapticFeedback = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const [mapZoom, setMapZoom] = useState(17);
    const [altitude, setAltitude] = useState(2600);
    const [initialLocation, setInitialLocation] = useState(location.location || null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [lastFetchedLocation, setLastFetchedLocation] = useState(null);
    const [autoResetCamera, setAutoResetCamera] = useState(true);
    
    const [searchRadius, setSearchRadius] = useState(2);
    const [places, setPlaces] = useState([]);
    
    useEffect(() => {
        if (initialLocation) {
            resetMapCamera(initialLocation);
            fetchNearbyPlaces(initialLocation.coords.latitude, initialLocation.coords.longitude, searchRadius);
        }
    }, [initialLocation])
    useEffect(() => {
        let unsubscribe;

        const subscribeLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }

            const lastKnownLocation = await Location.getLastKnownPositionAsync({
                accuracy: Location.Accuracy.High
            });
            if (lastKnownLocation) {
                setCurrentLocation(lastKnownLocation);
                checkAndFetchPlaces(lastKnownLocation);
            }
            unsubscribe = await Location.watchPositionAsync({
                accuracy: Location.Accuracy.High,
                distanceInterval: 1
            }, (location) => {
                setCurrentLocation(location);
                checkAndFetchPlaces(location);
            });
        };

        subscribeLocation();

        return () => {
            if (unsubscribe) {
                unsubscribe.remove();
            }
        };
    }, []);

    const checkAndFetchPlaces = (location) => {
        const currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        };

        if (!lastFetchedLocation) {
            setLastFetchedLocation(currentLocation);
            fetchNearbyPlaces(currentLocation.latitude, currentLocation.longitude, searchRadius);
        } else {
            const distance = haversine(lastFetchedLocation, currentLocation, { unit: 'meter' });
            console.log(`Distance from last fetched location: ${distance} meters`);
            if (distance > searchRadius * 500) {
                setLastFetchedLocation(currentLocation);
                fetchNearbyPlaces(currentLocation.latitude, currentLocation.longitude, searchRadius);
            }
        }
    };
    mapRef = useRef(null);
    const resetMapCamera = (currentLocation) => {
        if (currentLocation) {
            mapRef.current.animateCamera({
                center: {
                    latitude: currentLocation ? currentLocation.coords.latitude : initialLocation.coords.latitude,
                    longitude: currentLocation ? currentLocation.coords.longitude : initialLocation.coords.longitude,
                },
                pitch: 30,
                heading: 25,
                altitude: altitude,
                zoom: mapZoom
            }, { duration: 200 });
        }
    }

    const clearPlacesCache = async () => {
        try {
            await AsyncStorage.removeItem('places');
            console.log('Places cache cleared successfully.');
        } catch (error) {
            console.error('Failed to clear places cache:', error);
        }
    };
    const fetchNearbyPlaces = async (lat, lon, searchRadius = 0.5) => {
        // clearPlacesCache();
        console.log("Fetching nearby places...");
        const halfRadius = searchRadius / 2;
        const cacheKey = 'places';
        const cachedData = await AsyncStorage.getItem(cacheKey);
        const currentLocation = { latitude: lat, longitude: lon };
        setLastFetchedLocation(currentLocation);

        if (cachedData !== null) {
            const { data, location } = JSON.parse(cachedData);
            const distance = haversine(location, currentLocation, { unit: 'km' });

            console.log("Distance: ", distance);
            if (distance < halfRadius) {
                console.log("Using cached data");
                setPlaces(data);
                return;
            }
        }
        const query = `
        [out:json];
        (
            node["amenity"="restaurant"](around:${searchRadius * 1000},${lat},${lon});
            node["amenity"="cafe"](around:${searchRadius * 1000},${lat},${lon});
            node["amenity"="pub"](around:${searchRadius * 1000},${lat},${lon});
            node["amenity"="bbq"](around:${searchRadius * 1000},${lat},${lon});
            node["amenity"="fast_food"](around:${searchRadius * 1000},${lat},${lon});
            node["amenity"="ice_cream"](around:${searchRadius * 1000},${lat},${lon});
            node["shop"="bakery"](around:${searchRadius * 1000},${lat},${lon});
        );
        out;`;

        try {
            const response = await axios.post(overpassUrl, query);
            const fetchedPlaces = response.data.elements;
            if (cachedData !== null) {
                const { data } = JSON.parse(cachedData);
                const newPlaces = mergePlaces(data, fetchedPlaces);
                setPlaces(newPlaces);
                console.log("successfully merged places");
                await AsyncStorage.setItem(cacheKey, JSON.stringify({ data: newPlaces, location: currentLocation }));
            } else {
                setPlaces(fetchedPlaces);
                console.log("successfully fetched places");
                await AsyncStorage.setItem(cacheKey, JSON.stringify({ data: fetchedPlaces, location: currentLocation }));
            }
        } catch (error) {
            console.error("Failed to fetch places: ", error);
        }
    };
    const mergePlaces = (oldData, newData) => {
        const combined = [...oldData, ...newData];
        const unique = Array.from(new Set(combined.map(a => a.id))).map(id => {
            return combined.find(a => a.id === id);
        });
        return unique;
    };

    const clusterRenderer = (cluster, onPress) => {
        const pointCount = cluster.properties.point_count;
        const coordinate = {
            latitude: cluster.geometry.coordinates[1],
            longitude: cluster.geometry.coordinates[0]
        };
        const size = 0.4;
        return (
            // <Marker coordinate={coordinate} onPress={onPress}>
            //     <View style={{backgroundColor: "#fff", height: 18, width:18, borderRadius: 20, justifyContent:'center', alignItems:'center'}}>
            //         <Text style={{color: "#000", fontSize:7, fontWeight:'bold'}}>{pointCount}</Text>
            //     </View>
            // </Marker>
            <Marker coordinate={coordinate} onPress={onPress}>
                <View>
                    <Icon size={size} />
                    <View style={{ height: 42 * size, width: '100%', position: 'absolute', top: 0, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16 * size }}>{pointCount}</Text>
                    </View>
                </View>
            </Marker>
        );
    };


    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                customMapStyle={customMapStyle}
                // provider="google"
                initialRegion={{
                    latitude: initialLocation.coords.latitude,
                    longitude: initialLocation.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                userInterfaceStyle='light'
                buildingsEnabled={true}
                showsIndoorLevelPicker={false}
                zoomEnabled={true}
                pitchEnabled={false}
                rotateEnabled={true}
                loadingEnabled={true}
                showsUserLocation={true}
                followsUserLocation={autoResetCamera}
                showsPointsOfInterest={false}
                showsCompass={false}
                tintColor='#7CE400'
                mapPadding={{ top: 0, right: 22, bottom: 0, left: 22 }}
                legalLabelInsets={{ bottom: 0, right: 30 }}
                onPanDrag={() => { setAutoResetCamera(false) }}

                renderCluster={clusterRenderer}
                extent={450}
                animationEnabled={true}
            >
                {/* <Marker
                    coordinate={{
                        latitude: currentLocation ? currentLocation.coords.latitude : initialLocation.coords.latitude,
                        longitude: currentLocation ? currentLocation.coords.longitude : initialLocation.coords.longitude
                    }}
                    zIndex={1}
                    priority="High"
                    collapsable={false}
                >
                    <View style={{ justifyContent: 'flex-start', alignItems: 'center', gap: 30 }}>
                        <Image source={Picko} style={{ width: 47.5, height: 42, marginRight: 5.5 }} />
                        <Image source={Picko} style={{ width: 47.5, height: 42, opacity: 0 }} />
                    </View>
                </Marker> */}

                {places.map((place, index) => {
                    const coords = { latitude: place.lat, longitude: place.lon };
                    const size = 0.6;
                    return (
                        <Marker
                            key={index}
                            coordinate={coords}
                            zIndex={0}
                        >
                            <View>
                                <Icon size={size} />
                                <View style={{ height: 42 * size, width: '100%', position: 'absolute', top: 0, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 22 * size }}>🍔</Text>
                                </View>
                            </View>
                        </Marker>
                    );
                }
                )}
            </MapView>
            <View style={styles.overcast}>
                <TouchableOpacity
                    onPressIn={() => { setResetPressing(true); }}
                    onPressOut={() => setResetPressing(false)}
                    onPress={() => {
                        resetMapCamera(currentLocation);
                        setAutoResetCamera(true);
                        hapticFeedback();
                    }}
                    activeOpacity={1}
                    style={styles.resetMapBtn}
                >
                    <View style={[styles.resetMapBtn, styles.resetBtnContent, resetPressing && { top: 3 }]}>
                        <FontAwesomeIcon icon={faLocationCrosshairs} size={16} color="#000" />
                    </View>
                    <View style={[styles.resetMapBtn, styles.resetBtnShadow]} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
