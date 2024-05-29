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
import { getSavedPlacesTable, getSavedPlacesWithinRadius, filterByTypes } from '../api/fetchNearbyPlaces';
// import MapLibreGL from '@maplibre/maplibre-react-native';

// MapLibreGL.setAccessToken(null);

export default function Map({ props, randomChoice, location, currentScreen }) {

    // const screenWidth = Dimensions.get("window").width;
    // const screenHeight = Dimensions.get("window").height;

    const [savedPlaces, setSavedPlaces] = useState(null);
    const [showPlaces, setShowPLaces] = useState(null);
    useEffect(() => {
        getSavedPlacesTable()
            .then(places => {
                let validPlaces = getSavedPlacesWithinRadius(places, location.coords.latitude, location.coords.longitude, props.filterDistance);
                setSavedPlaces(validPlaces);
                if (props.filterWishlist === 'All Saved' || 'None') {
                    setShowPLaces(validPlaces);
                }
            })
            .catch(error => {
                console.error('Failed to fetch saved places: ', error);
            });
    }, []);
    useEffect(() => {
        if (props.globalCurrentLocation) {
            getSavedPlacesTable()
                .then(places => {
                    let validPlaces = getSavedPlacesWithinRadius(places, props.globalCurrentLocation.coords.latitude, props.globalCurrentLocation.coords.longitude, props.filterDistance);
                    setSavedPlaces(validPlaces);
                    if (props.filterWishlist === 'All Saved' || 'None') {
                        setShowPLaces(validPlaces);
                    }
                })
                .catch(error => {
                    console.error('Failed to fetch saved places: ', error);
                });
        }
    }, [props.mapRenderFlag]);

    // console.log("location: ", location)
    const [useGoogleMaps, setUseGoogleMaps] = useState(false);
    const [resetPressing, setResetPressing] = useState(false);
    const hapticFeedback = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    mapRef = useRef(null);
    const [mapZoom, setMapZoom] = useState(16);
    const [altitude, setAltitude] = useState(3000);
    const [initialLocation, setInitialLocation] = useState(location || null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [autoResetCamera, setAutoResetCamera] = useState(true);

    useEffect(() => {
        if (initialLocation) {
            resetMapCamera(initialLocation);
        }
    }, [initialLocation]);
    useEffect(() => {
        if (currentLocation) {
            props.setGlobalCurrentLocation(currentLocation);
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
                pitch: useGoogleMaps ? 30 : 0,
                heading: 0,
                altitude: altitude,
                zoom: mapZoom
            }, { duration: 400 });
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
            }, { duration: 400 });
        }
    }

    useEffect(() => {
        // console.log("randomChoice: ", randomChoice)
        if (randomChoice) {
            moveMapCamera({ latitude: randomChoice.lat, longitude: randomChoice.lon })
        } else {
            resetMapCamera(currentLocation);
            if (showPlaces) {
                setShowPLaces(showPlaces.sort((a, b) => b.lon - a.lon));
            }
        }
    }, [randomChoice]);

    const [filterText, setFilterText] = useState('');
    useEffect(() => {
        const { filterWishlist, filterCuisine, filterDistance } = props;

        if (filterWishlist && filterCuisine && filterDistance) {
            console.log("props.filterCuisine", filterCuisine);

            let filterText = '';
            const isWishlistNone = filterWishlist === 'None';
            const includesAllCuisine = filterCuisine.includes("All");
            const distanceText = filterDistance < 1 ? `${filterDistance * 1000}m` : `${filterDistance}km`;
            const wishlistPrefix = isWishlistNone ? '' : ` from '${filterWishlist}'`;

            if (includesAllCuisine) {
                filterText = `Anything${wishlistPrefix} in ${distanceText}`;
            } else {
                const cuisineText = filterCuisine.length > 1 ? `${filterCuisine.length} types` : filterCuisine;
                filterText = `${cuisineText}${wishlistPrefix} in ${distanceText}`;
            }

            setFilterText(filterText);
        }
    }, [props, props.filterWishlist, props.filterCuisine, props.filterDistance]);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                logoEnabled={false}
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
                rotateEnabled={false}
                loadingEnabled={true}
                // showsUserLocation={!useGoogleMaps && !randomChoice}
                // followsUserLocation={(!useGoogleMaps && !randomChoice && autoResetCamera)}
                showsPointsOfInterest={false}
                showsCompass={false}
                // tintColor='#7CE400'
                tintColor='#000'
                mapPadding={{ top: 100, right: 20, bottom: 170, left: 20 }}
                legalLabelInsets={{ bottom: 0, right: 20 }}
                onPanDrag={() => { setAutoResetCamera(false) }}
            >

                {(!randomChoice && showPlaces) &&
                    filterByTypes(showPlaces, props.filterCuisine)
                        .sort((a, b) => b.lon - a.lon)
                        .map((place, index) => {
                            // console.log(place);
                            const size = 0.8;

                            return (
                                <Marker 
                                    key={index}
                                    coordinate={{
                                        latitude: place.lat,
                                        longitude: place.lon
                                    }}
                                    zIndex={2}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={{ zIndex: 2 }}
                                        onPress={() => {
                                            props.setRandomChoice(place);
                                        }}
                                    >
                                        <Icon size={size} />
                                        <View style={{ height: 43 * size, width: '100%', position: 'absolute', top: 0, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 26 * size }}>{place.emoji}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Marker>
                            )
                        })}

                {!randomChoice && (
                    <Marker
                        coordinate={{
                            latitude: currentLocation ? currentLocation.coords.latitude : initialLocation.coords.latitude,
                            longitude: currentLocation ? currentLocation.coords.longitude : initialLocation.coords.longitude
                        }}
                        zIndex={1}
                        priority="High"
                        collapsable={false}
                    >
                        <View
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 0,
                                zIndex: 10
                            }}
                        >
                            <Image source={Picko} style={{ width: 47.5, height: 42, marginRight: 5.5 }} />
                        </View>
                    </Marker>
                )}

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
                    style={[styles.filterIndicator, (currentScreen != 'home') && { opacity: 0, pointerEvents: 'none' }]}
                    activeOpacity={1}
                // onPress={() => {
                //     hapticFeedback();
                //     props.setFilterOn(true);
                // }}
                >
                    <Text style={{ fontSize: 14, fontWeight: 700 }}>Filter:</Text>
                    <Text style={{ fontSize: 12, fontWeight: 400 }}>{filterText}</Text>
                </TouchableOpacity>

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
