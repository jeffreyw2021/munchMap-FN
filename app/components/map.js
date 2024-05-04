import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Dimensions, Alert, Image, Text } from 'react-native';
import styles from '../styles/mapStyle';
// import MapView from "react-native-map-clustering";
import MapView, { Marker,PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../styles/customMap';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import Icon from '../assets/icons/marker';
import Picko from '../assets/images/picko.png';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import haversine from 'haversine-distance';
import { getFetchedLocationsTable, getPlacesTable, fetchNearbyPlaces } from '../api/fetchNearbyPlaces';

export default function Map({ location }) {

    // const screenWidth = Dimensions.get("window").width;
    // const screenHeight = Dimensions.get("window").height;

    const [resetPressing, setResetPressing] = useState(false);
    const hapticFeedback = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    mapRef = useRef(null);
    const [mapZoom, setMapZoom] = useState(17);
    const [altitude, setAltitude] = useState(3200);
    const [initialLocation, setInitialLocation] = useState(location.location || null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [autoResetCamera, setAutoResetCamera] = useState(true);

    const [searchRadius, setSearchRadius] = useState(2);
    const [places, setPlaces] = useState([]);

    useEffect(() => {
        if (initialLocation) {
            resetMapCamera(initialLocation);
        }
    }, [initialLocation]);

    const fetchAndCheckLocations = async () => {
        try {
            const locations = await getFetchedLocationsTable();
            let found = false;

            locations.forEach(location => {
                const fetchedLocation = { latitude: location.lat, longitude: location.lon };
                const currentLoc = {
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude
                };

                const distance = haversine(fetchedLocation, currentLoc);

                if (distance <= location.radius * 1000) {
                    found = true;
                    console.log('Fetched location within radius, ' + 'distance: ' + distance + 'm');
                }
            })

            if (!found) {
                console.log('No fetched location within radius, fetching new places');
                const places = await fetchNearbyPlaces(currentLocation.coords.latitude, currentLocation.coords.longitude, searchRadius);
                setPlaces(places);
            } 
            // else {
            //     console.log('Fetched location within radius, skipping fetching new places');
            //     const places = await getPlacesTable();
            //     // setPlaces(places);
            // }
        } catch (error) {
            console.error('Error in fetching or processing locations:', error);
        }
    };
    useEffect(() => {
        if (currentLocation) {
            fetchAndCheckLocations();
        }
    }, [currentLocation]);

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
            }
            unsubscribe = await Location.watchPositionAsync({
                accuracy: Location.Accuracy.High,
                distanceInterval: 1
            }, (location) => {
                setCurrentLocation(location);
            });
        };
        subscribeLocation();

        return () => {
            if (unsubscribe) {
                unsubscribe.remove();
            }
        };
    }, []);

    const resetMapCamera = (currentLocation) => {
        if (currentLocation) {
            mapRef.current.animateCamera({
                center: {
                    latitude: currentLocation ? currentLocation.coords.latitude : initialLocation.coords.latitude,
                    longitude: currentLocation ? currentLocation.coords.longitude : initialLocation.coords.longitude,
                },
                pitch: 30,
                heading: 0,
                altitude: altitude,
                zoom: mapZoom
            }, { duration: 200 });
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={[styles.map]}
                customMapStyle={customMapStyle}
                provider={PROVIDER_GOOGLE}
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
                // tintColor='#7CE400'
                tintColor='#000'
                mapPadding={{ top: 100, right: 22, bottom: 170, left: 22 }}
                legalLabelInsets={{ bottom: 0, right: 30 }}
                onPanDrag={() => { setAutoResetCamera(false) }}
            // renderCluster={clusterRenderer}
            // extent={450}
            // animationEnabled={true}
            >

                <Marker
                    coordinate={{
                        latitude: currentLocation ? currentLocation.coords.latitude : initialLocation.coords.latitude,
                        longitude: currentLocation ? currentLocation.coords.longitude : initialLocation.coords.longitude
                    }}
                    zIndex={1}
                    priority="High"
                    collapsable={false}
                >
                    <View style={{ height: 50, justifyContent: 'flex-start', alignItems: 'center', gap: 0 }}>
                        <Image source={Picko} style={{ width: 47.5, height: 42, marginRight: 5.5 }} />
                    </View>
                </Marker>

                {places.map((place, index) => {
                    const coords = { latitude: place.lat, longitude: place.lon };
                    const size = 0.8;
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
