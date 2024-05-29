import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import styles from '../styles/detailModalStyle';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark, faDice, faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { faCircleQuestion, faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as solidBookMark } from '@fortawesome/free-solid-svg-icons';
import { getFetchedLocationsTable, getSavedPlacesTable, RandomlyPickFromFetchedPlaces, fetchNearbyPlaces } from '../api/fetchNearbyPlaces';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('places.db');

export default function DetailModal({ props }) {

    const [detail, setDetail] = useState(null);
    const processDetail = (detail, processData = true) => {
        let attributesToCheck = ['amenity', 'cuisine', 'craft', 'shop'];
        let output = [];

        if (detail && detail.attributes) {
            const attributes = typeof detail.attributes === 'string' ? JSON.parse(detail.attributes) : detail.attributes;
            if (processData && attributes['cuisine'] && attributes['cuisine'] !== '') {
                attributesToCheck = ['cuisine', 'craft', 'shop'];
            }

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

        return output.slice(0, 3);
    };
    const [tags, setTags] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    useEffect(() => {
        if (props.randomChoice) {
            setDetail(props.randomChoice);
            setTags(processDetail(props.randomChoice, false));
            isPlaceSaved(props.randomChoice.id)
                .then(isSaved => {
                    setIsSaved(isSaved);
                })
                .catch(error => {
                    console.error('Failed to check if place is saved: ', error);
                });
        }
    }, [props.randomChoice]);
    useEffect(() => {
        if (isSaved) {
            console.log("isSaved: ", isSaved);
        }
    }, [isSaved]);
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
            props.setRandomChoice(null);
            props.setExitRandomChoice(true);
        });
    };
    const [currentLocation, setCurrentLocation] = useState(null);
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
        props.setLoaderOn(true); // Turn on the loader before starting the fetch operation
        try {
            const fetchedPlaceId = await RandomlyPickFromFetchedPlaces(currentLocation.coords.latitude, currentLocation.coords.longitude, props.filterDistance, props.filterCuisine, false);
            console.log("Fetched Place ID: ", fetchedPlaceId);
            if (fetchedPlaceId) {
                const placeDetails = await getPlaceDetailsById(fetchedPlaceId);
                props.setRandomChoice(placeDetails);
            } else {
                console.log("No new place was fetched or inserted.");
            }
        } catch (error) {
            console.error("Error during fetching and retrieving place details: ", error);
        } finally {
            props.setLoaderOn(false); // Turn off the loader regardless of success or failure
        }
    };    

    const savePlaceToSavedPlaces = async (placeId) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM Places WHERE id = ?;`,
                [placeId],
                (_, result) => {
                    if (result.rows.length > 0) {
                        const place = result.rows.item(0);
                        tx.executeSql(
                            `SELECT id FROM savedPlaces WHERE id = ?;`,
                            [placeId],
                            (_, checkResult) => {
                                if (checkResult.rows.length === 0) {
                                    tx.executeSql(
                                        `INSERT INTO savedPlaces (id, name, lat, lon, attributes, emoji) VALUES (?, ?, ?, ?, ?, ?);`,
                                        [place.id, place.name, place.lat, place.lon, place.attributes, place.emoji],
                                        () => console.log(`Place ${place.name} saved successfully`),
                                        (_, error) => console.error(`Failed to save place ${place.name}: `, error)
                                    );
                                    setIsSaved(true);
                                    props.setMapRenderFlag(!props.mapRenderFlag);
                                    getSavedPlacesTable()
                                        .then(places => {
                                            props.setGlobalSavedPlaces(places);
                                        })
                                        .catch(error => {
                                            console.error('Failed to fetch saved places: ', error);
                                        });
                                } else {
                                    console.log('Place already saved in savedPlaces');
                                    setIsSaved(true);
                                }
                            },
                            (_, error) => console.error(`Failed to check savedPlaces: `, error)
                        );
                    } else {
                        console.error('No place found with ID:', placeId);
                    }
                },
                (_, error) => console.error('Failed to retrieve place details: ', error)
            );
        });
    };

    const removePlaceFromSavedPlaces = async (placeId) => {
        db.transaction(tx => {
            tx.executeSql(
                `DELETE FROM savedPlaces WHERE id = ?;`,
                [placeId],
                (_, result) => {
                    if (result.rowsAffected > 0) {
                        console.log(`Place with ID ${placeId} removed from savedPlaces successfully.`);
                        props.setMapRenderFlag(!props.mapRenderFlag);
                        setIsSaved(false);
                        getSavedPlacesTable()
                        .then(places => {
                            props.setGlobalSavedPlaces(places);
                        })
                        .catch(error => {
                            console.error('Failed to fetch saved places: ', error);
                        });
                    } else {
                        console.log(`No place found with ID ${placeId} in savedPlaces or failed to delete.`);
                    }
                },
                (_, error) => {
                    console.error(`Failed to delete place from savedPlaces: `, error);
                }
            );
        });
    };

    const isPlaceSaved = async (placeId) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `SELECT id FROM savedPlaces WHERE id = ?;`,
                    [placeId],
                    (_, result) => {
                        if (result.rows.length > 0) {
                            resolve(true); // The place is saved
                        } else {
                            resolve(false); // The place is not saved
                        }
                    },
                    (_, error) => {
                        console.error('Error checking if place is saved: ', error);
                        reject(error);
                    }
                );
            });
        });
    };

    return (
        <View style={styles.overcast}>
            <Animated.View style={[styles.detailBlock, {
                transform: [{ translateY: position }]
            }]}>
                <View style={[styles.topContent, { width: '100%' }]}>
                    <View style={{ flex: 1, gap: 30, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8 }}>
                        <Text
                            style={{ fontWeight: '600', fontSize: 20, overflow: 'hidden'}}
                            ellipsizeMode='tail'
                            numberOfLines={1}
                        >
                            {detail?.name}
                        </Text>
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
                            if (detail && detail.id) {
                                if (isSaved) {
                                    removePlaceFromSavedPlaces(detail.id);
                                } else {
                                    savePlaceToSavedPlaces(detail.id);
                                }
                            }
                        }}
                    >
                        {isSaved ? (
                            <LinearGradient
                                style={[styles.saveBtnContent, savePressing && { top: 3 }]}
                                colors={['#98FF47', '#D0FF6B']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <FontAwesomeIcon icon={solidBookMark} size={16} />
                            </LinearGradient>
                        ) : (
                            <View style={[styles.saveBtnContent, savePressing && { top: 3 }]}>
                                <FontAwesomeIcon icon={faBookmark} size={16} />
                            </View>
                        )}
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
                        onPressIn={() => !props.loaderOn && setReRollPressing(true)}
                        onPressOut={() => {
                            !props.loaderOn && setReRollPressing(false);
                            !props.loaderOn && rollForPlaces();
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
            </Animated.View >
        </View >
    )
};