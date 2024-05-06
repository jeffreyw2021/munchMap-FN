import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import styles from '../styles/detailModalStyle';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark, faDice, faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { faCircleQuestion, faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBookMark as solidBookMark } from '@fortawesome/free-solid-svg-icons';
import { getFetchedLocationsTable, getPlacesTable, RandomlyPickFromFetchedPlaces, fetchNearbyPlaces } from '../api/fetchNearbyPlaces';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('places.db');

export default function DetailModal({ globalCurrentLocation, filterDistance, randomChoice, setRandomChoice, setExitRandomChoice }) {

    const [detail, setDetail] = useState(null);
    const processDetail = (detail) => {
        const attributesToCheck = ['amenity', 'cuisine', 'craft', 'shop'];
        let output = [];

        if (detail && detail.attributes) {
            const attributes = typeof detail.attributes === 'string' ? JSON.parse(detail.attributes) : detail.attributes;

            attributesToCheck.forEach(attr => {
                if (attributes[attr]) {
                    if (attr === 'cuisine') {
                        output.push(...attributes[attr].split(';').map(item => item.replace(/_/g, ' ')));
                    } else {
                        output.push(attributes[attr].replace(/_/g, ' '));
                    }
                }
            });
        }

        return output;
    };
    const [tags, setTags] = useState(null);
    useEffect(() => {
        if (randomChoice) {
            setDetail(randomChoice);
            setTags(processDetail(randomChoice));
            console.log(processDetail(randomChoice));
            console.log("Detail: ", randomChoice);
        }
    }, [randomChoice]);
    const hapticFeedback = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const [cancelPressing, setCancelPressing] = useState(false);
    const [reRollPressing, setReRollPressing] = useState(false);
    const [learnMorePressing, setLearnMorePressing] = useState(false);
    const [navigatePressing, setNavigatePressing] = useState(false);
    const [savePressing, setSavePressing] = useState(false);

    let rollBtnGradWidth = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(rollBtnGradWidth, {
            toValue: reRollPressing ? 100 : 0,
            duration: reRollPressing ? 1500 : 500,
            useNativeDriver: false,
            easing: Easing.linear
        }).start();
        if (reRollPressing) {
            console.log("vibrate on");
        }
    }, [reRollPressing]);
    const widthInterpolation = rollBtnGradWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%']
    });
    useEffect(() => {
        let hapticInterval;

        if (reRollPressing) {
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
    }, [reRollPressing]);

    const position = useRef(new Animated.Value(500)).current;
    useEffect(() => {
        Animated.timing(position, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
        }).start();
    }, []);
    const closeModal = () => {
        Animated.timing(position, {
            toValue: 500,
            duration: 300,
            useNativeDriver: true
        }).start(() => {
            setRandomChoice(null);
            setExitRandomChoice(true);
        });
    };
    const [currentLocation, setCurrentLocation] = useState(null);
    useEffect(() => {
        if (globalCurrentLocation) {
            setCurrentLocation(globalCurrentLocation);
        }
    }, [globalCurrentLocation]);

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
            const fetchedPlaceId = await RandomlyPickFromFetchedPlaces(currentLocation.coords.latitude, currentLocation.coords.longitude, filterDistance, false);
            if (fetchedPlaceId) {
                console.log("Fetched Place ID: ", fetchedPlaceId);
                const placeDetails = await getPlaceDetailsById(fetchedPlaceId);
                setRandomChoice(placeDetails);
            } else {
                console.log("No new place was fetched or inserted.");
            }
        } catch (error) {
            console.error("Error during fetching and retrieving place details: ", error);
        }
    };

    return (
        <View style={styles.overcast}>
            <Animated.View style={[styles.detailBlock, {
                transform: [{ translateY: position }]
            }]}>
                <View style={styles.topContent}>
                    <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8 }}>
                        <Text style={{ fontWeight: '600', fontSize: 20 }}>{detail?.name}</Text>
                        <View style={styles.tagContainer}>
                            {tags && tags.map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={{ fontSize: 12 }}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPressIn={() => setSavePressing(true)}
                        onPressOut={() => setSavePressing(false)}
                        onPress={() => {
                            hapticFeedback();
                        }}
                    >
                        <View style={[styles.saveBtnContent, savePressing && { top: 3 }]}>
                            <FontAwesomeIcon icon={faBookmark} size={16} />
                        </View>
                        <View style={styles.saveBtnShadow} />
                    </TouchableOpacity>
                </View>
                <View style={{ width: '100%', rowGap: 15 }}>
                    <View style={styles.midBtns}>
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            activeOpacity={1}
                            onPressIn={() => setLearnMorePressing(true)}
                            onPressOut={() => setLearnMorePressing(false)}
                            onPress={() => {
                                hapticFeedback();
                            }}
                        >
                            <View style={[styles.learnMoreBtnContent, learnMorePressing && { top: 3 }]}>
                                <FontAwesomeIcon icon={faCircleQuestion} size={16} />
                                <Text style={{ fontWeight: '500' }}>Learn More</Text>
                            </View>
                            <View style={styles.learnMoreBtnShadow} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            activeOpacity={1}
                            onPressIn={() => setNavigatePressing(true)}
                            onPressOut={() => setNavigatePressing(false)}
                            onPress={() => {
                                hapticFeedback();
                            }}
                        >
                            <LinearGradient
                                style={[styles.navigateBtnContent, navigatePressing && { top: 3 }]}
                                colors={['#98FF47', '#D0FF6B']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <FontAwesomeIcon icon={faLocationArrow} size={16} />
                                <Text style={{ fontWeight: '500' }}>Navigate</Text>
                            </LinearGradient>
                            <View style={styles.navigateBtnShadow} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.bottomBtns}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPressIn={() => setCancelPressing(true)}
                        onPressOut={() => setCancelPressing(false)}
                        onPress={() => {
                            hapticFeedback();
                            closeModal();
                        }}
                    >
                        <View style={[styles.cancelBtnContent, cancelPressing && { top: 3 }]}>
                            <FontAwesomeIcon icon={faXmark} style={styles.cancelBtnIcon} size={18} />
                        </View>
                        <View style={styles.cancelBtnShadow} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPressIn={() => setReRollPressing(true)}
                        onPressOut={() => {
                            setReRollPressing(false);
                            rollForPlaces();
                        }}
                    >
                        <View style={[styles.reRollBtnContent, reRollPressing && { top: 3 }]}>
                            <FontAwesomeIcon icon={faDice} size={18} style={styles.rotatedIcon} />
                            <Text style={{ fontWeight: '700' }}>Re-Roll</Text>
                        </View>
                        <View style={[styles.reRollBtnBackground, reRollPressing && { top: 3 }]}>
                            <Animated.View
                                style={[styles.reRollBtnBackgroundInner, { width: widthInterpolation }]}>
                                <LinearGradient
                                    style={{ flex: 1 }}
                                    colors={['#98FF47', '#D0FF6B']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                />
                            </Animated.View>
                        </View>
                        <View style={styles.reRollShadow} />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    )
};