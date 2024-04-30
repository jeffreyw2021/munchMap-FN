import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import styles from '../styles/mapStyle';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../styles/customMap';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '../assets/icons/marker';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

const overpassUrl = 'https://overpass-api.de/api/interpreter';

export default function Map({ location }) {

    const [resetPressing, setResetPressing] = useState(false);
    const hapticFeedback = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const [mapZoom, setMapZoom] = useState(17);
    const [altitude, setAltitude] = useState(1200);
    const [initialLocation, setInitialLocation] = useState(location.location || null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [autoResetCamera, setAutoResetCamera] = useState(true);
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
                if (autoResetCamera) {
                    resetMapCamera(lastKnownLocation);
                }
            }
            unsubscribe = await Location.watchPositionAsync({
                accuracy: Location.Accuracy.High,
                distanceInterval: 10
            }, (location) => {
                setCurrentLocation(location);
                if (autoResetCamera) {
                    resetMapCamera(location);
                }
            });
        };

        subscribeLocation();

        return () => {
            if (unsubscribe) {
                unsubscribe.remove();
            }
        };
    }, [autoResetCamera]);
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

    const [searchRadius, setSearchRadius] = useState(2);

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
                buildingsEnabled={true}
                showsIndoorLevelPicker={false}
                zoomEnabled={true}
                pitchEnabled={false}
                rotateEnabled={true}
                loadingEnabled={true}
                showsUserLocation={true}
                showsPointsOfInterest={false}
                showsCompass={false}
                tintColor='#47FFBD'
                mapPadding={{ top: 0, right: 22, bottom: 0, left: 22 }}
                legalLabelInsets={{ bottom: 0, right: 30 }}
                onPanDrag={() => {setAutoResetCamera(false)}}
                onRegionChange={() => {setAutoResetCamera(false)}}
            >

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
