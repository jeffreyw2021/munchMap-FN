import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Dimensions, Alert, Image, Text } from 'react-native';
import styles from '../styles/mapStyle';
// import MapView from "react-native-map-clustering";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../styles/customMap';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import Icon from '../assets/icons/marker';
import IconLarge from '../assets/icons/markerLarge';
import Picko from '../assets/images/picko.png';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import haversine from 'haversine-distance';
import { getFetchedLocationsTable, getPlacesTable, fetchNearbyPlaces } from '../api/fetchNearbyPlaces';

export default function Map({ location, setGlobalCurrentLocation, globalRandomChoice, exitRandomChoice, setExitRandomChoice }) {

    // const screenWidth = Dimensions.get("window").width;
    // const screenHeight = Dimensions.get("window").height;

    const [useGoogleMaps, setUseGoogleMaps] = useState(false);
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

    useEffect(() => {
        if (initialLocation) {
            resetMapCamera(initialLocation);
        }
    }, [initialLocation]);
    useEffect(() => {
        if (currentLocation) {
            setGlobalCurrentLocation(currentLocation);
        }
    }, [currentLocation]);
    const [randomChoice, setRandomChoice] = useState(globalRandomChoice);
    useEffect(() => {
        if (globalRandomChoice) {
            const choice = typeof globalRandomChoice === 'string' ? JSON.parse(globalRandomChoice) : globalRandomChoice;
            setRandomChoice(choice);
            moveMapCamera({ latitude: choice.lat, longitude: choice.lon })
        }
    }, [globalRandomChoice]);

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
                pitch: useGoogleMaps ? 30 : 0,
                heading: 0,
                altitude: altitude,
                zoom: mapZoom
            }, { duration: 200 });
        }
    };
    const moveMapCamera = (location) => {
        if (location) {
            mapRef.current.animateCamera({
                center: {
                    latitude: location.latitude,
                    longitude: location.longitude
                },
                pitch: useGoogleMaps ? 30 : 0,
                heading: 0,
                altitude: altitude,
                zoom: mapZoom
            }, { duration: 200 });
        }
    }

    useEffect(() => {
        if(exitRandomChoice) {
            setRandomChoice(null);
            resetMapCamera(currentLocation);
            setExitRandomChoice(false);
        }
    }, [exitRandomChoice]);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={[styles.map]}
                customMapStyle={customMapStyle}
                provider={useGoogleMaps ? "google" : undefined}
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
                showsUserLocation={!randomChoice}
                followsUserLocation={(!randomChoice && autoResetCamera)}
                showsPointsOfInterest={false}
                showsCompass={false}
                // tintColor='#7CE400'
                tintColor='#000'
                mapPadding={{ top: 100, right: 22, bottom: 170, left: 22 }}
                legalLabelInsets={{ bottom: 0, right: 30 }}
                onPanDrag={() => { setAutoResetCamera(false) }}
            >

                {!randomChoice && (<Marker
                    coordinate={{
                        latitude: currentLocation ? currentLocation.coords.latitude : initialLocation.coords.latitude,
                        longitude: currentLocation ? currentLocation.coords.longitude : initialLocation.coords.longitude
                    }}
                    zIndex={1}
                    priority="High"
                    collapsable={false}
                >
                    <View style={{ justifyContent: 'center', alignItems: 'center', gap: 0 }}>
                        <Image source={Picko} style={{ width: 47.5, height: 42, marginRight: 5.5 }} />
                    </View>
                </Marker>)}

                {randomChoice &&
                    (() => {
                        const size = 0.8;
                        return (
                            <Marker
                                coordinate={{
                                    latitude: randomChoice.lat,
                                    longitude: randomChoice.lon
                                }}
                                zIndex={2}
                                priority="High"
                                collapsable={false}
                            >
                                <View>
                                    <IconLarge size={size} />
                                    <View style={{ height: 78 * size, width: '100%', position: 'absolute', top: 0, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 44 * size }}>{randomChoice.emoji}</Text>
                                    </View>
                                </View>
                            </Marker>
                        )
                    })()
                }

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
