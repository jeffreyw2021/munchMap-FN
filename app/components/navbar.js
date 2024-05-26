import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import styles from '../styles/navbarStyle';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMap, faStore, faSliders, faDice } from '@fortawesome/free-solid-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { getFetchedLocationsTable, getPlacesTable, RandomlyPickFromFetchedPlaces, fetchNearbyPlaces } from '../api/fetchNearbyPlaces';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('places.db');

export default function Navbar({ props }) {

    const [isPressingHome, setIsPressingHome] = useState(false);
    const [isInHome, setIsInHome] = useState(true);
    const [isPressingStores, setIsPressingStores] = useState(false);
    const [isInStores, setIsInStores] = useState(false);
    const [isPressingFilter, setIsPressingFilter] = useState(false);
    const [isPressingRoll, setIsPressingRoll] = useState(false);
    let rollBtnGradWidth = useRef(new Animated.Value(0)).current;


    useEffect(() => {
        if (props.currentScreen) {
            if (props.currentScreen == "home") {
                setIsInHome(true);
                setIsInStores(false);
            }
            else if (props.currentScreen == "stores") {
                setIsInStores(true);
                setIsInHome(false);
            }
        }
    }, [props.currentScreen])

    const handleToHome = () => {
        props.updateScreen("home");
        setIsInHome(true);
        setIsInStores(false);
    }
    const handleToStores = () => {
        props.updateScreen("stores");
        setIsInStores(true);
        setIsInHome(false);
    }

    useEffect(() => {
        Animated.timing(rollBtnGradWidth, {
            toValue: isPressingRoll ? 100 : 0,
            duration: isPressingRoll ? 1500 : 500,
            useNativeDriver: false,
            easing: Easing.linear
        }).start();
        if (isPressingRoll) {
            handleToHome();
            console.log("vibrate on");
        }
    }, [isPressingRoll]);

    useEffect(() => {
        let hapticInterval;

        if (isPressingRoll) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

            hapticInterval = setInterval(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }, 150);
        } else {
            if (hapticInterval) {
                clearInterval(hapticInterval);
            }
        }
        return () => {
            if (hapticInterval) {
                clearInterval(hapticInterval);
            }
        };
    }, [isPressingRoll]);

    const widthInterpolation = rollBtnGradWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%']
    });
    const hapticFeedback = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const [currentLocation, setCurrentLocation] = useState(props.globalCurrentLocation || props.initialLocation);
    // useEffect(()=>{
    //     console.log("Global Location: ", currentLocation);
    // },[currentLocation]);
    useEffect(() => {
        if (props.globalCurrentLocation) {
            setCurrentLocation(props.globalCurrentLocation);
        }
    }, [props.globalCurrentLocation]);
    const getPlaceDetailsById = async (placeId) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `SELECT * FROM Places WHERE id = ?;`,
                    [placeId],
                    (_, { rows }) => {
                        if (rows.length > 0) {
                            resolve(rows._array[0]);
                        } else {
                            reject("No place found with the given ID.");
                        }
                    },
                    (_, error) => {
                        console.error('Failed to retrieve place details: ', error);
                        reject(error);
                    }
                );
            });
        });
    };
    const rollForPlaces = async () => {
        console.log("Current Location Latitude: ", currentLocation.coords.latitude, ", Longitude: ", currentLocation.coords.longitude);
        try {
            const fetchedPlaceId = await RandomlyPickFromFetchedPlaces(currentLocation.coords.latitude, currentLocation.coords.longitude, props.filterDistance, props.filterCuisine, false);
            console.log("Fetched Place ID: ", fetchedPlaceId);
            if (fetchedPlaceId) {
                console.log("Fetched Place ID: ", fetchedPlaceId);
                const placeDetails = await getPlaceDetailsById(fetchedPlaceId);
                props.setRandomChoice(placeDetails);
            } else {
                console.log("No new place was fetched or inserted.");
            }
        } catch (error) {
            console.error("Error during fetching and retrieving place details: ", error);
        }
    };

    const [filterText, setFilterText] = useState("Anything Nearby");
    useEffect(() => {
        if (props.filterWishlist) {
            if (props.filterWishlist === 'None') {
                setFilterText("Anything Nearby");
            } else {
                setFilterText(props.filterWishlist);
            }
        }
    }, [props.filterWishlist]);

    return (
        <View style={styles.overcast}>
            <View style={styles.navbar}>

                <TouchableOpacity
                    style={styles.navbtn}
                    activeOpacity={1}
                    onPressIn={() => setIsPressingFilter(true)}
                    onPressOut={() => setIsPressingFilter(false)}
                    onPress={() => {
                        hapticFeedback();
                        handleToHome();
                        props.setFilterOn(true);
                    }}
                >
                    <View style={[styles.navbtn, styles.btnContent, isPressingFilter && { top: 3 }]}>
                        <FontAwesomeIcon icon={faSliders} size={16} />
                    </View>
                    <View style={[styles.navbtn, styles.btnShadow]} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navbtn, styles.rollbtn]}
                    activeOpacity={1}
                    onPressIn={() => setIsPressingRoll(true)}
                    onPressOut={() => {
                        setIsPressingRoll(false);
                        rollForPlaces();
                    }}
                >
                    <View style={[styles.navbtn, styles.btnContent, styles.rollbtn, isPressingRoll && { top: 3 }]}>
                        <FontAwesomeIcon icon={faDice} size={18} />
                        <Text style={{ fontWeight: '700' }}>Roll</Text>
                    </View>
                    <View style={[styles.navbtn, styles.rollbtn, styles.btnGradBackground, isPressingRoll ? { top: 3, height: 37 } : { top: 0, height: 40 }]}>
                        <Animated.View
                            style={[styles.btnGradBackgroundInner, { width: widthInterpolation }]}>
                            <LinearGradient
                                style={{ flex: 1 }}
                                colors={['#98FF47', '#D0FF6B']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            />
                        </Animated.View>
                    </View>
                    <View style={[styles.navbtn, styles.rollbtn, styles.btnWhiteBackground, isPressingRoll ? { top: 3, height: 37 } : { top: 0, height: 40 }]}></View>
                    <View style={[styles.navbtn, styles.rollbtn, styles.btnShadow]} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navbtn}
                    activeOpacity={1}
                    onPressIn={() => setIsPressingHome(true)}
                    onPressOut={() => setIsPressingHome(false)}
                    onPress={() => { handleToHome(); hapticFeedback(); }}
                >
                    <LinearGradient
                        style={[styles.navbtn, styles.btnContent, isPressingHome && { top: 3 }]}
                        colors={isInHome ? ['#98FF47', '#D0FF6B'] : ['#ffffff', '#ffffff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <FontAwesomeIcon icon={faMap} size={16} />
                    </LinearGradient>
                    <View style={[styles.navbtn, styles.btnShadow]} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navbtn}
                    activeOpacity={1}
                    onPressIn={() => setIsPressingStores(true)}
                    onPressOut={() => setIsPressingStores(false)}
                    onPress={() => { handleToStores(); hapticFeedback(); }}
                >
                    <LinearGradient
                        style={[styles.navbtn, styles.btnContent, isPressingStores && { top: 3 }]}
                        colors={isInStores ? ['#98FF47', '#D0FF6B'] : ['#ffffff', '#ffffff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <FontAwesomeIcon icon={faStore} size={16} />
                    </LinearGradient>
                    <View style={[styles.navbtn, styles.btnShadow]} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
